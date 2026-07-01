import { useEffect, useRef } from "react";

/**
 * Runs `fn` on mount and again whenever the window regains focus or the tab
 * becomes visible. Used across list screens so returning from a mutation on
 * another route always shows the freshest Firestore data.
 */
export function useFocusRefetch(fn: () => void | Promise<void>, deps: unknown[] = []) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      void fnRef.current();
    };
    run();
    const onFocus = () => run();
    const onVis = () => { if (document.visibilityState === "visible") run(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}