import { useCallback, useRef, useState } from 'react';

type Zone = 'mesh' | 'card';

/** Stable hover: one enter/leave per zone, debounced mesh exit for handoff to the card. */
export function useFlowerHover() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const pinned = useRef(false);
  const zones = useRef(new Set<string>());
  const hideTimer = useRef<number | undefined>(undefined);
  const meshOutTimer = useRef(new Map<string, number>());

  const cancelHide = useCallback(() => window.clearTimeout(hideTimer.current), []);

  const clearAll = useCallback(() => {
    cancelHide();
    meshOutTimer.current.forEach(t => window.clearTimeout(t));
    meshOutTimer.current.clear();
    zones.current.clear();
    pinned.current = false;
    setActiveId(null);
  }, [cancelHide]);

  const scheduleHide = useCallback(() => {
    if (pinned.current) return;
    cancelHide();
    hideTimer.current = window.setTimeout(() => {
      if (zones.current.size === 0) setActiveId(null);
    }, 950);
  }, [cancelHide]);

  const stillOn = useCallback((id: string) => {
    for (const key of zones.current) if (key.startsWith(`${id}:`)) return true;
    return false;
  }, []);

  const enter = useCallback((id: string, zone: Zone) => {
    cancelHide();
    for (const key of [...zones.current]) {
      if (!key.startsWith(`${id}:`)) zones.current.delete(key);
    }
    meshOutTimer.current.forEach((t, otherId) => {
      if (otherId !== id) {
        window.clearTimeout(t);
        meshOutTimer.current.delete(otherId);
      }
    });
    const pending = meshOutTimer.current.get(id);
    if (pending) {
      window.clearTimeout(pending);
      meshOutTimer.current.delete(id);
    }
    zones.current.add(`${id}:${zone}`);
    setActiveId(prev => (prev === id ? prev : id));
  }, [cancelHide]);

  const leave = useCallback((id: string, zone: Zone) => {
    if (pinned.current) return;

    if (zone === 'mesh') {
      const pending = meshOutTimer.current.get(id);
      if (pending) window.clearTimeout(pending);
      meshOutTimer.current.set(id, window.setTimeout(() => {
        meshOutTimer.current.delete(id);
        zones.current.delete(`${id}:mesh`);
        if (!stillOn(id)) scheduleHide();
      }, 220));
      return;
    }

    zones.current.delete(`${id}:card`);
    if (!stillOn(id)) scheduleHide();
  }, [scheduleHide, stillOn]);

  const pin = useCallback((id: string | null) => {
    cancelHide();
    meshOutTimer.current.forEach(t => window.clearTimeout(t));
    meshOutTimer.current.clear();
    if (!id) {
      pinned.current = false;
      zones.current.clear();
      setActiveId(null);
      return;
    }
    pinned.current = true;
    zones.current.add(`${id}:mesh`);
    setActiveId(id);
  }, [cancelHide]);

  return { activeId, enter, leave, pin, clearAll, pinned };
}
