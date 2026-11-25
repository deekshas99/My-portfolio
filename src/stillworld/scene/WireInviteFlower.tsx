import { useEffect, useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { BufferGeometry, Float32BufferAttribute, Group, Vector3 } from 'three';
import type { Person } from '../lib/types';
import FlowerHoverCard from '../components/FlowerHoverCard';

function wireGeometry(): BufferGeometry {
  const seg: number[] = [];
  const line = (ax: number, ay: number, az: number, bx: number, by: number, bz: number) => {
    seg.push(ax, ay, az, bx, by, bz);
  };

  const height = 2.35;
  line(0, 0, 0, 0, height, 0);

  const headY = height;
  const petals = 8;
  const reach = 0.72;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    const ex = Math.cos(a) * reach;
    const ez = Math.sin(a) * reach;
    line(0, headY, 0, ex, headY + 0.08, ez);
    const midA = a + 0.22;
    line(ex, headY + 0.08, ez, Math.cos(midA) * reach * 0.55, headY + 0.22, Math.sin(midA) * reach * 0.55);
    line(ex, headY + 0.08, ez, Math.cos(a - 0.22) * reach * 0.55, headY + 0.22, Math.sin(a - 0.22) * reach * 0.55);
  }

  for (let i = 0; i < petals; i++) {
    const a0 = (i / petals) * Math.PI * 2;
    const a1 = ((i + 1) / petals) * Math.PI * 2;
    line(
      Math.cos(a0) * reach * 0.78, headY + 0.18, Math.sin(a0) * reach * 0.78,
      Math.cos(a1) * reach * 0.78, headY + 0.18, Math.sin(a1) * reach * 0.78,
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(seg, 3));
  return geometry;
}

export type WireInviteProps = {
  position: Vector3;
  person: Person;
  active: boolean;
  paused: boolean;
  reduced: boolean;
  onMeshEnter: (id: string) => void;
  onMeshLeave: (id: string) => void;
  onCardEnter: (id: string) => void;
  onCardLeave: (id: string) => void;
  onSelect: (id: string) => void;
};

/** White line blossom — the open invitation to leave a message. */
export default function WireInviteFlower({
  position,
  person,
  active,
  paused,
  reduced,
  onMeshEnter,
  onMeshLeave,
  onCardEnter,
  onCardLeave,
  onSelect,
}: WireInviteProps) {
  const root = useRef<Group>(null!);
  const inside = useRef(false);
  const geometry = useMemo(() => wireGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (!paused && !reduced) time.current += Math.min(delta, 0.05);
    const t = time.current;
    root.current.rotation.z = Math.sin(t * 0.38) * 0.018;
  });

  return (
    <group position={position}>
      <group ref={root}>
        <lineSegments geometry={geometry}>
          <lineBasicMaterial color="#f4f8fa" transparent opacity={active ? 1 : 0.82} />
        </lineSegments>
        <mesh
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
          onClick={e => {
            e.stopPropagation();
            onSelect(person.id);
          }}
        >
          <sphereGeometry args={[1.15, 10, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Html position={[0.28, 2.78, 0.34]} center distanceFactor={15} zIndexRange={[40, 0]} occlude={false} style={{ pointerEvents: active ? 'auto' : 'none' }}>
          <FlowerHoverCard
            person={person}
            open={active}
            reduced={reduced}
            onEnter={() => onCardEnter(person.id)}
            onLeave={() => onCardLeave(person.id)}
          />
        </Html>
      </group>
    </group>
  );
}
