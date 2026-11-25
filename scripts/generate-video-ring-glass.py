"""Render the Range disc's glass and brushed-metal materials offline.

Run using Python with Pillow and Blender 4.x installed:
    python scripts/generate-video-ring-glass.py
    python scripts/generate-video-ring-glass.py --glass-only

Cycles renders real transmissive glass and a beveled, anisotropic metal
pointer under a studio environment. The browser composites the resulting
transparent assets; it needs neither WebGL nor per-frame ray tracing.
"""
from pathlib import Path
import math
import os
import sys


def grade_glass_reflections(ring):
    """Soft photographic reflection grade, preserving traced transmission.

    Clear glass should show a diffuse softbox rather than a saturated
    metallic band. Keep bright reflections feathered and the rim subtle.
    """
    import numpy as np
    from PIL import Image
    a = np.asarray(ring,dtype=np.float32)/255
    height,width = a.shape[:2]
    x,y = np.meshgrid((np.arange(width)+.5)*2/width-1,
                      (np.arange(height)+.5)*2/height-1)
    r = np.hypot(x,y)
    theta = np.arctan2(y,x)
    angle = np.arctan2(np.sin(theta+2.26),np.cos(theta+2.26))
    key = np.exp(-.5*(angle/.34)**2)*np.clip((r-.87)/.06,0,1)
    edge = np.clip((r-.974)/.020,0,1)
    edge = edge*edge*(3-2*edge)
    edge_falloff = 1-.52*edge*(1-.35*key)
    original_alpha = a[:,:,3:4]
    premul = a[:,:,:3]*original_alpha
    premul *= (edge_falloff*(.92+.38*key))[:,:,None]
    # A soft shoulder rolls off the reflection without clipping to white.
    # Subtle cool-white color is restricted to the reflected light.
    premul = .67*(1-np.exp(-premul*1.28/.67))
    premul *= np.array([.96,.985,1.035],dtype=np.float32)
    opacity = np.maximum(original_alpha*.80*edge_falloff[:,:,None],
                         premul.max(2,keepdims=True)*1.06).clip(0,1)
    result = np.concatenate([premul/np.maximum(opacity,1e-5),opacity],axis=-1)
    return Image.fromarray(np.uint8(np.clip(result,0,1)*255+.5),'RGBA')


def grade_softbox_bloom(ring):
    """Subtle optical bloom at the key's reflection, not an edge outline."""
    import numpy as np
    from PIL import Image
    a = np.asarray(ring,dtype=np.float32)/255
    h,w = a.shape[:2]
    x,y = np.meshgrid((np.arange(w)+.5)*2/w-1,(np.arange(h)+.5)*2/h-1)
    radius = np.hypot(x,y)
    theta = np.arctan2(y,x)
    angle = np.arctan2(np.sin(theta+2.21),np.cos(theta+2.21))
    # A small, elongated reflection sits on the convex face of the glass.
    # It fades in every direction and never reaches a hard circular edge.
    spot = .29*np.exp(-.5*(angle/.11)**2-.5*((radius-.951)/.0125)**2)
    spot *= np.clip((.993-radius)/.009,0,1)
    premul = a[:,:,:3]*a[:,:,3:]
    premul += (1-premul)*spot[:,:,None]*np.array([.91,.965,1],dtype=np.float32)
    alpha = np.maximum(a[:,:,3:],premul.max(2,keepdims=True)*1.06).clip(0,1)
    result = np.concatenate([premul/np.maximum(alpha,1e-5),alpha],axis=-1)
    return Image.fromarray(np.uint8(np.clip(result,0,1)*255+.5),'RGBA')


def render(directory, glass_only=False):
    import bpy

    out = Path(directory)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 48
    # Some portable Cycles builds lack OpenImageDenoise; render more
    # samples and downsample these small assets instead.
    scene.cycles.use_denoising = False
    scene.cycles.max_bounces = 10
    scene.cycles.transmission_bounces = 8
    scene.render.film_transparent = True
    scene.cycles.film_transparent_glass = True
    scene.cycles.film_transparent_roughness = .28
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.color_depth = '8'
    scene.view_settings.view_transform = 'AgX'

    world = bpy.data.worlds.new('Optical studio')
    scene.world = world
    world.use_nodes = True
    wn = world.node_tree.nodes
    wl = world.node_tree.links
    # Blender's included photography environment. An explicit softbox
    # setup below also makes the generator usable without this HDRI.
    hdr = Path('/usr/share/blender/datafiles/studiolights/world/studio.exr')
    bg = wn.get('Background')
    bg.inputs['Color'].default_value = (.035,.042,.05,1)
    bg.inputs['Strength'].default_value = .65
    mapping = None
    if hdr.is_file():
        env = wn.new('ShaderNodeTexEnvironment')
        env.image = bpy.data.images.load(str(hdr))
        mapping = wn.new('ShaderNodeMapping')
        coords = wn.new('ShaderNodeTexCoord')
        wl.new(coords.outputs['Generated'], mapping.inputs['Vector'])
        wl.new(mapping.outputs['Vector'], env.inputs['Vector'])
        wl.new(env.outputs['Color'], bg.inputs['Color'])
        mapping.inputs['Rotation'].default_value.z = .55

    cam_data = bpy.data.cameras.new('Orthographic macro')
    cam = bpy.data.objects.new('Orthographic macro', cam_data)
    scene.collection.objects.link(cam)
    cam.location = (0, 0, 4)
    cam.rotation_euler = (0, 0, 0)
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 2
    scene.camera = cam

    def softbox(name, position, power, width, height, color):
        data = bpy.data.lights.new(name,'AREA')
        data.energy = power
        data.shape = 'RECTANGLE'
        data.size = width
        data.size_y = height
        data.color = color
        ob = bpy.data.objects.new(name,data)
        scene.collection.objects.link(ob)
        ob.location = position
        ob.rotation_euler = (-ob.location).to_track_quat('-Z','Y').to_euler()
        return ob

    lights = [
        softbox('Broad cool studio key',(1.0,1.45,2.1),155,1.70,.84,(.96,.98,1.0)),
        softbox('Long pearl strip',(-1.4,-.75,1.6),75,.44,2.4,(1.0,.98,.93)),
        softbox('Edge bounce',(.5,-1.7,1.3),34,1.4,.35,(.76,.88,1.0)),
    ]
    # Broad nearby photographic panel. Its reflection rolls across the
    # convex face instead of tracing both edges as constant bright lines.
    glass_key = softbox('Large diffuse reflected softbox',(-.68,.92,1.15),72,1.3,1.25,(.96,.985,1))
    # Glass and metal use different lighting exposure. The glass is clear
    # with only large diffuse reflections, not the metal's sharper strips.
    original_powers = [ob.data.energy for ob in lights]
    for ob, factor in zip(lights,(.42,.42,.60)):
        ob.data.energy *= factor
    bg.inputs['Strength'].default_value = .35

    # Full solid optical disc. The video is a separate, smaller circle on
    # its top face; the exposed rounded outer edge carries the moving light.
    outer, shoulder = .994, .93
    sides = 512
    profile = []
    # Bottom face, smoothly rounded edge, then slightly domed top face.
    for j in range(32):
        r = .002 + (shoulder-.002)*j/31
        profile.append((r,-.035+.009*(r/shoulder)**2))
    for j in range(1,48):
        a = -math.pi/2 + math.pi*j/48
        profile.append((shoulder+(outer-shoulder)*math.cos(a),.026*math.sin(a)))
    for j in range(32):
        r = shoulder-(shoulder-.002)*j/31
        profile.append((r,.04-.014*(r/shoulder)**2))
    steps = len(profile)
    verts, faces = [], []
    for i in range(sides):
        a = 2 * math.pi * i / sides
        for r,z in profile:
            verts.append((r*math.cos(a), r*math.sin(a), z))
    bottom, top = len(verts), len(verts)+1
    verts.extend([(0,0,-.035),(0,0,.04)])
    for i in range(sides):
        ni=(i+1)%sides
        for j in range(steps-1):
            a = i*steps+j
            b = ni*steps+j
            c = ni*steps+j+1
            d = i*steps+j+1
            faces.append((a,b,c,d))
        faces.append((bottom,ni*steps,i*steps))
        faces.append((top,i*steps+steps-1,ni*steps+steps-1))
    mesh = bpy.data.meshes.new('Closed solid optical disc')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ring = bpy.data.objects.new('Solid clear glass disc', mesh)
    scene.collection.objects.link(ring)
    for poly in mesh.polygons:
        poly.use_smooth = True

    glass = bpy.data.materials.new('Clear optical glass IOR 1.46')
    glass.use_nodes = True
    glass.node_tree.nodes.clear()
    output = glass.node_tree.nodes.new('ShaderNodeOutputMaterial')
    shader = glass.node_tree.nodes.new('ShaderNodeBsdfGlass')
    shader.inputs['Color'].default_value = (.982,.99,1,1)
    shader.inputs['Roughness'].default_value = .175
    shader.inputs['IOR'].default_value = 1.46
    glass.node_tree.links.new(shader.outputs[0], output.inputs[0])
    ring.data.materials.append(glass)

    def save_render(name, size, samples):
        scene.render.resolution_x = size
        scene.render.resolution_y = size
        scene.render.resolution_percentage = 100
        scene.cycles.samples = samples
        scene.render.filepath = str(out / name)
        bpy.ops.render.render(write_still=True)

    save_render('glass.png', 832, 96)
    if glass_only:
        return
    ring.hide_render = True
    glass_key.hide_render = True
    for ob,power in zip(lights,original_powers):
        ob.data.energy = power
    bg.inputs['Strength'].default_value = .65
    scene.cycles.film_transparent_glass = False
    # Machined metal: softly chamfered sides, satin grain and a round
    # polished bevel. The face reflects the same studio at changing angles.
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0,0,0))
    pointer = bpy.context.object
    pointer.name = 'Brushed titanium marker'
    pointer.dimensions = (1.22, 1.13, .32)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    bevel = pointer.modifiers.new('Machined chamfer','BEVEL')
    bevel.width = .105
    bevel.segments = 8
    weighted = pointer.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    weighted.keep_sharp = True
    for poly in pointer.data.polygons:
        poly.use_smooth = True

    metal = bpy.data.materials.new('Satin brushed silver')
    metal.use_nodes = True
    mn = metal.node_tree.nodes
    ml = metal.node_tree.links
    principled = mn.get('Principled BSDF')
    principled.inputs['Base Color'].default_value = (.66,.69,.72,1)
    principled.inputs['Metallic'].default_value = 1
    principled.inputs['Roughness'].default_value = .28
    principled.inputs['Anisotropic'].default_value = .55
    coord = mn.new('ShaderNodeTexCoord')
    stretch = mn.new('ShaderNodeVectorMath')
    stretch.operation = 'MULTIPLY'
    stretch.inputs[1].default_value = (2.0,95,5.0)
    noise = mn.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 1.7
    noise.inputs['Detail'].default_value = 2
    remap = mn.new('ShaderNodeMapRange')
    remap.inputs['To Min'].default_value = .21
    remap.inputs['To Max'].default_value = .40
    bump = mn.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .14
    bump.inputs['Distance'].default_value = .006
    ml.new(coord.outputs['Generated'], stretch.inputs[0])
    ml.new(stretch.outputs[0], noise.inputs['Vector'])
    ml.new(noise.outputs['Fac'], remap.inputs['Value'])
    ml.new(remap.outputs['Result'], principled.inputs['Roughness'])
    ml.new(noise.outputs['Fac'], bump.inputs['Height'])
    ml.new(bump.outputs['Normal'], principled.inputs['Normal'])
    pointer.data.materials.append(metal)

    cam_data.ortho_scale = 1.54
    base_lights = [(ob,ob.location.copy()) for ob in lights]
    for i in range(12):
        ang = -2 * math.pi * i / 12
        for ob, base in base_lights:
            x,y,z = base
            ob.location = (x*math.cos(ang)-y*math.sin(ang),x*math.sin(ang)+y*math.cos(ang),z)
            ob.rotation_euler = (-ob.location).to_track_quat('-Z','Y').to_euler()
        if mapping:
            mapping.inputs['Rotation'].default_value.z = .55 + ang
        save_render(f'metal-{i:02d}.png', 128, 64)


if __name__ == '__main__':
    if '--' in sys.argv:
        render(sys.argv[sys.argv.index('--')+1], '--glass-only' in sys.argv)
    else:
        import subprocess
        import tempfile
        from PIL import Image, ImageFilter
        import numpy as np
        root = Path(__file__).resolve().parents[1]
        glass_only = '--glass-only' in sys.argv
        with tempfile.TemporaryDirectory(prefix='optical-materials-') as directory:
            subprocess.run([
                'blender','-b','--factory-startup','--python-exit-code','1','-t',str(min(8,os.cpu_count() or 4)),
                '-P',str(Path(__file__).resolve()),'--',directory,
                *(['--glass-only'] if glass_only else [])
            ], check=True)
            directory = Path(directory)
            ring = Image.open(directory/'glass.png').convert('RGBA')
            # Cycles composites in linear light; CSS composites in sRGB.
            # Convert the premultiplied radiance before encoding so the
            # clear glass retains its bright reflections on a dark page.
            rgba = np.asarray(ring,dtype=np.float32)/255
            rgb, alpha = rgba[:,:,:3], rgba[:,:,3:]
            linear = np.where(rgb <= .04045, rgb/12.92, ((rgb+.055)/1.055)**2.4)
            premul_linear = np.clip(linear*alpha*1.28,0,1)
            premul = np.where(premul_linear <= .0031308, premul_linear*12.92,
                             1.055*premul_linear**(1/2.4)-.055)
            opacity = np.maximum(alpha,premul.max(2,keepdims=True)*1.035).clip(0,1)
            # Filter small Monte Carlo variations before dividing by alpha.
            def smooth(channel):
                image = Image.fromarray(np.uint8(np.clip(channel,0,1)*255+.5))
                return np.asarray(image.filter(ImageFilter.GaussianBlur(1.5)),dtype=np.float32)/255
            premul = np.stack([smooth(premul[:,:,i]) for i in range(3)],axis=-1)
            opacity = smooth(opacity[:,:,0])[:,:,None]
            out_rgba = np.concatenate([premul/np.maximum(opacity,1e-5),opacity],axis=2)
            ring = Image.fromarray(np.uint8(np.clip(out_rgba,0,1)*255+.5),'RGBA')
            ring = grade_softbox_bloom(grade_glass_reflections(ring.resize((768,768),Image.Resampling.LANCZOS)))
            ring.save(root/'public'/'video-disc-optical.webp', 'WEBP', quality=92, alpha_quality=100, method=6)
            if not glass_only:
                atlas = Image.new('RGBA',(128*12,128))
                for i in range(12):
                    atlas.paste(Image.open(directory/f'metal-{i:02d}.png').convert('RGBA'),(128*i,0))
                atlas.save(root/'public'/'video-ticker-metal.webp','WEBP',lossless=True,quality=90,method=6)
            print('Optical materials rendered and packaged.')
