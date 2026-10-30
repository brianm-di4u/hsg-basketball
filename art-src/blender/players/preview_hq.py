# Preview renders of the HQ bodies (art-src/blender/players/players-hq.blend) with the zone codes coloured like a
# sample kit, for checking proportions, clothes and faces without the game.
#
#   blender -b art-src/blender/players/players-hq.blend --python art-src/blender/players/preview_hq.py
import bpy, os, math
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'renders')
os.makedirs(OUT, exist_ok=True)
# zone -> sample colour (a white home kit with red trim, medium-brown skin)
PAL = {0: (0.55, 0.32, 0.18), 1: (0.92, 0.92, 0.9), 2: (0.7, 0.05, 0.08), 3: (0.92, 0.92, 0.9), 4: (0.7, 0.05, 0.08),
       5: (0.95, 0.95, 0.95), 6: (0.08, 0.08, 0.1), 7: (0.95, 0.95, 0.95), 8: (0.05, 0.03, 0.02), 9: (0.95, 0.95, 0.95),
       10: (0.25, 0.14, 0.06), 11: (0.0, 0.0, 0.0), 12: (0.05, 0.03, 0.02), 13: (0.42, 0.2, 0.15), 14: (0.7, 0.05, 0.08)}
scene = bpy.context.scene
for o in scene.objects:
    if o.type == 'MESH':
        me = o.data
        ca = me.color_attributes['zonecol']
        vis = me.color_attributes.get('preview') or me.color_attributes.new('preview', 'FLOAT_COLOR', 'CORNER')
        for i, d in enumerate(ca.data):
            z = round(d.color[0] * 16)
            if z in (1, 3) and d.color[1] < 0.24: z = 2          # piping from the edge distance (as the game does)
            elif z == 3 and d.color[2] > 0.75: z = 4
            c = PAL.get(z, (1, 0, 1))
            vis.data[i].color = (*c, 1)
        me.color_attributes.active_color = vis
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'VERTEX'
scene.display.shading.show_cavity = True
scene.render.resolution_x, scene.render.resolution_y = 900, 1000
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); scene.collection.objects.link(cam); scene.camera = cam
cam.data.lens = 70
rigs = [o for o in scene.objects if o.type == 'ARMATURE']
# spread the two builds apart for the render
for i, r in enumerate(sorted(rigs, key=lambda r: r.name)): r.location.x = -0.5 + i * 1.0
for name, loc, tgt in [('front', (0, -6.2, 1.0), (0, 0, 0.95)), ('side', (6.2, -1.0, 1.0), (0, 0, 0.95)),
                       ('face', (-0.5, -1.35, 1.72), (-0.5, 0, 1.70))]:
    cam.location = Vector(loc)
    d = Vector(tgt) - cam.location
    cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    scene.render.filepath = os.path.join(OUT, 'hq-' + name + '.png')
    bpy.ops.render.render(write_still=True)
print('[preview] done')
