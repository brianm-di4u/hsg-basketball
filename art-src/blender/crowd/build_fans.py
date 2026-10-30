# Builds the low-poly crowd bodies (fans, bench players, coaches) from the HQ player bodies in
# art-src/blender/players/players-hq.blend and exports art-src/fans.glb for the HQ "crowd" package.
#
#   blender -b art-src/blender/players/players-hq.blend --python art-src/blender/crowd/build_fans.py
#
# Each build (M, F) loses its clothing shells (the jersey, shorts and hair cap are painted per pixel in the game),
# is decimated to two levels of detail (about 1,100 and 450 triangles) and keeps its skinning on the same rig.
# One colour attribute per vertex says which body part it belongs to (r = part / 8): 0 trunk, 1 upper arm,
# 2 forearm and hand, 3 thigh, 4 shin, 5 foot, 6 neck and head. The game colours shirts, sleeves, trousers or
# shorts, shoes, skin and hair from that and the rest-pose position, per fan (src/js/gl/crowd3d.js).
import bpy, bmesh, os

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.normpath(os.path.join(HERE, '..', '..', '..'))
OUT = os.path.join(GAME, 'art-src', 'fans.glb')
SHELLS = {1, 3, 8}             # jersey, shorts, hair cap (players' zone ids, build_bodies_hq.py ZONES)
LODS = {0: 1100, 1: 450, 2: 200}   # target triangles
PARTS = [(0, ('hips', 'spine', 'chest', 'clavicle', 'Root')), (1, ('upperarm',)), (2, ('forearm', 'hand', 'thumb', 'index', 'middle', 'ring', 'pinky', 'lowerarm')),
         (3, ('thigh',)), (4, ('shin', 'calf')), (5, ('foot', 'ball')), (6, ('neck', 'head'))]

def log(*a): print('[fans]', *a)

def part_of(name):
    for code, pre in PARTS:
        if name.startswith(pre): return code
    return 0

def tri_count(me): return sum(len(p.vertices) - 2 for p in me.polygons)

out_objs = []
for bid in ('M', 'F'):
    body, rig = bpy.data.objects['Body' + bid], bpy.data.objects['Rig' + bid]
    src = body.copy(); src.data = body.data.copy(); bpy.context.scene.collection.objects.link(src)
    # strip the clothing shells (the body under them stays) and anything loose
    # (zones are a corner colour: zone = round(r * 16))
    bm = bmesh.new(); bm.from_mesh(src.data)
    zl = bm.loops.layers.float_color.get('zonecol')
    dead = [f for f in bm.faces if round(f.loops[0][zl][0] * 16) in SHELLS]
    bmesh.ops.delete(bm, geom=dead, context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(src.data); bm.free()
    for ca in list(src.data.color_attributes): src.data.color_attributes.remove(ca)
    base = tri_count(src.data)
    log(bid, 'body without shells', base, 'tris')
    for lod, target in LODS.items():
        o = src.copy(); o.data = src.data.copy(); bpy.context.scene.collection.objects.link(o)
        o.name = 'Fan%s%d' % (bid, lod)
        for m in list(o.modifiers):
            if m.type != 'ARMATURE': o.modifiers.remove(m)
        bpy.context.view_layer.objects.active = o
        d = o.modifiers.new('dec', 'DECIMATE'); d.decimate_type = 'COLLAPSE'; d.ratio = target / base; d.use_collapse_triangulate = True
        bpy.ops.object.modifier_move_to_index(modifier='dec', index=0)
        bpy.ops.object.modifier_apply(modifier='dec')
        # one part code per vertex from its strongest bone family
        me = o.data
        # only the rig's bones count (MakeHuman's helper groups such as Left/Right/Mid weigh 1 everywhere)
        bones = set(rig.data.bones.keys())
        names = {g.index: g.name for g in o.vertex_groups if g.name in bones}
        col = me.color_attributes.new('part', 'FLOAT_COLOR', 'POINT')
        for v in me.vertices:
            acc = {}
            for g in v.groups:
                if g.group in names: acc[part_of(names[g.group])] = acc.get(part_of(names[g.group]), 0) + g.weight
            p = max(acc, key=acc.get) if acc else 0
            col.data[v.index].color = (p / 8.0, 0, 0, 1)
        me.color_attributes.active_color = col
        me.color_attributes.render_color_index = me.color_attributes.find('part')
        for a in list(me.attributes):
            if a.name == 'zone': me.attributes.remove(a)
        out_objs.append(o)
        log(o.name, tri_count(me), 'tris', len(me.vertices), 'verts')
    bpy.data.objects.remove(src)
    rig.name = 'FanRig' + bid
    out_objs.append(rig)
    # the fans parent to the rig like the bodies do
    for o in out_objs:
        if o.name.startswith('Fan' + bid) and o.type == 'MESH': o.parent = rig

bpy.ops.object.select_all(action='DESELECT')
for o in out_objs: o.select_set(True)
kw = dict(filepath=OUT, export_format='GLB', use_selection=True, export_apply=False, export_skins=True, export_animations=False,
          export_yup=True, export_texcoords=False, export_normals=True, export_materials='NONE')
try:
    bpy.ops.export_scene.gltf(**kw, export_vertex_color='ACTIVE')
except TypeError:
    bpy.ops.export_scene.gltf(**kw, export_colors=True)
log('wrote', OUT, os.path.getsize(OUT))
