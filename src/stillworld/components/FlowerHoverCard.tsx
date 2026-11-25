import { useEffect, useRef, useState } from 'react';
import type { Person } from '../lib/types';
import { worldConfig } from '../config';

const progress = new Map<string, number>();

/** Rounded card that rides on the flower in 3D space (via drei Html). */
export default function FlowerHoverCard({
  person,
  open,
  reduced,
  onEnter,
  onLeave,
}: {
  person: Person;
  open: boolean;
  reduced: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [count, setCount] = useState(0);
  const seen = useRef(new Set<string>());
  const typing = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearInterval(typing.current);
    if (!open) return;

    const full = person.message.length;
    if (reduced || seen.current.has(person.id)) {
      progress.set(person.id, full);
      setCount(full);
      return;
    }

    let n = progress.get(person.id) ?? 0;
    setCount(n);
    if (n >= full) {
      seen.current.add(person.id);
      return;
    }

    const start = window.setTimeout(() => {
      typing.current = window.setInterval(() => {
        n++;
        progress.set(person.id, n);
        setCount(n);
        if (n >= full) {
          window.clearInterval(typing.current);
          seen.current.add(person.id);
        }
      }, worldConfig.typeIntervalMs);
    }, 180);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(typing.current);
    };
  }, [person.id, person.message, open, reduced]);

  const inside = useRef(false);

  if (!open) return null;

  return (
    <div
      className={`flower-tooltip-shell ${open ? 'flower-tooltip-open' : ''}`}
      onPointerEnter={() => {
        if (inside.current) return;
        inside.current = true;
        onEnter();
      }}
      onPointerLeave={() => {
        if (!inside.current) return;
        inside.current = false;
        onLeave();
      }}
      role="status"
      aria-live="polite"
    >
      <div className="flower-tooltip">
        <p className="flower-tooltip-label">message</p>
        <p className="flower-tooltip-body" aria-hidden="true">
          {person.message.slice(0, count)}
          {count < person.message.length && <span className="type-cursor">▌</span>}
        </p>
        {person.name ? <p className="flower-tooltip-name">{person.name}</p> : null}
        <p className="sr-only">
          {person.name ? `${person.name}: ` : ''}
          {person.message}
        </p>
      </div>
    </div>
  );
}
