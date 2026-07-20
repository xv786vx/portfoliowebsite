import { useEffect, useState } from 'react';

// Viewport width at/under which we switch to the locked vertical mobile layout.
export const MOBILE_MAX_WIDTH = 767;

/** Tracks whether the viewport is at mobile width, updating on resize/change. */
export function useIsMobile(): boolean {
  const query = `(max-width: ${MOBILE_MAX_WIDTH}px)`;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
