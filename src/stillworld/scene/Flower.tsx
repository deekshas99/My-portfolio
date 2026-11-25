import { useEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, MathUtils, Vector3 } from 'three';
import type { Finish, Person } from '../lib/types';
import { dampAngle } from '../lib/core.mjs';
import FlowerHoverCard from '../components/FlowerHoverCard';
import { createBlossomGeometry, createPollenGeometry, createSeedHeadGeometry, createSeedTipGeometry, createStemGeometry } from './plants';
import { createBloomMaterial, createFilamentMaterial, createFoliageMaterial, createPollenMaterial, createTipMaterial, leafPalette } from './materials';

const finishes: Record<Finish, string> = { blue: '#b8d1da', silver: '#e4e0d6', ink: '#82939e' };

export type FlowerForm = 'blossom' | 'seed';
export type FlowerProps = {
  position: Vector3; scale?: number; seed: number; form: FlowerForm; person: Person; activeId: string | null;
  paused: boolean; reduced: boolean;
  onMeshEnter: (id: string) => void; onMeshLeave: (id: string) => void;
  onCardEnter: (id: string) => void; onCardLeave: (id: string) => void;
  onSelect: (id: string) => void;
};

type Handlers = Pick<FlowerProps, 'person' | 'onMeshEnter' | 'onMeshLeave' | 'onSelect'>;

const tooltipHtml = (
  person: Person, open: boolean, reduced: boolean,
  onCardEnter: (id: string) => void, onCardLeave: (id: string) => void,
  position: [number, number, number],
) => (
  <Html position={position} center distanceFactor={15} zIndexRange={[40, 0]} occlude={false} style={{ pointerEvents: open ? 'auto' : 'none' }}>
    <FlowerHoverCard
      person={person}
      open={open}
      reduced={reduced}
      onEnter={() => onCardEnter(person.id)}
      onLeave={() => onCardLeave(person.id)}
    />
  </Html>
);

/** An invisible sphere is the target: the plant itself is far too fine to hit. */
function Target({ radius, person, onMeshEnter, onMeshLeave, onSelect }: Handlers & { radius: number }) {
  const inside = useRef(false);
  return <mesh
    onPointerOver={e => {
      if (e.pointerType === 'touch') return;
      e.stopPropagation();
      if (inside.current) return;
      inside.current = true;
      document.body.style.cursor = 'pointer';
      onMeshEnter(person.id);
    }}
    onPointerOut={e => {
      if (e.pointerType === 'touch') return;
      e.stopPropagation();
      if (!inside.current) return;
      inside.current = false;
      document.body.style.cursor = '';
      onMeshLeave(person.id);
    }}
    onClick={e => { e.stopPropagation(); onSelect(person.id); }}>
    <sphereGeometry args={[radius, 12, 8]} />
    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
  </mesh>;
}

/** Shared idle: the whole plant leans, and stills while it is being read. */
function useStance(seed: number, chosen: boolean, paused: boolean, reduced: boolean, person: Person, amount: number) {
  const root = useRef<Group>(null!);
  const time = useRef(seed * 1.9);
  const step = (dt: number) => {
    const sways = !paused && !reduced && person.activity !== 'pause';
    if (sways && !chosen) time.current += dt;
    const t = time.current;
    const lean = chosen || reduced ? 0 : Math.sin(t * .42 + seed) * amount;
    root.current.rotation.z = MathUtils.damp(root.current.rotation.z, lean, 2.6, dt);
    root.current.rotation.x = MathUtils.damp(root.current.rotation.x, chosen || reduced ? 0 : Math.cos(t * .33 + seed) * .017, 2.6, dt);
    return t;
  };
  return { root, step };
}

function Blossom({ position, scale = 1, seed, person, activeId, paused, reduced, onMeshEnter, onMeshLeave, onCardEnter, onCardLeave, onSelect }: Omit<FlowerProps, 'form'>) {
  const head = useRef<Group>(null!);
  const { size, gl } = useThree();
  const chosen = activeId === person.id;
  const { root, step } = useStance(seed, chosen, paused, reduced, person, .025);

  const shape = useMemo(() => {
    const jitter = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
    return { height: 2 + jitter * .8, lean: (jitter - .5) * .4, bloom: scale * .84 };
  }, [seed, scale]);

  const geometry = useMemo(() => ({
    stem: createStemGeometry(shape.height, shape.lean),
    petals: createBlossomGeometry(32),
    pollen: createPollenGeometry(),
  }), [shape]);
  const materials = useMemo(() => ({
    petals: createBloomMaterial(finishes[person.finish ?? 'silver']),
    stem: createFoliageMaterial(leafPalette, { sway: 0, root: .55, grid: [4, 30] }),
    pollen: createPollenMaterial(),
  }), [person.finish]);

  useEffect(() => () => Object.values(geometry).forEach(g => g.dispose()), [geometry]);
  useEffect(() => () => Object.values(materials).forEach(m => m.dispose()), [materials]);
  materials.pollen.uniforms.uPixelRatio.value = gl.getPixelRatio();
  materials.pollen.uniforms.uHeight.value = size.height;

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, .05);
    materials.stem.uniforms.uTime.value = step(dt);
    const target = chosen ? Math.atan2(camera.position.x - position.x, camera.position.z - position.z) : Math.sin(seed * 2.17) * .55;
    head.current.rotation.y = reduced ? target : dampAngle(head.current.rotation.y, target, 3, dt);
    head.current.rotation.x = MathUtils.damp(head.current.rotation.x, chosen ? -.05 : -.23 + Math.sin(seed) * .09, 3, dt);
    const glow = MathUtils.damp(materials.petals.uniforms.uGlow.value, chosen ? 1 : 0, 3.5, dt);
    materials.petals.uniforms.uGlow.value = glow;
    materials.pollen.uniforms.uGlow.value = glow;
  });

  return <group position={position}>
    <group ref={root}>
      <mesh geometry={geometry.stem} material={materials.stem} />
      <group ref={head} position={[shape.lean, shape.height, shape.lean * .4]} scale={shape.bloom}
        rotation={[-.23, Math.sin(seed * 2.17) * .55, Math.sin(seed) * .16]}>
        <mesh geometry={geometry.petals} material={materials.petals} />
        <points geometry={geometry.pollen} material={materials.pollen} />
        <Target radius={1.32} person={person} onMeshEnter={onMeshEnter} onMeshLeave={onMeshLeave} onSelect={onSelect} />
      </group>
      {tooltipHtml(person, chosen, reduced, onCardEnter, onCardLeave, [shape.lean + 0.38, shape.height + 0.82, shape.lean * 0.4 + 0.32])}
    </group>
  </group>;
}

function SeedHead({ position, scale = 1, seed, person, activeId, paused, reduced, onMeshEnter, onMeshLeave, onCardEnter, onCardLeave, onSelect }: Omit<FlowerProps, 'form'>) {
  const head = useRef<Group>(null!);
  const { size, gl } = useThree();
  const chosen = activeId === person.id;
  const { root, step } = useStance(seed, chosen, paused, reduced, person, .03);

  const shape = useMemo(() => {
    const jitter = Math.abs(Math.sin(seed * 12.9898) * 43758.5453) % 1;
    return { height: 2.5 + jitter * 1.15, lean: (jitter - .5) * .5, head: .24 + jitter * .07 };
  }, [seed]);

  const geometry = useMemo(() => ({
    stem: createStemGeometry(shape.height, shape.lean),
    filaments: createSeedHeadGeometry(),
    tips: createSeedTipGeometry(),
  }), [shape]);
  const materials = useMemo(() => {
    const edge = finishes[person.finish ?? 'silver'];
    return {
      stem: createFoliageMaterial(leafPalette, { sway: 0, root: .55, grid: [4, 30] }),
      filaments: createFilamentMaterial(edge),
      tips: createTipMaterial(edge),
    };
  }, [person.finish]);

  useEffect(() => () => Object.values(geometry).forEach(g => g.dispose()), [geometry]);
  useEffect(() => () => Object.values(materials).forEach(m => m.dispose()), [materials]);
  materials.tips.uniforms.uPixelRatio.value = gl.getPixelRatio();
  materials.tips.uniforms.uHeight.value = size.height;

  useFrame((_, delta) => {
    const dt = Math.min(delta, .05);
    materials.stem.uniforms.uTime.value = step(dt);
    head.current.scale.setScalar(MathUtils.damp(head.current.scale.x, chosen ? shape.head * 1.12 : shape.head, 4, dt));
    const glow = MathUtils.damp(materials.filaments.uniforms.uGlow.value, chosen ? 1 : 0, 3.5, dt);
    materials.filaments.uniforms.uGlow.value = glow;
    materials.tips.uniforms.uGlow.value = glow;
  });

  return <group position={position} scale={scale}>
    <group ref={root}>
      <mesh geometry={geometry.stem} material={materials.stem} />
      <group ref={head} position={[shape.lean, shape.height, shape.lean * .4]} scale={shape.head}>
        <mesh geometry={geometry.filaments} material={materials.filaments} />
        <points geometry={geometry.tips} material={materials.tips} />
        <Target radius={1.58} person={person} onMeshEnter={onMeshEnter} onMeshLeave={onMeshLeave} onSelect={onSelect} />
      </group>
      {tooltipHtml(person, chosen, reduced, onCardEnter, onCardLeave, [shape.lean + 0.32, shape.height + 0.92, shape.lean * 0.4 + 0.32])}
    </group>
  </group>;
}

export default function Flower({ form, ...rest }: FlowerProps) {
  return form === 'blossom' ? <Blossom {...rest} /> : <SeedHead {...rest} />;
}
