import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import type { Person } from '../lib/types';
import Flower from './Flower';
import Undergrowth from './Undergrowth';
import { flowerPosition } from './plants';

type WorldProps = {
  people: Person[]; activeId: string | null; paused: boolean; reduced: boolean;
  onMeshEnter: (id: string) => void; onMeshLeave: (id: string) => void;
  onCardEnter: (id: string) => void; onCardLeave: (id: string) => void;
  onSelect: (id: string) => void; onReady: () => void; onFailure: () => void;
};

function Garden(props: WorldProps) {
  const { camera, size, gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', props.onFailure);
    return () => canvas.removeEventListener('webglcontextlost', props.onFailure);
  }, [gl, props.onFailure]);
  const mobile = size.width < 650;
  const wideTilt = size.width >= 1024
    ? Math.min(.65, .24 + Math.max(0, size.width / size.height - 1.45) * .45)
    : 0;
  useEffect(() => {
    // Tilt farther up as the viewport widens to keep open sky above the bed.
    camera.position.set(0, mobile ? .92 : .85, mobile ? 9.4 : 8.2);
    (camera as PerspectiveCamera).fov = mobile ? 44 : 38;
    camera.lookAt(0, mobile ? 1.7 : 1.5 + wideTilt, -1);
    camera.updateProjectionMatrix();
  }, [camera, mobile, wideTilt]);
  useEffect(() => { props.onReady(); }, [props.onReady]);
  return <>
    <Undergrowth mobile={mobile} paused={props.paused} reduced={props.reduced} />
    {props.people.map((person, index) => {
      // Blossoms are drawn at roughly life size, so they need scaling down far
      // harder than the seed heads to sit in this frame.
      const form = index % 2 === 0 ? 'blossom' : 'seed';
      return <Flower key={person.id} {...props} person={person}
        position={flowerPosition(index, mobile)}
        scale={form === 'blossom' ? .5 + (index % 3) * .04 : .84 + (index % 3) * .06}
        form={form}
        seed={index + 1} />;
    })}
  </>;
}

export default function World(props: WorldProps) {
  return <Canvas aria-label="A dusk garden carrying messages" dpr={[1, 1.5]}
    camera={{ position: [0, 1.55, 8.2], fov: 38, near: .1, far: 120 }}
    gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    onPointerMissed={() => props.onSelect('')}>
    <Suspense fallback={null}><Garden {...props} /></Suspense>
  </Canvas>;
}
