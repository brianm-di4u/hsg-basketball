# Retargets CMU motion capture (BVH, Bruce Hahne's 2010 conversion; see art-src/anim/SOURCES.md) onto the game's
# rig and writes art-src/anim/cmu-clips.json for tools/build-anims.mjs.
#
#   blender -b art-src/blender/players/players-hq.blend --python art-src/blender/anim/retarget_cmu.py -- [survey TAKE]
#
# A clip is stored the way the runtime poses a player (src/js/gl/players3d.js applyPose): per bone, a rotation Δ in
# the character's own frame (three.js axes: x = its left, y = up, z = forward) applied on top of the rest pose and
# composed down the hierarchy. That makes a clip independent of bone rolls, so the same data drives the HQ bodies
# and the lite mannequins.
#
# Per frame and bone: T = W_posed · W_rest⁻¹ (the BVH bone's change in world), the take's heading removed, then
# C (the turn from our A-pose rest direction to the BVH T-pose rest direction) so our bone points where the
# performer's did: T_ours = T · C, and Δ = T_ours(parent)⁻¹ · T_ours(bone).
import bpy, sys, os, json, math
from mathutils import Quaternion, Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
CMU = os.path.join(GAME, 'art-src', 'anim', 'cmu')
OUT = os.path.join(GAME, 'art-src', 'anim', 'cmu-clips.json')
FPS = 30
SRC_FPS = 120

# our bone ← the performer's bone
MAP = {'hips': 'Hips', 'spine': 'LowerBack', 'chest': 'Spine1', 'neck': 'Neck', 'head': 'Head',
       'clavicle_L': 'LeftShoulder', 'upperarm_L': 'LeftArm', 'forearm_L': 'LeftForeArm', 'hand_L': 'LeftHand',
       'clavicle_R': 'RightShoulder', 'upperarm_R': 'RightArm', 'forearm_R': 'RightForeArm', 'hand_R': 'RightHand',
       'thigh_L': 'LeftUpLeg', 'shin_L': 'LeftLeg', 'foot_L': 'LeftFoot',
       'thigh_R': 'RightUpLeg', 'shin_R': 'RightLeg', 'foot_R': 'RightFoot'}
PARENT = {'hips': None, 'spine': 'hips', 'chest': 'spine', 'neck': 'chest', 'head': 'neck',
          'clavicle_L': 'chest', 'upperarm_L': 'clavicle_L', 'forearm_L': 'upperarm_L', 'hand_L': 'forearm_L',
          'clavicle_R': 'chest', 'upperarm_R': 'clavicle_R', 'forearm_R': 'upperarm_R', 'hand_R': 'forearm_R',
          'thigh_L': 'hips', 'shin_L': 'thigh_L', 'foot_L': 'shin_L', 'thigh_R': 'hips', 'shin_R': 'thigh_R', 'foot_R': 'shin_R'}
# bones whose rest direction we match (the trunk and head keep the performer's rotation as it is)
AIM = {'clavicle_L', 'upperarm_L', 'forearm_L', 'clavicle_R', 'upperarm_R', 'forearm_R', 'thigh_L', 'shin_L', 'foot_L', 'thigh_R', 'shin_R', 'foot_R'}

# name: (take, first source frame, last source frame, loop, mirror)  frames are 120 fps source frames
CLIPS = {}
try:
    with open(os.path.join(HERE, 'cmu_clips.json')) as f: CLIPS = json.load(f)
except FileNotFoundError:
    pass

def log(*a): print('[anim]', *a)

rig = bpy.data.objects['RigM']
REST = {}
for n in MAP:
    b = rig.data.bones[n]
    REST[n] = (rig.matrix_world.to_3x3() @ (b.tail_local - b.head_local)).normalized()
OUR_HIP = (rig.matrix_world @ rig.data.bones['hips'].head_local).z

def load_take(take):
    for o in list(bpy.data.objects):
        if o.name.startswith('BVH_'): bpy.data.objects.remove(o)
    bpy.ops.import_anim.bvh(filepath=os.path.join(CMU, take + '.bvh'), global_scale=0.056444, frame_start=1,
                            use_fps_scale=False, rotate_mode='NATIVE', axis_forward='-Z', axis_up='Y')
    a = bpy.context.active_object
    a.name = 'BVH_' + take
    return a

def world_q(a, pb): return (a.matrix_world @ pb.matrix).to_quaternion()

def sample(a, f):
    bpy.context.scene.frame_set(f)
    return {n: (a.matrix_world @ a.pose.bones[s].matrix) for n, s in MAP.items()}

def heading_of(m):
    # the hips' forward (-y in Blender) on the floor
    fwd = m.to_3x3() @ Vector((0, -1, 0))
    return math.atan2(fwd.x, -fwd.y)

def survey(take, step=12, f_a=None, f_b=None):
    a = load_take(take)
    fs, fe = (int(v) for v in a.animation_data.action.frame_range)
    for f in range(f_a or fs, (f_b or fe) + 1, step):
        bpy.context.scene.frame_set(f)
        P = {s: a.matrix_world @ a.pose.bones[s].head for s in ('Hips', 'LeftFoot', 'RightFoot', 'LeftHand', 'RightHand', 'Head')}
        print('S %5d hz %.2f x %.2f y %.2f lf %.2f rf %.2f lh %.2f rh %.2f hd %.2f' % (f, P['Hips'].z, P['Hips'].x, P['Hips'].y,
              P['LeftFoot'].z, P['RightFoot'].z, P['LeftHand'].z, P['RightHand'].z, P['Head'].z))

def to_three(q):
    # Blender (x, y, z) → three.js (x, z, -y): a proper rotation, so a quaternion maps component-wise
    return [q.x, q.z, -q.y, q.w]

def export_clip(name, take, f0, f1, loop):
    a = load_take(take)
    rest = {n: (a.matrix_world @ a.data.bones[s].matrix_local) for n, s in MAP.items()}
    rest_q = {n: m.to_quaternion() for n, m in rest.items()}
    C = {}
    for n, s in MAP.items():
        if n in AIM:
            b = a.data.bones[s]
            d = (a.matrix_world.to_3x3() @ (b.tail_local - b.head_local)).normalized()
            C[n] = REST[n].rotation_difference(d)
        else: C[n] = Quaternion()
    for side in ('L', 'R'): C['hand_' + side] = C['forearm_' + side]
    # floor and size: the performer's ankles over the take (a low percentile), hip-over-ankle against ours
    ank, toe = [], []
    for f in range(f0, f1 + 1, 4):
        bpy.context.scene.frame_set(f)
        for s in ('LeftFoot', 'RightFoot'): ank.append((a.matrix_world @ a.pose.bones[s].head).z)
        for s in ('LeftToeBase', 'RightToeBase'): toe.append((a.matrix_world @ a.pose.bones[s].head).z)
    ank.sort(); toe.sort()
    ank0, toe0 = ank[len(ank) // 50], toe[len(toe) // 50]
    rh = (a.matrix_world @ a.data.bones['Hips'].head_local).z
    rf = min((a.matrix_world @ a.data.bones[s].head_local).z for s in ('LeftFoot', 'RightFoot'))
    scale = (OUR_HIP - 0.077) / (rh - rf)        # hip over ankle, ours / theirs
    step = SRC_FPS // FPS
    frames = list(range(f0, f1 + 1, step))
    heads, mats, hips, cont, toes = [], [], [], [], []
    for f in frames:
        M = sample(a, f); mats.append(M)
        heads.append(heading_of(M['hips'])); hips.append(M['hips'].to_translation())
        toes.append([a.matrix_world @ a.pose.bones[s].head for s in ('LeftToeBase', 'RightToeBase')])
        anks = [(a.matrix_world @ a.pose.bones[s].head).z for s in ('LeftFoot', 'RightFoot')]
        cont.append([anks[k] - ank0 < 0.035 or toes[-1][k].z - toe0 < 0.025 for k in (0, 1)])
    # a planted foot also stands still on the floor
    c = []
    for i in range(len(frames)):
        j = min(len(frames) - 1, i + 1); i0 = j - 1
        bits = 0
        for k in (0, 1):
            v = math.hypot(toes[j][k].x - toes[i0][k].x, toes[j][k].y - toes[i0][k].y) * FPS
            if cont[i][k] and v < 0.7: bits |= 1 << k
        c.append(bits)
    # a smoothed heading (half a second each way), unwrapped, so the pelvis keeps its own swing
    un = [heads[0]]
    for h in heads[1:]:
        d = (h - un[-1] + math.pi) % (2 * math.pi) - math.pi; un.append(un[-1] + d)
    W = FPS // 2
    sm = [sum(un[max(0, i - W):i + W + 1]) / len(un[max(0, i - W):i + W + 1]) for i in range(len(un))]
    tracks = {n: [] for n in MAP}; dy = []
    for i, M in enumerate(mats):
        Hinv = Quaternion((0, 0, 1), -sm[i])
        T = {n: Hinv @ (M[n].to_quaternion() @ rest_q[n].inverted()) @ C[n] for n in MAP}
        for n in MAP:
            p = PARENT[n]
            d = T[n] if p is None else T[p].inverted() @ T[n]
            d.normalize()
            tracks[n].append(d)
        dy.append(((hips[i].z - ank0) - (rh - rf)) * scale)
    # ground speed: net travel of the hips, in our metres per second (for stride matching)
    speed = math.hypot(hips[-1].x - hips[0].x, hips[-1].y - hips[0].y) * scale / max(1e-6, (len(hips) - 1) / FPS)
    if loop:
        # the range is one whole cycle: its last frame is its first again, so drop it and spread the small
        # mismatch over the cycle (no pop at the seam)
        N = len(frames) - 1
        for n, qs in tracks.items():
            D = qs[0] @ qs[N].inverted()
            if D.w < 0: D.negate()
            for i in range(N): qs[i] = Quaternion().slerp(D, i / N) @ qs[i]
            del qs[N:]
        e = dy[0] - dy[N]
        dy = [dy[i] + e * i / N for i in range(N)]
        frames = frames[:N]; c = c[:N]
    out = {'fps': FPS, 'n': len(frames), 'loop': bool(loop), 'speed': round(speed, 3), 'src': '%s:%d-%d' % (take, f0, f1),
           'dy': [round(v, 4) for v in dy], 'c': c, 'q': {}}
    for n, qs in tracks.items():
        # keep each track on one hemisphere so the runtime's slerp/nlerp takes the short way
        prev = None; flat = []
        for q in qs:
            t = to_three(q)
            if prev and sum(x * y for x, y in zip(t, prev)) < 0: t = [-x for x in t]
            prev = t; flat += [round(x, 4) for x in t]
        out['q'][n] = flat
    log(name, take, f0, f1, 'frames', len(frames), 'speed m/s', round(speed, 2), 'scale', round(scale, 3))
    return out

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
if args and args[0] == 'survey':
    survey(args[1], *(int(v) for v in args[2:]))
else:
    res = {}
    for name, spec in CLIPS.items():
        res[name] = export_clip(name, *spec)
    with open(OUT, 'w') as f: json.dump(res, f, separators=(',', ':'))
    log('wrote', OUT, len(res), 'clips')
