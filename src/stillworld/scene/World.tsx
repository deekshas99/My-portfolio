import { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { PerspectiveCamera } from 'three';
import { Vector3 } from 'three';
import type { Person } from '../lib/types';
import { inviteWirePerson, worldConfig } from '../config';
import Flower from './Flower';
import Undergrowth from './Undergrowth';
import WireInviteFlower from './WireInviteFlower';
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
  useEffect(() => {
    // Down inside the bed, tilted up: the near leaves cross the treeline and
    // only the seed heads carry into open sky.
    camera.position.set(0, mobile ? .92 : .85, mobile ? 9.4 : 8.2);
    (camera as PerspectiveCamera).fov = mobile ? 44 : 38;
    camera.lookAt(0, mobile ? 1.7 : 1.5, -1);
    camera.updateProjectionMatrix();
  }, [camera, mobile]);
  useEffect(() => { props.onReady(); }, [props.onReady]);
  const inviteSpot = useMemo(() => new Vector3(mobile ? 0.2 : 0.45, 0, mobile ? 2.35 : 2.05), [mobile]);
  return <>
    <color attach="background" args={[worldConfig.palette.background]} />
    <Undergrowth mobile={mobile} paused={props.paused} reduced={props.reduced} />
    <WireInviteFlower
      position={inviteSpot}
      person={inviteWirePerson}
      active={props.activeId === inviteWirePerson.id}
      paused={props.paused}
      reduced={props.reduced}
      onMeshEnter={props.onMeshEnter}
      onMeshLeave={props.onMeshLeave}
      onCardEnter={props.onCardEnter}
      onCardLeave={props.onCardLeave}
      onSelect={props.onSelect}
    />
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
    gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
    onPointerMissed={() => props.onSelect('')}>
    <Suspense fallback={null}><Garden {...props} /></Suspense>
  </Canvas>;
}
