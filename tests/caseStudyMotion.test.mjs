import test from 'node:test';
import assert from 'node:assert/strict';
import { createChapterWheelHandler } from '../src/caseStudyMotion.mjs';

function setup() {
  let time = 0;
  const advances = [];
  const handler = createChapterWheelHandler({
    now: () => time,
    advance: direction => advances.push(direction),
    getViewportHeight: () => 800,
  });
  const wheel = (at, deltaY, { deltaMode = 0, deltaX = 0, ctrlKey = false, pane = null } = {}) => {
    time = at;
    let prevented = false;
    handler({
      deltaY, deltaX, deltaMode, ctrlKey,
      target: { closest: () => pane },
      preventDefault: () => { prevented = true; },
    });
    return prevented;
  };
  return { advances, wheel };
}

test('separate mouse-wheel detents remain responsive without waiting for a long pause', () => {
  const { advances, wheel } = setup();
  wheel(0, 100);
  wheel(70, 100);
  wheel(140, 100);
  wheel(210, -100);
  assert.deepEqual(advances, [1, 1, 1, -1]);
});

test('line-mode mouse wheel recognizes each discrete step', () => {
  const { advances, wheel } = setup();
  wheel(0, 3, { deltaMode: 1 });
  wheel(40, 3, { deltaMode: 1 });
  wheel(80, -3, { deltaMode: 1 });
  assert.deepEqual(advances, [1, 1, -1]);
});

test('one trackpad impulse, including its decaying tail, advances just once', () => {
  const { advances, wheel } = setup();
  [6, 10, 15, 35, 72, 64, 44, 28, 14, 8, 4, 2, 1].forEach((delta, i) => wheel(i * 16, delta));
  assert.deepEqual(advances, [1]);
  [8, 12, 21, 39, 24].forEach((delta, i) => wheel(400 + i * 16, delta));
  assert.deepEqual(advances, [1, 1]);
});

test('long text scrolls natively, and scrolling beyond its edge can advance', () => {
  const { advances, wheel } = setup();
  const pane = { scrollTop: 200, scrollHeight: 1000, clientHeight: 500 };
  assert.equal(wheel(0, 45, { pane }), false);
  assert.equal(wheel(16, 45, { pane }), false);
  pane.scrollTop = 500;
  assert.equal(wheel(32, 45, { pane }), true);
  assert.deepEqual(advances, []);
  assert.equal(wheel(48, 45, { pane }), true);
  assert.deepEqual(advances, [1]);
});

test('pinch-zoom and horizontal input do not change chapters', () => {
  const { advances, wheel } = setup();
  assert.equal(wheel(0, 100, { ctrlKey: true }), false);
  assert.equal(wheel(100, 10, { deltaX: 100 }), false);
  assert.deepEqual(advances, []);
});
