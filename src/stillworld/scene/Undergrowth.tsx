import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { buildGarden } from './plants';
import { backdropPalette, bloomPalette, createFoliageMaterial, leafPalette } from './materials';

type UndergrowthProps = { mobile: boolean; paused: boolean; reduced: boolean };

export default function Undergrowth({ mobile, paused, reduced }: UndergrowthProps) {
  const time = useRef(0);
  const geometry = useMemo(() => buildGarden(mobile), [mobile]);
  const materials = useMemo(() => ({
    foliage: createFoliageMaterial(leafPalette, { sway: .04, root: .52, glow: .12, grid: [9, 52], wire: .19, dim: 1.02, warmth: 1.7 }),
    blooms: createFoliageMaterial(bloomPalette, { sway: .045, glow: .53, root: .86, grid: [4, 9], wire: .25, warmth: 3 }),
    backdrop: createFoliageMaterial(backdropPalette, { sway: .014, fog: .028, root: .85, dim: .86, warmth: .2, grid: [3, 18], wire: .3 }),
  }), []);

  useEffect(() => () => {
    Object.values(geometry).forEach(g => g.dispose());
    Object.values(materials).forEach(m => m.dispose());
  }, [geometry, materials]);

  useFrame((_, delta) => {
    if (paused || reduced) return;
    time.current += Math.min(delta, .05);
    Object.values(materials).forEach(m => { m.uniforms.uTime.value = time.current; });
  });

  return <group>
    <mesh geometry={geometry.backdrop} material={materials.backdrop} renderOrder={-2} />
    <mesh geometry={geometry.foliage} material={materials.foliage} />
    <mesh geometry={geometry.blooms} material={materials.blooms} />
  </group>;
}
