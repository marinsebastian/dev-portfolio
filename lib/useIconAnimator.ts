'use client';
import { useEffect, useRef } from 'react';

/** Common imperative handle shape exposed by every @animateicons/react icon. */
export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

/** Common prop shape shared by every @animateicons/react/lucide icon component. */
export type AnimatedIconComponent = React.ForwardRefExoticComponent<
  React.RefAttributes<AnimatedIconHandle> & {
    className?: string;
    size?: number;
  }
>;

/**
 * Returns a ref to attach to an @animateicons/react icon, plus hover/focus
 * handlers meant to be spread onto whatever *wrapping* element (a button,
 * link, or card) should trigger it — the icon itself is usually too small a
 * hit target on its own, and hovering nearby text should trigger it too.
 *
 * Also auto-plays the animation shortly after mount and again periodically
 * (staggered per-icon via `delayMs`, e.g. `index * 400`) as a quiet, unforced
 * invitation to interact — skipped entirely under `prefers-reduced-motion`.
 * The animation is a bounded, self-completing keyframe sequence (it settles
 * back to rest on its own), so replaying it on a timer never leaves an icon
 * stuck mid-animation.
 */
export function useIconAnimator(prefersReducedMotion: boolean, delayMs = 0) {
  const ref = useRef<AnimatedIconHandle>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let cancelled = false;
    const play = () => {
      if (!cancelled) ref.current?.startAnimation();
    };
    const initial = setTimeout(play, 1200 + delayMs);
    const interval = setInterval(play, 9000 + delayMs);
    return () => {
      cancelled = true;
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [prefersReducedMotion, delayMs]);

  const handlers = {
    onMouseEnter: () => ref.current?.startAnimation(),
    onMouseLeave: () => ref.current?.stopAnimation(),
    onFocus: () => ref.current?.startAnimation(),
    onBlur: () => ref.current?.stopAnimation(),
  };

  return { ref, handlers };
}
