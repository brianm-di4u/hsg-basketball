# Shared helpers for the headless venue builds (Blender 5.2, run with --factory-startup).
#
# --factory-startup ignores saved preferences, so every run turns Cycles GPU rendering on itself: OptiX if the
# card supports it, CUDA otherwise, CPU as the last resort. Bakes on the RTX 5060 take seconds instead of minutes.
import bpy


def enable_gpu(samples=256):
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    picked = 'NONE'
    for kind in ('OPTIX', 'CUDA'):
        try:
            prefs.compute_device_type = kind
        except TypeError:
            continue
        prefs.refresh_devices()
        gpus = [d for d in prefs.devices if d.type == kind]
        if gpus:
            for d in prefs.devices:
                d.use = d.type == kind
            picked = kind
            break
    scene.cycles.device = 'GPU' if picked != 'NONE' else 'CPU'
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    print(f'[venue] Cycles device: {scene.cycles.device} ({picked})')
    return picked


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene
