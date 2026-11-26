import { useEffect, useState } from 'react';

const fields = [
  { id: 'name', label: 'Name', value: 'Deeksha Satapathy' },
  { id: 'fit', label: 'Fit score', value: '98%' },
  { id: 'job', label: 'Job', value: 'Polymath designer' },
  { id: 'hobbies', label: 'Current hobbies', value: 'Bioengineering' },
  { id: 'rating', label: 'Rating', value: '4.90', suffix: ' stars' },
] as const;

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const digits = '0123456789';
const rollFrames = 22;
const frameInterval = 58;

function rollValue(value: string, frame: number, fieldIndex: number) {
  return Array.from(value.toUpperCase(), (character, index) => {
    if (frame >= 6 + Math.floor(index * 0.75) + fieldIndex) return character;
    const reel = /[0-9]/.test(character) ? digits : alphabet;
    if (!reel.includes(character)) return character;
    return reel[(reel.indexOf(character) + index * 7 + frame + 1) % reel.length];
  }).join('');
}

export default function GardenReadout({ animate }: { animate: boolean }) {
  const [frame, setFrame] = useState(animate ? 0 : rollFrames);

  useEffect(() => {
    if (!animate) {
      setFrame(rollFrames);
      return;
    }

    const start = performance.now();
    const timer = window.setInterval(() => {
      const next = Math.min(rollFrames, Math.floor((performance.now() - start) / frameInterval));
      setFrame(previous => Math.max(previous, next));
      if (next === rollFrames) window.clearInterval(timer);
    }, frameInterval);
    return () => window.clearInterval(timer);
  }, [animate]);

  return (
    <section className="garden-intro" aria-label="Designer profile">
      <div className="garden-markers" aria-hidden="true">
        {Array.from({ length: 25 }, (_, index) => <span key={index} />)}
      </div>
      <dl className="garden-readout">
        {fields.map((field, index) => (
          <div className={`garden-field garden-field--${field.id}`} key={field.id}>
            <dt>{field.label}</dt>
            <dd>
              <span className="sr-only">{field.value}{'suffix' in field ? field.suffix : ''}</span>
              <span className="garden-field__display" aria-hidden="true">
                {field.id === 'rating' && <span className="garden-field__stars">★★★★★</span>}
                <span className="garden-field__value">
                  {animate ? rollValue(field.value, frame, index) : field.value.toUpperCase()}
                </span>
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
