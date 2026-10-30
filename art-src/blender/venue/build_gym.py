# Builds an HQ venue shell (--kind gym: the shared home gym; --kind arena: the state-finals bowl), bakes its lighting
# with Cycles on the GPU and exports it for the game. File names below use <kind> for gym or arena.
#
#   "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b --factory-startup --python art-src/blender/venue/build_gym.py -- [--samples 512] [--size 2048]
#
# Output (art-src/venue/, then packed into assets/hq/ by tools/build-hq.mjs):
#   gym.glb            the shell: bleachers, walls, ceiling, trusses, lamps, baseline risers, floor and surround.
#                      UVMap (TEXCOORD_0) carries tiling detail; LM (TEXCOORD_1) the lightmap layout.
#   gym-lm-shell.exr   baked irradiance (direct + indirect light, no surface color) for everything but the floor
#   gym-lm-floor.exr   the same for the floor and its surround
#   gym-lm-*.rgba      the same divided by its scale, sRGB-encoded 8-bit RGBA, top row first (encoded to KTX2)
#   gym-lm.json        each lightmap's size and scale (linear irradiance = decoded texel × scale)
#   gym-anchors.json   named anchor points (pennants, banners, scoreboards, crowd rows) and their irradiance
#
# All seven home gyms share this geometry (src/js/gl/venue3d.js builds them from the same constants), so one
# bake serves every school: colors, wordmarks and pennants stay procedural in the game and are multiplied by
# the baked light. Units are feet, matching the game; game (x, y, z) = Blender (x, -z, y) with z up, which the
# glTF exporter turns back into y up.
import bpy, bmesh, math, os, sys, json
import numpy as np
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from common_gpu import enable_gpu, clear_scene

ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, dflt):
    return type(dflt)(ARGS[ARGS.index(name) + 1]) if name in ARGS else dflt
SAMPLES = arg('--samples', 512)
SIZE = arg('--size', 2048)
KIND = arg('--kind', 'gym')  # gym (the shared home-gym shell) or arena (the state-finals bowl)
OUT = os.path.normpath(os.path.join(HERE, '..', '..', 'venue'))
os.makedirs(OUT, exist_ok=True)

# ---- the gym, in game feet (src/js/gl/venue3d.js buildVenue: home gym)
HL, HW = 47.0, 25.0
FLOOR_X, FLOOR_Z = 57.0, 33.0
ROWS, RD, RH, LEN = 12, 2.3, 1.3, 126.0
Z0 = -(HW + 9.5)
BACK_Z = Z0 - ROWS * RD - 1
END_X = 66.0
CEIL_Y = 82.0

scene = clear_scene()
enable_gpu(SAMPLES)

def G(x, y, z):
    """game (x, y, z) -> Blender (x, -z, y)"""
    return Vector((x, -z, y))

MATS = {}
def mat(name, color):
    m = MATS.get(name)
    if m: return m
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = 0.8
    MATS[name] = m
    return m

PARTS = []  # (object, group) for joining
def box(name, size, center, material, group='shell'):
    """an axis-aligned box: size and center in game feet (w along x, h along y, d along z)"""
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.name = name
    o.scale = (size[0], size[2], size[1])
    o.location = G(*center)
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(material)
    PARTS.append((o, group))
    return o

def plane(name, w, d, center, material, rot=None, group='shell'):
    """a horizontal plane w (x) by d (z) at center; rot = ('X'|'Y'|'Z', radians) in game axes"""
    bpy.ops.mesh.primitive_plane_add(size=1)
    o = bpy.context.active_object
    o.name = name
    o.scale = (w, d, 1)
    bpy.ops.object.transform_apply(scale=True)
    if rot:
        axis, ang = rot
        o.rotation_euler = {'X': (ang, 0, 0), 'Y': (0, 0, ang), 'Z': (0, ang, 0)}[axis]
        bpy.ops.object.transform_apply(rotation=True)
    o.location = G(*center)
    o.data.materials.append(material)
    PARTS.append((o, group))
    return o

M = {
    'floor': mat('floor', (0.62, 0.45, 0.28)), 'surround': mat('surround', (0.42, 0.33, 0.24)),
    'wood': mat('wood', (0.36, 0.22, 0.12)), 'riser': mat('riser', (0.22, 0.14, 0.08)),
    'wall': mat('wall', (0.78, 0.74, 0.66)), 'tint_primary': mat('tint_primary', (0.5, 0.5, 0.5)),
    'tint_secondary': mat('tint_secondary', (0.6, 0.6, 0.6)), 'ceiling': mat('ceiling', (0.12, 0.12, 0.13)),
    'steel': mat('steel', (0.2, 0.21, 0.24)), 'lamp': mat('lamp', (1, 0.96, 0.86)),
    'seat': mat('seat', (0.05, 0.16, 0.48)), 'step': mat('step', (0.06, 0.065, 0.08)),
}


def arena():
    # the state-finals bowl (src/js/gl/venue3d.js buildVenue: arena), in game feet
    SIDE = 132.0
    plane('floor', FLOOR_X * 2, FLOOR_Z * 2, (0, 0, 0), M['floor'], group='floor')
    plane('surround', 260, 220, (0, -0.03, 0), M['surround'], group='floor')
    def side_rows(zs, tier_y, tier_z, rows):
        for r in range(rows):
            y, d = tier_y + r * 1.5, tier_z + r * 2.6
            box(f'astep{zs}{tier_y}{r}', (SIDE, 1.5, 2.6), (0, y + 0.75, zs * d), M['step'])
            box(f'aseat{zs}{tier_y}{r}', (SIDE, 1.1, 0.7), (0, y + 2.0, zs * (d + 0.6)), M['seat'])
    def end_rows(xs, tier_y, tier_x, rows, width):
        for r in range(rows):
            y, d = tier_y + r * 1.5, tier_x + r * 2.6
            box(f'aestep{xs}{tier_y}{r}', (2.6, 1.5, width), (xs * d, y + 0.75, 0), M['step'])
            box(f'aeseat{xs}{tier_y}{r}', (0.7, 1.1, width), (xs * (d + 0.6), y + 2.0, 0), M['seat'])
    side_rows(-1, 0, HW + 12, 16); side_rows(-1, 30, HW + 12 + 16 * 2.6 + 8, 12)
    end_rows(-1, 0, HL + 14, 14, 70); end_rows(-1, 28, HL + 14 + 14 * 2.6 + 8, 10, 80)
    end_rows(1, 0, HL + 14, 6, 34)
    # back walls behind the upper tiers, the roof, the lighting truss and its lamps
    plane('aback', 300, 120, (0, 60, -(HW + 12 + 16 * 2.6 + 8 + 12 * 2.6 + 4)), M['ceiling'], rot=('X', math.pi / 2))
    for s_ in (-1, 1):
        plane(f'aend{s_}', 120, 220, (s_ * (HL + 14 + 14 * 2.6 + 8 + 10 * 2.6 + 6), 60, 0), M['ceiling'], rot=('Z', -s_ * math.pi / 2))
    plane('ceiling', 400, 300, (0, CEIL_Y, 0), M['ceiling'], rot=('X', math.pi))
    for z in (-16, 0, 16):
        box(f'atruss{z}', (84, 1.2, 1.2), (0, 71, z), M['steel'])
    lamps = [(x, 70, z) for x in range(-36, 37, 12) for z in (-16, 0, 16)]
    for i, p in enumerate(lamps):
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=1.0, depth=0.5, location=G(*p))
        o = bpy.context.active_object; o.name = f'alamp{i}'; o.data.materials.append(M['lamp'])
        PARTS.append((o, 'shell'))
        # the court is lit hard and the house stays dim: narrow spots aimed at the floor
        ld = bpy.data.lights.new(f'AL{i}', 'SPOT'); ld.energy = 90000; ld.spot_size = math.radians(70); ld.spot_blend = 0.5; ld.color = (1.0, 0.97, 0.9)
        lo = bpy.data.objects.new(f'AL{i}', ld); lo.location = G(p[0], p[1] - 0.6, p[2]); lo.rotation_euler = (0, 0, 0); scene.collection.objects.link(lo)
    return lamps

if KIND == 'gym':
    # floor (the hardwood) and the surround ring around it, separately so the floor gets its own lightmap
    plane('floor', FLOOR_X * 2, FLOOR_Z * 2, (0, 0, 0), M['floor'], group='floor')
    for (w, d, cx, cz) in [(END_X * 2, -BACK_Z - FLOOR_Z, 0, (BACK_Z - FLOOR_Z) / 2),   # far side, under the bleachers
                           (END_X * 2, 70 - FLOOR_Z, 0, (FLOOR_Z + 70) / 2),             # camera side
                           (END_X - FLOOR_X, FLOOR_Z * 2, (END_X + FLOOR_X) / 2, 0),     # +x end
                           (END_X - FLOOR_X, FLOOR_Z * 2, -(END_X + FLOOR_X) / 2, 0)]:   # -x end
        plane('surround', w, d, (cx, -0.03, cz), M['surround'], group='floor')

    # bleachers: 12 rows of step + riser on the far side
    for r in range(ROWS):
        z, y = Z0 - r * RD, r * RH
        box(f'step{r}', (LEN, 0.35, RD), (0, y + RH - 0.17, z - RD / 2 + 0.05), M['wood'])
        box(f'riser{r}', (LEN, RH, 0.2), (0, y + RH / 2, z), M['riser'])
    # back wall with its school-color band above the top row
    plane('back', 150, 84, (0, 42, BACK_Z), M['wall'], rot=('X', math.pi / 2))
    box('topband', (150, 3.2, 0.1), (0, ROWS * RH + 4.6, BACK_Z + 0.05), M['tint_primary'])
    # end walls: block, a padded wainscot in school color, a stripe in the second color
    for s in (-1, 1):
        plane(f'end{s}', 84, 130, (s * END_X, 42, -10), M['wall'], rot=('Z', -s * math.pi / 2))  # faces the court
        box(f'wain{s}', (0.1, 7, 130), (s * (END_X - 0.1), 3.5, -10), M['tint_primary'])
        box(f'stripe{s}', (0.1, 2.2, 130), (s * (END_X - 0.15), 13, -10), M['tint_secondary'])
    # baseline student risers
    for s in (-1, 1):
        for r in (1, 2):
            box(f'srise{s}{r}', (1.6, r * 0.9, HW * 2 - 2), (s * (HL + 9.5 + r * 1.6), r * 0.45, 0), M['riser'])
    # ceiling, trusses and the lamps (the lamps are the bake's light sources)
    plane('ceiling', 160, 140, (0, CEIL_Y, -10), M['ceiling'], rot=('X', math.pi))
    for x in range(-60, 61, 15):
        box(f'truss{x}', (0.8, 2.6, 140), (x, 80, -10), M['steel'])
    lamp_pos = [(x, 76, z) for x in range(-45, 46, 15) for z in (-20, 0, 20)]
    for i, p in enumerate(lamp_pos):
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=1.45, depth=0.6, location=G(*p))
        o = bpy.context.active_object; o.name = f'lamp{i}'; o.data.materials.append(M['lamp'])
        PARTS.append((o, 'shell'))
        # an area light just under each lamp: warm high-bay LEDs pointing down
        ld = bpy.data.lights.new(f'L{i}', 'AREA'); ld.shape = 'DISK'; ld.size = 2.8; ld.energy = 26000; ld.color = (1.0, 0.95, 0.86)
        lo = bpy.data.objects.new(f'L{i}', ld); lo.location = G(p[0], p[1] - 0.5, p[2]); scene.collection.objects.link(lo)
    # the camera side is open in the game: a dim bounce from there, nothing more
    world = bpy.data.worlds.new(KIND); scene.world = world; world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.05, 0.045, 0.04, 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0


else:
    lamp_pos = arena()
# ---- join into two meshes, add the lightmap UVs
def join(group, name):
    objs = [o for o, g in PARTS if g == group]
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.active_object; o.name = name; o.data.name = name
    # detail UVs: a world-space box mapping at one repeat per 4 ft
    bm = bmesh.new(); bm.from_mesh(o.data)
    uv = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        for l in f.loops:
            v = l.vert.co
            if abs(n.z) > 0.7: l[uv].uv = (v.x / 4, v.y / 4)
            elif abs(n.x) > 0.7: l[uv].uv = (v.y / 4, v.z / 4)
            else: l[uv].uv = (v.x / 4, v.z / 4)
    bm.to_mesh(o.data); bm.free()
    o.data.uv_layers[0].name = 'UVMap'
    lm = o.data.uv_layers.new(name='LM')
    o.data.uv_layers.active = lm
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.lightmap_pack(PREF_CONTEXT='ALL_FACES', PREF_PACK_IN_ONE=True, PREF_MARGIN_DIV=0.25, PREF_BOX_DIV=48)
    bpy.ops.object.mode_set(mode='OBJECT')
    return o

shell = join('shell', f'{KIND}_shell')
floor = join('floor', f'{KIND}_floor')

# ---- bake irradiance (diffuse direct + indirect, no color) into one image per mesh
def bake(o, tag):
    img = bpy.data.images.new(f'{KIND}-lm-{tag}', SIZE, SIZE, float_buffer=True)
    for slot in o.material_slots:
        nt = slot.material.node_tree
        n = nt.nodes.get('LMTARGET') or nt.nodes.new('ShaderNodeTexImage')
        n.name = 'LMTARGET'; n.image = img
        nt.nodes.active = n
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    o.data.uv_layers.active = o.data.uv_layers['LM']
    scene.render.bake.use_pass_direct = True
    scene.render.bake.use_pass_indirect = True
    scene.render.bake.use_pass_color = False
    scene.render.bake.margin = 6
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'DIRECT', 'INDIRECT'}, use_clear=True, margin=6)
    path = os.path.join(OUT, f'{KIND}-lm-{tag}.exr')
    img.filepath_raw = path; img.file_format = 'OPEN_EXR'; img.save()
    # the 8-bit copy for the game: scaled so the 99.5th percentile lands at 1, sRGB-encoded for shadow precision
    px = np.array(img.pixels[:], dtype=np.float32).reshape(SIZE, SIZE, 4)
    lum = 0.2126 * px[..., 0] + 0.7152 * px[..., 1] + 0.0722 * px[..., 2]
    scale = float(np.percentile(lum[lum > 1e-4], 99.5))
    lin = np.clip(px[..., :3] / scale, 0, 1)
    srgb = np.where(lin <= 0.0031308, lin * 12.92, 1.055 * np.power(lin, 1 / 2.4) - 0.055)
    out = np.empty((SIZE, SIZE, 4), dtype=np.uint8)
    out[..., :3] = np.round(srgb * 255); out[..., 3] = 255
    out[::-1].tofile(os.path.join(OUT, f'{KIND}-lm-{tag}.rgba'))  # Blender stores bottom row first; files want top first
    LM[tag] = {'size': SIZE, 'scale': scale, 'mean': float(lum[lum > 1e-4].mean())}
    print(f'[venue] baked {tag} -> {path} (scale {scale:.3f})')
    return img

LM = {}
bake(floor, 'floor')
bake(shell, 'shell')
with open(os.path.join(OUT, f'{KIND}-lm.json'), 'w') as f:
    json.dump(LM, f, indent=1)

# ---- anchors for the game's procedural pieces, with the light at each (sampled from a quick probe bake later)
anchors = {} if KIND != 'gym' else {
    'pennant_back': [(x, ROWS * RH + 18.5, BACK_Z + 0.4) for x in (-30, -20, 20, 30)],
    'pennant_end': [(s * 65.6, 17, -22 + i * 5.4) for s in (-1, 1) for i in range(6)],
    'scoreboard_wall': [(0, ROWS * RH + 19.5, BACK_Z + 0.6)],
    'scoreboard_end': [(s * 65.4, 25, -4) for s in (-1, 1)],
}
with open(os.path.join(OUT, f'{KIND}-anchors.json'), 'w') as f:
    json.dump({'units': 'ft', 'anchors': anchors, 'lamps': lamp_pos}, f, indent=1)

# ---- export: the lit look comes from the lightmaps in the game, so drop the bake nodes and lights first
for m in MATS.values():
    n = m.node_tree.nodes.get('LMTARGET')
    if n: m.node_tree.nodes.remove(n)
for o in list(scene.objects):
    if o.type == 'LIGHT': bpy.data.objects.remove(o)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, f'{KIND}.glb'), export_format='GLB', use_selection=True,
                          export_texcoords=True, export_normals=True, export_materials='EXPORT', export_yup=True,
                          export_apply=True, export_animations=False)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, f'{KIND}.blend'))
print('[venue] done')
