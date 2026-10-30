# Builds the high-quality player bodies (M and F builds) from MPFB 2 / MakeHuman (CC0 output) and exports
# art-src/players-hq.glb for the HQ art package (tools/build-hq.mjs).
#
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup --python art-src/blender/players/build_bodies_hq.py
#
# Art direction (review/CAMPAIGN-LOG.md): a stylized, animated-film athlete. Slightly larger head and eyes, real
# eyes with iris and catchlight, a modelled nose, ears and lips, five-finger hands, a jersey and shorts with
# piped edges and side panels, socks, sneakers with a white sole, wristbands.
#
# The game colours each player at run time, so the mesh carries no colours, only a zone code per face (a float
# colour attribute "zone", value = id / 16): see ZONES and src/js/gl/players3d.js (kit3).
# The game_engine skeleton is renamed so the runtime's 19 bone names are a subset (hips, spine, chest, ...); the
# arms are re-posed to the runtime's A-pose before the rest pose is applied, so its procedural poses carry over.
# MPFB is loaded from tools/dev/mpfb as a session-only extension repository: nothing is saved to Blender's prefs.
import bpy, bmesh, os, sys, math, json, addon_utils
from mathutils import Vector, Matrix
from mathutils.kdtree import KDTree

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
MPFB_DIR = os.path.join(GAME, 'tools', 'dev', 'mpfb')
OUT = os.path.join(GAME, 'art-src', 'players-hq.glb')
H = 1.86            # rest height in metres (players3d.js MODEL_H)
ARM_DEG = 25.0      # upper arm angle from vertical in the runtime's rest pose (art-src/blender/build_players.py)
ZONES = dict(skin=0, jersey=1, trim=2, shorts=3, stripe=4, sock=5, shoe=6, sole=7, hair=8, sclera=9, iris=10,
             pupil=11, brow=12, lips=13, wrist=14)
RENAME = {'pelvis': 'hips', 'spine_01': 'spine', 'spine_03': 'chest', 'neck_01': 'neck', 'head': 'head',
          'clavicle_l': 'clavicle_L', 'clavicle_r': 'clavicle_R', 'upperarm_l': 'upperarm_L', 'upperarm_r': 'upperarm_R',
          'lowerarm_l': 'forearm_L', 'lowerarm_r': 'forearm_R', 'hand_l': 'hand_L', 'hand_r': 'hand_R',
          'thigh_l': 'thigh_L', 'thigh_r': 'thigh_R', 'calf_l': 'shin_L', 'calf_r': 'shin_R', 'foot_l': 'foot_L', 'foot_r': 'foot_R'}

bpy.ops.wm.read_factory_settings(use_empty=True)

# ---------------------------------------------------------------- MPFB, session only
repos = bpy.context.preferences.extensions.repos
if not any(r.module == 'hsgdev' for r in repos):
    r = repos.new(name='hsgdev', module='hsgdev', custom_directory=MPFB_DIR, source='USER')
    r.use_custom_directory = True
addon_utils.enable('bl_ext.hsgdev.mpfb', default_set=True, persistent=False)
from bl_ext.hsgdev.mpfb.services.humanservice import HumanService
from bl_ext.hsgdev.mpfb.services.targetservice import TargetService

def log(*a): print('[players]', *a)

def group_centroid(obj, name):
    gi = obj.vertex_groups[name].index
    pts = [obj.matrix_world @ v.co for v in obj.data.vertices if any(g.group == gi and g.weight > 0.5 for g in v.groups)]
    return sum(pts, Vector()) / max(1, len(pts))

def weight_sum(v, idxs):
    return sum(g.weight for g in v.groups if g.group in idxs)

# ---------------------------------------------------------------- one build
def build(bid):
    female = bid == 'F'
    macro = {'gender': 0.0 if female else 1.0, 'age': 0.36, 'muscle': 0.72, 'weight': 0.45, 'proportions': 0.85,
             'height': 0.8, 'cupsize': 0.45, 'firmness': 0.6, 'race': {'asian': 0.33, 'caucasian': 0.33, 'african': 0.34}}
    human = HumanService.create_human(mask_helpers=False, detailed_helpers=True, extra_vertex_groups=True,
                                      feet_on_ground=True, scale=0.1, macro_detail_dict=macro)
    # the stylization: a slightly larger head, bigger eyes
    for t, w in [('l-eye-scale-incr', 1.0), ('r-eye-scale-incr', 1.0), ('head-scale-vert-incr', 0.25),
                 ('head-scale-horiz-incr', 0.22), ('head-scale-depth-incr', 0.18)]:
        path = TargetService.target_full_path(t)
        if path: TargetService.load_target(human, path, weight=w)
        else: log('missing target', t)
    TargetService.bake_targets(human)
    # joints we need later (from the joint cubes, before they go)
    J = {n: group_centroid(human, n) for n in ['joint-l-eye', 'joint-r-eye', 'joint-mouth', 'joint-l-hand', 'joint-r-hand',
                                                'joint-head', 'joint-head-2', 'joint-neck']}
    rig = HumanService.add_builtin_rig(human, 'game_engine')
    bpy.context.view_layer.update()

    # ---- keep the body, the eyes and the scalp hair; drop every other helper and the joint cubes
    keep = {'body', 'helper-l-eye', 'helper-r-eye'}  # (MPFB's hair helper is long strands: hair is painted and modelled in the game)
    vg = {g.name: g.index for g in human.vertex_groups}
    eyes_i = {vg['helper-l-eye'], vg['helper-r-eye']}
    hair_i = set()
    keep_i = {vg[n] for n in keep}
    bm = bmesh.new(); bm.from_mesh(human.data)
    dl = bm.verts.layers.deform.active
    kill = [v for v in bm.verts if not any(gi in keep_i and w > 0.5 for gi, w in v[dl].items())]
    bmesh.ops.delete(bm, geom=kill, context='VERTS')
    bm.to_mesh(human.data); bm.free()

    # ---- scale to the runtime's rest height
    z = [human.matrix_world @ v.co for v in human.data.vertices]
    top = max(p.z for p in z); s = H / top
    rig.scale = (s, s, s)
    bpy.ops.object.select_all(action='DESELECT'); rig.select_set(True); human.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for k in J: J[k] = J[k] * s
    log(bid, 'scaled', round(s, 4), 'verts', len(human.data.vertices))

    # ---- rename the bones (and their vertex groups) so the runtime's names are a subset
    for old, new in RENAME.items():
        if old in rig.data.bones: rig.data.bones[old].name = new
        if old in human.vertex_groups: human.vertex_groups[old].name = new

    # ---- re-pose the arms to the runtime's A-pose, then make it the rest pose
    bpy.ops.object.select_all(action='DESELECT'); rig.select_set(True); bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='POSE')
    for side, sx in (('L', 1), ('R', -1)):
        pb = rig.pose.bones['upperarm_' + side]
        h, t = pb.head.copy(), pb.tail.copy()
        cur = (t - h).normalized()
        a = math.radians(ARM_DEG)
        tgt = Vector((sx * math.sin(a), cur.y * 0.3, -math.cos(a))).normalized()
        rot = cur.rotation_difference(tgt).to_matrix().to_4x4()
        pb.matrix = Matrix.Translation(h) @ rot @ Matrix.Translation(-h) @ pb.matrix
        bpy.context.view_layer.update()
    bpy.ops.object.mode_set(mode='OBJECT')
    mod = next(m for m in human.modifiers if m.type == 'ARMATURE')
    bpy.context.view_layer.objects.active = human
    bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='POSE'); bpy.ops.pose.armature_apply(selected=False); bpy.ops.object.mode_set(mode='OBJECT')
    m = human.modifiers.new('Armature', 'ARMATURE'); m.object = rig
    # the hands moved with the arms: re-read their joints from the posed mesh
    for side in ('l', 'r'):
        b = rig.data.bones['hand_' + side.upper()]
        J['joint-%s-hand' % side] = rig.matrix_world @ b.head_local

    # (no decimation: MakeHuman's quad loops run along the wrists, waist and neck, so zone edges stay clean; about
    # 28k triangles a body is inside the real-time budget)

    # ---- clothes: shells duplicated from the body, pushed out along the normals
    vg = {g.name: g.index for g in human.vertex_groups}
    arm_i = {vg[n] for n in vg if n.startswith(('upperarm_', 'forearm_', 'hand_', 'lowerarm', 'thumb', 'index', 'middle', 'ring', 'pinky'))}
    headneck_i = {vg[n] for n in ('head', 'neck') if n in vg}
    leg_lo_i = {vg[n] for n in vg if n.startswith(('shin_', 'calf', 'foot_', 'ball_'))}
    bm = bmesh.new(); bm.from_mesh(human.data)
    zl = bm.faces.layers.int.new('zone')   # before any face references are taken (adding a layer invalidates them)
    dl = bm.verts.layers.deform.active
    bm.normal_update()
    zone_of = {}   # face index (in the final bmesh) -> zone
    def is_eye(f): return all(any(gi in eyes_i and w > 0.5 for gi, w in v[dl].items()) for v in f.verts)
    def is_hair(f): return all(any(gi in hair_i and w > 0.5 for gi, w in v[dl].items()) for v in f.verts)
    def wsum(v, idxs): return sum(w for gi, w in v[dl].items() if gi in idxs)
    body_faces = [f for f in bm.faces if not is_eye(f) and not is_hair(f)]
    def shell(pred, offset, name):
        faces = [f for f in body_faces if pred(f)]
        res = bmesh.ops.duplicate(bm, geom=faces)
        nf = [g for g in res['geom'] if isinstance(g, bmesh.types.BMFace)]
        nv = {v for f in nf for v in f.verts}
        for v in nv: v.co += v.normal * offset(v)
        return nf
    zc = lambda f: f.calc_center_median().z
    # a tank top: below the armpits everything but the arms; above, straps that narrow toward a scooped neckline
    def in_jersey(f):
        c = f.calc_center_median(); ax = abs(c.x)
        if not 0.985 < c.z < 1.56: return False
        if c.z < 1.29: return all(wsum(v, arm_i) < 0.5 for v in f.verts)
        # generous: the game's kit shader cuts the real neckline and armholes as smooth curves (players3d.js kit3)
        lim = 0.24 if c.z < 1.36 else 0.24 - (c.z - 1.36) * 0.38
        neck = (1.46 + 1.1 * ax) if c.y < 0 else (1.51 + 0.6 * ax)
        return ax < lim and c.z < neck
    hcen = (J['joint-head'] + J['joint-head-2']) / 2
    def cap_face(f):
        d = f.calc_center_median() - hcen
        back = max(0.0, min(1.0, (d.y + 0.04) / 0.12))
        return d.z > 0.03 - 0.115 * back and d.length < 0.2 and not (abs(d.x) > 0.078 and d.z < 0.0 and back < 0.75)
    cap = shell(cap_face, lambda v: 0.007 + 0.006 * max(0.0, (v.co.z - hcen.z) / 0.1), 'cap')
    capv = list({v for f in cap for v in f.verts})
    for _ in range(2): bmesh.ops.smooth_vert(bm, verts=capv, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
    jersey = shell(lambda f: in_jersey(f) and f.calc_center_median().z > 0.96, lambda v: 0.02 + 0.014 * max(0.0, (1.12 - v.co.z) / 0.14), 'jersey')
    jv = list({v for f in jersey for v in f.verts})
    names = {g.index: g.name for g in human.vertex_groups}
    clav = {s_: vg['clavicle_' + s_] for s_ in ('L', 'R')}
    for v in jv:
        d = v[dl]; moved = {'L': 0.0, 'R': 0.0}
        for gi in list(d.keys()):
            n = names.get(gi, '')
            if n.startswith(('upperarm_', 'forearm_', 'hand_')):
                moved[n[-1]] += d[gi]; del d[gi]
        for s_, w in moved.items():
            if w > 0: d[clav[s_]] = d.get(clav[s_], 0.0) + w
    for _ in range(3): bmesh.ops.smooth_vert(bm, verts=jv, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=False)  # cloth hangs over the body's detail
    shorts = shell(lambda f: 0.53 < zc(f) < 1.1 and all(wsum(v, arm_i) < 0.3 for v in f.verts),
                   lambda v: 0.014 + 0.032 * max(0.0, min(1.0, (0.95 - v.co.z) / 0.39)), 'shorts')
    shoes = shell(lambda f: zc(f) < 0.112 and all(wsum(v, leg_lo_i) > 0.3 for v in f.verts), lambda v: 0.024, 'shoes')
    sv = list({v for f in shoes for v in f.verts})
    for _ in range(8): bmesh.ops.smooth_vert(bm, verts=sv, factor=0.6, use_axis_x=True, use_axis_y=True, use_axis_z=True)  # toes into a rounded toe box
    bm.normal_update()
    for v in sv: v.co += v.normal * 0.008
    for v in sv:
        v.co.x *= 1.04
        if v.co.z < 0.02: v.co.z = 0.0   # a flat sole on the floor

    # ---- zones (a face layer that survives into the mesh as an integer face attribute)
    def boundary_tree(faces):
        fs_ = set(faces)
        vs = {v for f in faces for v in f.verts for e in v.link_edges if e.is_boundary and any(lf in fs_ for lf in e.link_faces)}
        kd = KDTree(max(1, len(vs)))
        for i, v in enumerate(vs): kd.insert(v.co, i)
        kd.balance(); return kd, len(vs)
    done = set()
    # smooth per-vertex values the shader turns into crisp, curved edges: G = distance to the shell's open edge
    # (piping on the collar, armholes and hems), B = how much the surface faces sideways (shorts side panels)
    edge_d = {}
    for faces in (jersey, shorts):
        kd, n = boundary_tree(faces)
        for v in {v for f in faces for v in f.verts}: edge_d[v] = kd.find(v.co)[2] if n else 1.0
    side = {v: max(0.0, v.normal.x * (1 if v.co.x > 0 else -1)) for f in shorts for v in f.verts}  # outer sides only
    for f in jersey: f[zl] = ZONES['jersey']; done.add(f)
    for f in shorts: f[zl] = ZONES['shorts']; done.add(f)
    for f in shoes: f[zl] = ZONES['shoe']; done.add(f)            # soles and midsole are cut per pixel
    for f in cap: f[zl] = ZONES['hair']; done.add(f)
    le, re_, mo = J['joint-l-eye'], J['joint-r-eye'], J['joint-mouth']
    hl, hr = J['joint-l-hand'], J['joint-r-hand']
    fwd = Vector((0, -1, 0))
    hc = (J['joint-head'] + J['joint-head-2']) / 2
    def is_scalp(c):
        d = c - hc
        back = max(0.0, min(1.0, (d.y + 0.04) / 0.12))            # 0 at the brow, 1 at the back of the head
        line = 0.045 - 0.105 * back                                 # hairline height above the head centre
        ear = abs(d.x) > 0.075 and d.z < 0.02 and back < 0.7        # keep the ears and temples clear
        return d.z > line and not ear and d.length < 0.2
    for f in bm.faces:
        if f in done: continue
        c = f.calc_center_median()
        if is_eye(f):
            f[zl] = ZONES['sclera']
        elif c.z < 0.115 and abs(c.x) < 0.2: f[zl] = ZONES['shoe']                       # the foot inside the shoe
        elif 0.115 <= c.z < 0.30 and abs(c.x) < 0.2: f[zl] = ZONES['stripe'] if 0.255 < c.z < 0.275 else ZONES['sock']
        else: f[zl] = ZONES['skin']
    bm.verts.index_update()
    EDGE = [edge_d.get(v, 1.0) for v in bm.verts]
    SIDE = [side.get(v, 0.0) for v in bm.verts]
    bm.to_mesh(human.data); bm.free()

    # face zones -> a float colour per face corner (exported as COLOR_0; the game reads zone = round(r * 16))
    me = human.data
    za = me.attributes['zone']
    col = me.color_attributes.new('zonecol', 'FLOAT_COLOR', 'CORNER')
    for p in me.polygons:
        zv = za.data[p.index].value / 16.0
        for li in p.loop_indices:
            vi = me.loops[li].vertex_index
            col.data[li].color = (zv, min(1.0, EDGE[vi] * 10.0), SIDE[vi], 1.0)
    me.attributes.remove(za)
    me.color_attributes.active_color = me.color_attributes['zonecol']
    me.color_attributes.render_color_index = me.color_attributes.find('zonecol')
    me.materials.clear()
    mat = bpy.data.materials.get('kit') or bpy.data.materials.new('kit')
    me.materials.append(mat)

    # ---- where the runtime hangs numbers and hair (rig-local metres, glTF y-up handled by the exporter)
    jverts = [human.matrix_world @ v.co for v in me.vertices]
    chest = [p for p in jverts if 1.28 < p.z < 1.38 and abs(p.x) < 0.06]
    front_y = min(p.y for p in chest) if chest else -0.15
    back_y = max(p.y for p in chest) if chest else 0.14
    hc = (J['joint-head'] + J['joint-head-2']) / 2
    head_pts = [p for p in jverts if p.z > hc.z - 0.02]
    head_r = max(((p - hc).length for p in head_pts), default=0.11)
    # glTF: x stays, y_gltf = z_blender, z_gltf = -y_blender
    rig['hsg'] = json.dumps({'numFront': [0, 1.33, -front_y + 0.004], 'numBack': [0, 1.35, -back_y - 0.004],
                             'headCenter': [0, hc.z, -hc.y], 'headRadius': head_r, 'H': H,
                             'eye': [abs(J['joint-l-eye'].x), J['joint-l-eye'].z, -J['joint-l-eye'].y],
                             'mouth': [0, J['joint-mouth'].z, -J['joint-mouth'].y],
                             'hand': [abs(J['joint-l-hand'].x), J['joint-l-hand'].z, -J['joint-l-hand'].y]})
    rig.name = rig.data.name = 'Rig' + bid
    human.name = human.data.name = 'Body' + bid
    log(bid, 'faces', len(me.polygons), 'front', round(front_y, 3), 'back', round(back_y, 3), 'head r', round(head_r, 3))
    return human, rig

objs = []
for bid in ('M', 'F'):
    objs += list(build(bid))
bpy.ops.object.select_all(action='DESELECT')
for o in objs: o.select_set(True)
kw = dict(filepath=OUT, export_format='GLB', use_selection=True, export_extras=True, export_yup=True, export_apply=False,
          export_animations=False, export_skins=True, export_morph=False, export_texcoords=True, export_normals=True,
          export_materials='PLACEHOLDER')
try:
    bpy.ops.export_scene.gltf(**kw, export_vertex_color='ACTIVE')
except TypeError:
    bpy.ops.export_scene.gltf(**kw, export_colors=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'players-hq.blend'))
log('wrote', OUT, os.path.getsize(OUT))
