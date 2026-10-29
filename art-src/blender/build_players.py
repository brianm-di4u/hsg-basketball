# Builds the two player bodies (M and F builds) for Spa City Hoops and exports art-src/players.glb.
#
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup --python art-src/blender/build_players.py
#
# Each body is a skin-modifier mannequin (deterministic radii, clean quads) with a named armature and automatic
# weights. Faces are split into kit zones by material (skin, jersey, trim, shorts, socks, shoes); the game recolors
# them per team, so the GLB carries only neutral placeholder colors. Bone names use underscores because three.js
# strips dots from node names. The figure stands 1.86 m tall in an A-pose facing -Y (+Z after glTF export).
import bpy, bmesh, math, os, sys
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_GLB = os.path.normpath(os.path.join(HERE, '..', 'players.glb'))
OUT_BLEND = os.path.join(HERE, 'players.blend')
RENDERS = os.path.join(HERE, 'renders')

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

# ---------------------------------------------------------------- body definitions
# joint: name -> (x, y, z, rx, ry); left side only, mirrored. y < 0 is the front.
def body(build):
    f = build == 'F'
    k = 0.9 if f else 1.0         # limb bulk
    sh = 0.186 if f else 0.218    # shoulder joint x
    ch = 0.176 if f else 0.206    # chest half width
    hp = 0.162 if f else 0.152    # pelvis half width
    J = {
        'pelvis':  (0, 0, 0.97, hp, 0.108),
        'waist':   (0, 0, 1.11, 0.134 if f else 0.156, 0.102),
        'chest':   (0, -0.006, 1.30, ch, 0.118 if f else 0.122),
        'upchest': (0, 0, 1.44, ch - 0.004, 0.108),
        'neck0':   (0, 0.006, 1.535, 0.066 * k, 0.066 * k),
        'neck1':   (0, 0.008, 1.60, 0.060 * k, 0.062 * k),
        'jaw':     (0, -0.008, 1.648, 0.078, 0.086),
        'head':    (0, -0.004, 1.725, 0.099, 0.108),
        'crown':   (0, 0.004, 1.80, 0.086, 0.094),
        'top':     (0, 0.004, 1.85, 0.056, 0.062),
        'nose':    (0, -0.098, 1.705, 0.014, 0.016),
        'shoulder_L': (sh, 0.004, 1.45, 0.086 * k, 0.084 * k),
        'clav_L':  (0.035, 0.0, 1.48, 0.0, 0.0),
        'elbow_L': (sh + 0.11, 0.012, 1.215, 0.058 * k, 0.058 * k),
        'wrist_L': (sh + 0.195, 0.0, 1.00, 0.041 * k, 0.035 * k),
        'hand_L':  (sh + 0.222, -0.006, 0.915, 0.032, 0.055),
        'finger_L': (sh + 0.236, -0.008, 0.86, 0.018, 0.034),
        'hip_L':   (0.092, 0, 0.92, 0.100 * k, 0.100 * k),
        'thigh_L': (0.098, -0.006, 0.73, 0.088 * k, 0.090 * k),
        'hem_L':   (0.100, -0.008, 0.60, 0.074 * k, 0.076 * k),
        'knee_L':  (0.102, -0.010, 0.515, 0.062 * k, 0.064 * k),
        'ear_L':   (0.088, 0.004, 1.715, 0.016, 0.024),
        'calf_L':  (0.103, 0.012, 0.34, 0.064 * k, 0.070 * k),
        'ankle_L': (0.104, 0.0, 0.10, 0.044, 0.046),
        'heel_L':  (0.104, 0.045, 0.045, 0.048, 0.042),
        'toe_L':   (0.106, -0.15, 0.042, 0.052, 0.040),
    }
    E = [('pelvis', 'waist'), ('waist', 'chest'), ('chest', 'upchest'), ('upchest', 'neck0'), ('neck0', 'neck1'),
         ('neck1', 'jaw'), ('jaw', 'head'), ('head', 'crown'), ('crown', 'top'), ('head', 'nose'),
         ('upchest', 'shoulder_L'), ('shoulder_L', 'elbow_L'), ('elbow_L', 'wrist_L'), ('wrist_L', 'hand_L'), ('hand_L', 'finger_L'),
         ('pelvis', 'hip_L'), ('hip_L', 'thigh_L'), ('thigh_L', 'hem_L'), ('hem_L', 'knee_L'), ('head', 'ear_L'), ('knee_L', 'calf_L'), ('calf_L', 'ankle_L'),
         ('ankle_L', 'heel_L'), ('ankle_L', 'toe_L')]
    # mirror
    for k in list(J):
        if k.endswith('_L'):
            x, y, z, rx, ry = J[k]
            J[k[:-2] + '_R'] = (-x, y, z, rx, ry)
    for a, b in list(E):
        if a.endswith('_L') or b.endswith('_L'):
            E.append((a.replace('_L', '_R'), b.replace('_L', '_R')))
    return J, E

# bone: name -> (head joint, tail joint, parent)
BONES = [
    ('hips', 'pelvis', 'waist', None), ('spine', 'waist', 'chest', 'hips'), ('chest', 'chest', 'upchest', 'spine'),
    ('neck', 'neck0', 'jaw', 'chest'), ('head', 'jaw', 'top', 'neck'),
]
for s in 'LR':
    BONES += [
        (f'clavicle_{s}', f'clav_{s}', f'shoulder_{s}', 'chest'),
        (f'upperarm_{s}', f'shoulder_{s}', f'elbow_{s}', f'clavicle_{s}'), (f'forearm_{s}', f'elbow_{s}', f'wrist_{s}', f'upperarm_{s}'),
        (f'hand_{s}', f'wrist_{s}', f'finger_{s}', f'forearm_{s}'),
        (f'thigh_{s}', f'hip_{s}', f'knee_{s}', 'hips'), (f'shin_{s}', f'knee_{s}', f'ankle_{s}', f'thigh_{s}'),
        (f'foot_{s}', f'ankle_{s}', f'toe_{s}', f'shin_{s}'),
    ]

# One neutral material: the game colors skin, jersey, shorts, socks and shoes in a shader from the rest-pose
# position, so kit lines stay crisp whatever the mesh topology.
MAT = bpy.data.materials.new('kit')
MAT.diffuse_color = (0.8, 0.8, 0.8, 1)

def seg_dist(p, a, b):
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length, t

def weigh(ob, J):
    # Distance-to-bone weights: inverse 6th power of the distance to each bone segment, top 3, normalized.
    # Deterministic and robust where heat weighting fails on skin-modifier meshes.
    segs = [(name, Vector(J[h][:3]), Vector(J[t][:3])) for name, h, t, _ in BONES]
    for g in list(ob.vertex_groups): ob.vertex_groups.remove(g)
    groups = {n: ob.vertex_groups.new(name=n) for n, _, _ in segs}
    for v in ob.data.vertices:
        p = v.co
        ds = []
        for n, a, b in segs:
            d, t = seg_dist(p, a, b)
            # arms and legs never take torso-side vertices of the other side
            if n.endswith('_L') and p.x < -0.02: continue
            if n.endswith('_R') and p.x > 0.02: continue
            ds.append((max(d, 0.004), n))
        ds.sort()
        top = ds[:3]
        ws = [(1 / d ** 6, n) for d, n in top if d < top[0][0] * 1.6]
        tot = sum(w for w, _ in ws)
        for w, n in ws: groups[n].add([v.index], w / tot, 'REPLACE')

def clothe(ob, J):
    # clean the mesh, then puff the shorts out (baggy, flared at the hem) and the jersey a little
    bm = bmesh.new(); bm.from_mesh(ob.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0005)
    bmesh.ops.dissolve_degenerate(bm, edges=bm.edges, dist=0.0005)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.normal_update()
    sh = J['shoulder_L'][0]
    def ramp(x, a, b): return max(0.0, min(1.0, (x - a) / (b - a)))
    for v in bm.verts:
        x, z = abs(v.co.x), v.co.z
        d = 0.0
        if z < 1.06 and x < 0.25 and z > 0.57:           # shorts: baggy, wider toward the hem
            d = ramp(z, 0.585, 0.605) * (0.012 + 0.028 * ramp(0.95 - z, 0, 0.33))
        elif 1.06 <= z < 1.52 and x < sh - 0.01:         # jersey
            d = 0.008
        elif z < 0.11:                                    # shoes
            d = 0.006
        if d:
            n = v.normal.copy(); n.z *= 0.3
            if n.length > 0: v.co += n.normalized() * d
    bm.to_mesh(ob.data); bm.free()
    ob.data.validate()

def build(build_id):
    J, E = body(build_id)
    names = [n for n in J if any(n in e for e in E)]  # skip bone-only joints
    me = bpy.data.meshes.new(f'Skel{build_id}')
    me.from_pydata([J[n][:3] for n in names], [(names.index(a), names.index(b)) for a, b in E], [])
    ob = bpy.data.objects.new(f'Body{build_id}', me)
    scene.collection.objects.link(ob)
    mod = ob.modifiers.new('skin', 'SKIN')
    mod.branch_smoothing = 0.6
    mod.use_smooth_shade = True
    for i, n in enumerate(names):
        d = me.skin_vertices[0].data[i]
        d.radius = (J[n][3], J[n][4])
        d.use_root = n == 'pelvis'
    sub = ob.modifiers.new('sub', 'SUBSURF')
    sub.levels = 2
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target='MESH')
    ob = bpy.context.view_layer.objects.active
    # decimate to a phone-friendly budget
    dec = ob.modifiers.new('dec', 'DECIMATE')
    dec.ratio = 0.55
    bpy.ops.object.modifier_apply(modifier='dec')
    ob.data.materials.append(MAT)
    for p in ob.data.polygons: p.use_smooth = True
    clothe(ob, J)
    # armature
    arm = bpy.data.armatures.new(f'Rig{build_id}')
    rig = bpy.data.objects.new(f'Rig{build_id}', arm)
    scene.collection.objects.link(rig)
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    eb = {}
    for name, h, t, parent in BONES:
        b = arm.edit_bones.new(name)
        b.head = Vector(J[h][:3]); b.tail = Vector(J[t][:3])
        if name.startswith('foot'): b.roll = 0
        if parent: b.parent = eb[parent]; b.use_connect = False
        eb[name] = b
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True); rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.parent_set(type='ARMATURE_NAME')
    weigh(ob, J)
    tris = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    groups = len(ob.vertex_groups)
    return ob, rig, tris, groups

stats = {}
objs = []
for i, b in enumerate(['M', 'F']):
    ob, rig, tris, groups = build(b)
    rig.location.x = i * 0.9
    stats[b] = (tris, groups)
    objs += [ob, rig]

bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)

# export (rest pose, both rigs; the game positions them itself)
for r in [o for o in objs if o.type == 'ARMATURE']: r.location.x = 0
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format='GLB', use_selection=True, export_skins=True,
                          export_animations=False, export_yup=True, export_apply=False, export_materials='EXPORT',
                          export_normals=True, export_texcoords=False)

# ---------------------------------------------------------------- previews (front, side and a shooting pose)
os.makedirs(RENDERS, exist_ok=True)
for i, r in enumerate([o for o in objs if o.type == 'ARMATURE']): r.location.x = i * 0.9
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.render.resolution_x, scene.render.resolution_y = 800, 900
world = bpy.data.worlds.new('w'); scene.world = world
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
scene.collection.objects.link(cam); scene.camera = cam
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 2.3

def shot(name, loc, rot):
    cam.location = loc; cam.rotation_euler = rot
    scene.render.filepath = os.path.join(RENDERS, name)
    bpy.ops.render.render(write_still=True)

shot('front.png', (0.45, -6, 0.95), (math.radians(90), 0, 0))
shot('side.png', (6.45, 0, 0.95), (math.radians(90), 0, math.radians(90)))
# pose test: right arm up, left knee bent
for r in [o for o in objs if o.type == 'ARMATURE']:
    pb = r.pose.bones
    pb['upperarm_R'].rotation_mode = 'XYZ'; pb['upperarm_R'].rotation_euler = (0, 0, math.radians(-150))
    pb['forearm_R'].rotation_mode = 'XYZ'; pb['forearm_R'].rotation_euler = (math.radians(60), 0, 0)
    pb['thigh_L'].rotation_mode = 'XYZ'; pb['thigh_L'].rotation_euler = (math.radians(60), 0, 0)
    pb['shin_L'].rotation_mode = 'XYZ'; pb['shin_L'].rotation_euler = (math.radians(-90), 0, 0)
shot('pose.png', (0.45, -6, 0.95), (math.radians(90), 0, 0))
print('STATS', stats, 'glb', os.path.getsize(OUT_GLB))
