import { useEffect, useRef, useState } from 'react';

/**
 * Counts down to an epoch-ms deadline. Uses wall-clock time so it stays accurate when the
 * tab is throttled. Calls onExpire once per deadline. Returns remaining ms, or null when
 * there is no deadline.
 */
export function useCountdown(deadline: number | null, onExpire: () => void): number | null {
  const [now, setNow] = useState(() => Date.now());
  const callback = useRef(onExpire);
  callback.current = onExpire;

  useEffect(() => {
    if (deadline === null) return;
    let fired = false;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (!fired && t >= deadline) {
        fired = true;
        callback.current();
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [deadline]);

  return deadline === null ? null : Math.max(0, deadline - now);
}
