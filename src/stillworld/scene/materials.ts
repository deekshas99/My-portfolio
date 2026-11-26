import { AdditiveBlending, CanvasTexture, Color, DoubleSide, LinearFilter, ShaderMaterial, Vector2 } from 'three';

/** A local type atlas supplies the woven character surface every plant wears. */
let atlas: CanvasTexture | undefined;
export function glyphAtlas() {
  if (atlas) return atlas;
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 48;
  const ctx = canvas.getContext('2d')!;
  ctx.font = '28px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
  '0123456789:+·×01'.split('').forEach((char, i) => ctx.fillText(char, 16 + i * 32, 25));
  atlas = new CanvasTexture(canvas);
  atlas.minFilter = LinearFilter; atlas.magFilter = LinearFilter; atlas.generateMipmaps = false;
  return atlas;
}

const hash = /* glsl */ `float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`;

/* ----------------------------------------------------------------
   undergrowth
   Charcoal bodies carrying gold and silver character marks. The bed is
   opaque so a few thousand overlapping leaves never need sorting.
---------------------------------------------------------------- */

export type GlyphPalette = { silver: string; cool: string; gold: string; night: string };

const foliageVertex = /* glsl */ `
  attribute float aSway;
  attribute float aTint;
  attribute float aSeed;
  uniform float uTime;
  uniform float uSway;
  varying vec2 vUv;
  varying vec3 vNormal, vView;
  varying float vSeed, vTint, vDepth, vHeight;
  void main(){
    vec3 p = position;
    float phase = dot(floor(p.xz * .8), vec2(12.9898, 78.233));
    float wind = sin(uTime * .7 + phase) * .6 + sin(uTime * 1.27 + phase * 1.7) * .4;
    p.x += wind * aSway * uSway;
    p.z += wind * aSway * uSway * .45;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    vUv = uv;
    vSeed = aSeed;
    vTint = aTint;
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vDepth = -mv.z;
    vHeight = position.y;
    gl_Position = projectionMatrix * mv;
  }
`;

const foliageFragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uSilver, uCool, uGold, uNight;
  uniform vec2 uGrid;
  uniform float uGlow, uFog, uRoot, uWire, uDim, uWarmth;
  varying vec2 vUv;
  varying vec3 vNormal, vView;
  varying float vSeed, vTint, vDepth, vHeight;
  ${hash}
  void main(){
    vec2 p = vUv * uGrid, cell = floor(p), local = fract(p);
    float code = floor(hash(cell + vSeed * 3.1) * 16.);
    float glyph = texture2D(uAtlas, vec2((code + local.x) / 16., local.y)).a;
    vec2 edge = min(local, 1. - local);
    float wire = (1. - smoothstep(.012, .05, min(edge.x, edge.y))) * uWire;

    // Marks dissolve once a cell is smaller than a pixel, leaving a clean sheen.
    float detail = 1. - smoothstep(.45, 1.15, max(fwidth(p.x), fwidth(p.y)));
    float mark = mix(.14, glyph, detail);

    vec3 n = normalize(vNormal);
    float lit = .26 + .74 * abs(dot(n, normalize(vec3(-.3, .65, 1.))));
    float rim = pow(1. - abs(dot(n, normalize(vView))), 2.);

    // Gold is carried by a minority of plants rather than by height, so the bed
    // reads as scattered brass among black instead of a warm floor wash.
    float warm = clamp((smoothstep(.66, 1., vTint) * .9 + exp(-vHeight * 3.) * .3) * uWarmth, 0., 1.);
    vec3 metal = mix(mix(uCool, uSilver, fract(vSeed * .137 + .31)), uGold, warm);
    vec3 color = metal * (lit + rim * .3 + uGlow);

    float shade = .55 + .45 * hash(cell * 1.31 + vSeed);
    vec3 body = vec3(.007, .013, .018) * (.6 + lit * .6) + uGold * warm * .03;
    color = mix(body, color, clamp(mark * shade + wire * .25, 0., 1.));
    color *= uDim * mix(uRoot, 1., smoothstep(0., .42, vHeight));

    float mist = 1. - exp(-pow(vDepth * uFog, 2.));
    color = mix(color, uNight, mist * .88);
    gl_FragColor = vec4(color, 1.);
    #include <colorspace_fragment>
  }
`;

type FoliageOptions = { sway?: number; fog?: number; glow?: number; root?: number; wire?: number; dim?: number; warmth?: number; grid?: [number, number] };

export function createFoliageMaterial(palette: GlyphPalette, options: FoliageOptions = {}) {
  const grid = options.grid ?? [5, 26];
  return new ShaderMaterial({
    vertexShader: foliageVertex,
    fragmentShader: foliageFragment,
    side: DoubleSide,
    toneMapped: false,
    uniforms: {
      uAtlas: { value: glyphAtlas() },
      uTime: { value: 0 },
      uSway: { value: options.sway ?? .04 },
      uFog: { value: options.fog ?? .05 },
      uGlow: { value: options.glow ?? 0 },
      uRoot: { value: options.root ?? .3 },
      uWire: { value: options.wire ?? .16 },
      uDim: { value: options.dim ?? 1 },
      uWarmth: { value: options.warmth ?? .9 },
      uGrid: { value: new Vector2(grid[0], grid[1]) },
      uSilver: { value: new Color(palette.silver) },
      uCool: { value: new Color(palette.cool) },
      uGold: { value: new Color(palette.gold) },
      uNight: { value: new Color(palette.night) },
    },
  });
}

export const leafPalette: GlyphPalette = { silver: '#8a97a0', cool: '#4d6672', gold: '#d6a049', night: '#101d26' };
export const bloomPalette: GlyphPalette = { silver: '#e9c877', cool: '#b8853c', gold: '#f2d68d', night: '#121e26' };
export const backdropPalette: GlyphPalette = { silver: '#5e8270', cool: '#426358', gold: '#788460', night: '#142c22' };

/* ----------------------------------------------------------------
   message flowers
   The original bloom surface: a charcoal petal under every mark, so
   overlapping character sheets stay sculptural instead of turning pale.
---------------------------------------------------------------- */

const bloomVertex = /* glsl */ `
  attribute float aSeed;
  varying vec2 vUv;
  varying vec3 vNormal, vView;
  varying float vSeed, vDepth;
  void main(){
    vUv = uv; vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const bloomFragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uSilver, uGold, uNight;
  uniform vec2 uGrid;
  uniform float uGlow, uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal, vView;
  varying float vSeed, vDepth;
  ${hash}
  void main(){
    vec2 p = vUv * uGrid, cell = floor(p), local = fract(p);
    float code = floor(hash(cell + vSeed * 3.1) * 16.);
    float glyph = texture2D(uAtlas, vec2((code + local.x) / 16., local.y)).a;
    vec2 edge = min(local, 1. - local);
    float wire = (1. - smoothstep(.012, .035, min(edge.x, edge.y))) * .14;
    float detail = 1. - smoothstep(.48, 1.2, max(fwidth(p.x), fwidth(p.y)));
    float mark = mix(.16, glyph, detail);
    vec3 n = normalize(vNormal);
    float lit = .28 + .72 * abs(dot(n, normalize(vec3(-.35, .7, 1.))));
    float rim = pow(1. - abs(dot(n, normalize(vView))), 2.);
    float warm = exp(-vUv.y * 2.3) * .95;
    vec3 color = mix(uSilver, uGold, warm) * (lit + rim * .28 + uGlow * .2);
    float shade = .57 + .43 * hash(cell * 1.31 + vSeed);
    vec3 body = vec3(.008, .014, .019) * (.65 + lit * .55) + uGold * warm * .028;
    color = mix(body, color, clamp(mark * shade + wire * .2, 0., 1.));
    float alpha = .97 * uOpacity;
    float mist = 1. - exp(-pow(vDepth * .031, 2.));
    color = mix(color, uNight, mist * .7);
    alpha *= 1. - mist * .72;
    if (alpha < .018) discard;
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

export function createBloomMaterial(silver: string, options: { grid?: [number, number]; opacity?: number; gold?: string } = {}) {
  const grid = options.grid ?? [17, 30];
  return new ShaderMaterial({
    vertexShader: bloomVertex,
    fragmentShader: bloomFragment,
    transparent: true,
    depthWrite: true,
    side: DoubleSide,
    toneMapped: false,
    uniforms: {
      uAtlas: { value: glyphAtlas() },
      uSilver: { value: new Color(silver) },
      uGold: { value: new Color(options.gold ?? '#ce9d51') },
      uNight: { value: new Color('#0f1c25') },
      uGrid: { value: new Vector2(grid[0], grid[1]) },
      uGlow: { value: 0 },
      uOpacity: { value: options.opacity ?? 1 },
    },
  });
}

/** Gold characters drifting over a bloom's centre. */
export function createPollenMaterial() {
  return new ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { uAtlas: { value: glyphAtlas() }, uPixelRatio: { value: 1 }, uHeight: { value: 800 }, uGold: { value: new Color('#d3b06b') }, uGlow: { value: 0 } },
    vertexShader: /* glsl */`
      attribute float aSeed;
      varying float vSeed, vDepth;
      uniform float uPixelRatio, uHeight;
      void main(){
        vSeed = aSeed;
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        vDepth = -mv.z;
        gl_PointSize = clamp(.026 * uHeight / -mv.z, 1., 9.) * uPixelRatio;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform sampler2D uAtlas; uniform vec3 uGold; uniform float uGlow;
      varying float vSeed, vDepth;
      void main(){
        float a = texture2D(uAtlas, vec2((vSeed + gl_PointCoord.x) / 16., 1. - gl_PointCoord.y)).a;
        float haze = exp(-pow(vDepth * .037, 2.));
        if (a < .1) discard;
        gl_FragColor = vec4(uGold * (1. + uGlow * .6), a * .85 * haze);
        #include <colorspace_fragment>
      }
    `,
  });
}

/* ----------------------------------------------------------------
   seed heads
---------------------------------------------------------------- */

export function createFilamentMaterial(edge: string) {
  return new ShaderMaterial({
    transparent: true, depthWrite: false, side: DoubleSide, toneMapped: false,
    uniforms: { uCore: { value: new Color('#11181d') }, uEdge: { value: new Color(edge) }, uGold: { value: new Color('#ce9d51') }, uNight: { value: new Color('#101d26') }, uGlow: { value: 0 } },
    vertexShader: /* glsl */`
      attribute float aTint;
      varying float vTint, vDepth;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        vTint = aTint; vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uCore, uEdge, uGold, uNight; uniform float uGlow;
      varying float vTint, vDepth;
      void main(){
        // Charcoal at the core, gold through the middle, cool metal at the tips.
        vec3 color = mix(uCore, uGold, smoothstep(0., .6, vTint));
        color = mix(color, uEdge, smoothstep(.55, 1., vTint));
        color *= .85 + .75 * uGlow;
        float alpha = mix(.95, .4, vTint);
        float fog = 1. - exp(-pow(vDepth * .045, 2.));
        color = mix(color, uNight, fog * .8);
        gl_FragColor = vec4(color, alpha * (1. - fog * .55));
        #include <colorspace_fragment>
      }
    `,
  });
}

export function createTipMaterial(edge: string) {
  return new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false,
    uniforms: { uEdge: { value: new Color(edge) }, uGlow: { value: 0 }, uPixelRatio: { value: 1 }, uHeight: { value: 800 } },
    vertexShader: /* glsl */`
      uniform float uPixelRatio, uHeight, uGlow;
      varying float vDepth;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        vDepth = -mv.z;
        gl_PointSize = clamp(.07 * uHeight / -mv.z, 1., 12.) * uPixelRatio * (1. + uGlow * .3);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uEdge; uniform float uGlow;
      varying float vDepth;
      void main(){
        float d = length(gl_PointCoord - .5);
        float a = smoothstep(.5, .04, d);
        float fog = 1. - exp(-pow(vDepth * .045, 2.));
        gl_FragColor = vec4(uEdge, a * (.4 + .5 * uGlow) * (1. - fog * .8));
        #include <colorspace_fragment>
      }
    `,
  });
}
