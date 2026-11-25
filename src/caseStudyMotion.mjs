// Keep a single trackpad impulse from skipping chapters, but recognize a
// repeated mouse-wheel detent or a fresh swipe without waiting for silence.
export const CHAPTER_MOTION_MS = 420;

export function createChapterWheelHandler({ advance, getViewportHeight, isTurning = () => false, now = () => performance.now() }) {
  const threshold = 28;
  let lastAt = -Infinity;
  let lastMagnitude = 0;
  let firedAt = -Infinity;
  let direction = 0;
  let distance = 0;
  let consumed = false;
  let reading = false;

  return event => {
    if (event.ctrlKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    const time = now();
    const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? getViewportHeight() : 1;
    const delta = event.deltaY * scale;
    const magnitude = Math.abs(delta);
    const sign = Math.sign(delta);
    const gap = time - lastAt;
    const newImpulse = gap >= 140 || sign !== direction
      || event.deltaMode !== 0
      || (magnitude >= 70 && gap >= 55)
      || (consumed && time - firedAt >= 300 && magnitude >= 45 && magnitude >= lastMagnitude * 2.2);

    if (newImpulse) {
      direction = sign;
      distance = 0;
      consumed = false;
      reading = false;
    }
    lastAt = time;
    lastMagnitude = magnitude;

    const pane = !isTurning() && event.target.closest?.('.cs-copy-scroll');
    const remaining = pane && (sign > 0
      ? pane.scrollHeight - pane.clientHeight - pane.scrollTop
      : pane.scrollTop);
    if (remaining > 1) {
      // The reader can keep scrolling long prose before changing chapters.
      reading = true;
      distance = 0;
      return;
    }

    event.preventDefault();
    if (consumed) return;
    distance += magnitude;
    if (distance < (reading ? 72 : threshold)) return;

    consumed = true;
    firedAt = time;
    advance(sign);
  };
}
