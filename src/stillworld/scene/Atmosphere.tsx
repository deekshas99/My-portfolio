import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MathUtils, PerspectiveCamera, Vector3 } from 'three';

const noise = /* glsl */ `
  float hash21(vec2 p){
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise2(vec2 p){
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3. - 2. * f);
    return mix(mix(hash21(i), hash21(i + vec2(1., 0.)), f.x),
      mix(hash21(i + vec2(0., 1.)), hash21(i + vec2(1., 1.)), f.x), f.y);
  }
  float smoke(vec2 p){
    return noise2(p) * .57 + noise2(p * 2.03 + 8.3) * .28 + noise2(p * 4.07 + 21.7) * .15;
  }
`;

const direction = new Vector3();

/** The continuous smoky blue field, with a dark ridge standing on the horizon.
    Sky, implied ground and smoke share one gradient: no floor edge, no fog
    cards, no stacked transparent planes whose seams used to band. */
export default function Atmosphere({ paused, reduced }: { paused: boolean; reduced: boolean }) {
  const time = useRef(0);
  const uniforms = useMemo(() => ({
    uAspect: { value: 1 },
    uHorizon: { value: .4 },
    uTime: { value: 0 },
    uSky: { value: new Color('#9eb4c0') },
    uAir: { value: new Color('#5a7384') },
    uBand: { value: new Color('#152532') },
    uGround: { value: new Color('#243948') },
    uSmoke: { value: new Color('#7a96a4') },
    uRidge: { value: new Color('#040a10') },
  }), []);

  useFrame(({ camera, size }, delta) => {
    if (!paused && !reduced) time.current += Math.min(delta, .05);
    uniforms.uTime.value = time.current;
    uniforms.uAspect.value = size.width / size.height;
    camera.getWorldDirection(direction);
    const pitch = Math.asin(MathUtils.clamp(direction.y, -1, 1));
    const halfFov = MathUtils.degToRad((camera as PerspectiveCamera).fov ?? 40) / 2;
    uniforms.uHorizon.value = .5 - .5 * (Math.tan(pitch) / Math.tan(halfFov));
  });

  return <mesh frustumCulled={false} renderOrder={-1000}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial uniforms={uniforms} depthTest={false} depthWrite={false} toneMapped={false}
      vertexShader={/* glsl */`varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 1., 1.); }`}
      fragmentShader={/* glsl */`
        varying vec2 vUv;
        uniform float uAspect, uHorizon, uTime;
        uniform vec3 uSky, uAir, uBand, uGround, uSmoke, uRidge;
        ${noise}
        void main(){
          float x = vUv.x * uAspect;
          // The field was tuned against a horizon at .40; shifting it keeps the
          // haze sitting on the ground wherever the camera is pointed.
          float y = vUv.y - (uHorizon - .40);
          vec2 p = vec2((vUv.x - .5) * uAspect, y);

          vec2 warp = vec2(smoke(p * 2.1 + vec2(4.7, 9.2)), smoke(p * 2.3 + vec2(12.1, 2.8)));
          float cloud = smoke(p * vec2(2.8, 5.2) + warp * .95 + vec2(3.2, 6.7));
          float broad = smoke(p * vec2(1.45, 2.6) + vec2(7.4, 2.1));
          float height = y + (broad - .5) * .045;

          vec3 color = mix(uBand, uAir, smoothstep(.46, .86, height));
          color = mix(color, uSky, smoothstep(.70, 1.14, height));
          float ground = exp(-pow((height - .14) / .38, 2.)) * .52;
          color = mix(color, uGround, ground);

          float hazeHeight = .45 + (broad - .5) * .12 + (cloud - .5) * .06;
          float haze = exp(-pow((y - hazeHeight) / .16, 2.));
          float density = smoothstep(.18, .82, cloud) * .14 + .018;
          color = mix(color, uSmoke, haze * density);
          float nearSmoke = exp(-pow((y - .22) / .23, 2.));
          color = mix(color, uSmoke, nearSmoke * smoothstep(.35, .82, broad) * .07);

          // A dark ridge on the horizon, carrying the same haze as the air in
          // front of it so it sits in the world rather than on top of it.
          float ridge = noise2(vec2(x * .7, 3.1)) * .46 + noise2(vec2(x * 1.9, 7.7)) * .3 + noise2(vec2(x * 4.3, 1.3)) * .24;
          float crown = pow(noise2(vec2(x * 9.5, 5.2)), 1.3) * .55 + pow(noise2(vec2(x * 21., 9.1)), 2.2) * .4;
          float twig = pow(noise2(vec2(x * 48., 2.7)), 4.) * .5;
          float top = uHorizon + .014 + ridge * .1 + crown * .046 + twig * .028;
          float mass = smoothstep(top + .003, top - .003, vUv.y);
          float lift = smoothstep(uHorizon - .2, top, vUv.y);
          color = mix(color, mix(uRidge, uSmoke, .04 + lift * .12), mass);

          // Motes drifting in front of the ridge.
          vec2 grid = vec2(x, vUv.y) * 155.;
          vec2 cell = floor(grid), local = fract(grid);
          float rnd = hash21(cell);
          float spark = 0.;
          if (rnd > .962) {
            vec2 centre = vec2(hash21(cell + 1.7), hash21(cell + 3.3));
            float twinkle = .35 + .65 * sin(uTime * 1.3 + rnd * 73.);
            spark = smoothstep(.26, 0., length(local - centre)) * max(0., twinkle);
          }
          float band = smoothstep(uHorizon - .3, uHorizon - .01, vUv.y) * (1. - smoothstep(top - .03, top + .015, vUv.y));
          color += vec3(.78, .86, .9) * spark * band * 1.3;

          color *= 1. - .10 * pow(abs(vUv.x - .5) * 2., 2.);
          color *= .89 + .11 * smoothstep(0., .32, vUv.y);
          gl_FragColor = vec4(color, 1.);
          #include <colorspace_fragment>
          gl_FragColor.rgb += (hash21(gl_FragCoord.xy) - .5) / 255.;
        }
      `} />
  </mesh>;
}
