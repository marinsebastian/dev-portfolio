'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import { useGeoConsole } from '@/context/GeoConsoleContext';
import MapCopilot from './MapCopilot.client';

/**
 * The one and only mounted copilot.
 *
 * There used to be two `MapCopilot` instances — one inline in the flagship
 * section, one inside Focused Mode — each with its own `useCopilotChat()` and
 * therefore its own conversation. A visitor who started a thread inline and
 * then opened the cockpit found an empty chat staring back.
 *
 * This mounts the copilot exactly once into a host element that it moves
 * between two slots: a compact teaser slot in the flagship section, and the
 * chat half of the Focused Mode overlay. React portals into the host, which
 * never changes identity, while the host itself is reparented with
 * `appendChild` — moving a live DOM node rather than destroying and rebuilding
 * one. So the conversation, the provider selection, the scroll position and
 * the composer's own `<input>` all survive the handoff.
 *
 * Reparenting rather than mirroring the slots' geometry with absolute
 * positioning is deliberate. The copilot sits in normal document flow in both
 * places, which means it cannot drift out of alignment when the page reflows
 * around it — a real failure mode here, since the flagship header grows by a
 * line when the location badge resolves, and the slot moves with it.
 */

export const TEASER_SLOT_ID = 'copilot-slot-teaser';
export const COCKPIT_SLOT_ID = 'copilot-slot-cockpit';

const DURATION_MS = 420;
const EASING = 'cubic-bezier(0.22,1,0.36,1)';
const TRANSITION = (['top', 'left', 'width', 'height'] as const)
  .map((prop) => `${prop} ${DURATION_MS}ms ${EASING}`)
  .join(', ');

/** Never fires: the value only has to differ between server and client. */
const subscribeNever = () => () => {};

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function viewportRect(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/**
 * FLIP, in viewport space: the host has already been moved into its new
 * parent, so it is pinned back over where it used to be and released.
 *
 * `top`/`left`/`width`/`height` are animated rather than a transform. A
 * transform would be cheaper, but the teaser and the cockpit's chat half are
 * different shapes, so scaling between them visibly distorts the text on the
 * way across.
 */
function flip(host: HTMLElement, first: Rect, last: Rect, onDone: () => void): () => void {
  const unchanged =
    Math.abs(first.top - last.top) < 1 &&
    Math.abs(first.left - last.left) < 1 &&
    Math.abs(first.width - last.width) < 1 &&
    Math.abs(first.height - last.height) < 1;
  if (unchanged) {
    onDone();
    return () => {};
  }

  host.style.transition = 'none';
  host.style.position = 'fixed';
  host.style.zIndex = '2010';
  host.style.margin = '0';
  host.style.top = `${first.top}px`;
  host.style.left = `${first.left}px`;
  host.style.width = `${first.width}px`;
  host.style.height = `${first.height}px`;

  // Flush the pinned position so the browser has something to animate from.
  void host.offsetWidth;

  host.style.transition = TRANSITION;
  host.style.top = `${last.top}px`;
  host.style.left = `${last.left}px`;
  host.style.width = `${last.width}px`;
  host.style.height = `${last.height}px`;

  let settled = false;
  const settle = () => {
    if (settled) return;
    settled = true;
    // Back to a plain in-flow child of whichever slot it now belongs to.
    host.style.cssText = '';
    host.removeEventListener('transitionend', settle);
    onDone();
  };

  host.addEventListener('transitionend', settle);
  // `transitionend` does not fire if the animation is interrupted or the tab
  // is backgrounded mid-flight, and the host must never be left pinned.
  const timer = window.setTimeout(settle, DURATION_MS + 120);

  return () => {
    window.clearTimeout(timer);
    settle();
  };
}

export default function CopilotSurface() {
  const { focusedMode } = useGeoConsole();
  const prefersReducedMotion = useReducedMotion();

  // `createPortal` needs a real `document`, so nothing renders until the
  // client has taken over. Read as an external store rather than flipped in an
  // effect, which would cost an extra render pass on every load.
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

  // Created once, in a lazy initialiser rather than an effect, so the very
  // first client render already has somewhere to portal into. Everything
  // about it that never changes is set here, at creation.
  const [host] = useState<HTMLDivElement | null>(() => {
    if (typeof document === 'undefined') return null;
    const el = document.createElement('div');
    el.className = 'flex-1 min-w-0 overflow-hidden rounded-xl border border-slate-800 shadow-xl';
    return el;
  });
  const inFlightRef = useRef<(() => void) | null>(null);
  // Where the host last came to rest, in viewport coordinates. Closing the
  // cockpit unmounts the overlay — and the slot the host is sitting in — in
  // the commit before this effect runs, so by then the host is detached and
  // measures as a zero-size box at the origin. This is the position it
  // actually had a moment ago, and the one the flight home should start from.
  const restingRectRef = useRef<Rect | null>(null);

  /* This host is a DOM node we own outright rather than React-managed state:
     `useState` is only holding it so it survives re-renders and is available
     during render for `createPortal`. Reparenting it and pinning it mid-flight
     is the entire job. */
  useEffect(() => {
    if (!mounted || !host) return;

    // Focused Mode is a dynamic import, so on a fast click its slot can appear
    // a moment after this runs. Waiting for the DOM insertion itself, rather
    // than retrying on a frame loop, means it is still found when frames are
    // not being produced at all — a background tab suspends
    // `requestAnimationFrame`, and a bounded retry would simply give up and
    // leave the cockpit with an empty chat half.
    let pending: MutationObserver | null = null;

    const place = () => {
      const slot = document.getElementById(focusedMode ? COCKPIT_SLOT_ID : TEASER_SLOT_ID);
      if (!slot) {
        if (!pending) {
          pending = new MutationObserver(() => place());
          pending.observe(document.body, { childList: true, subtree: true });
        }
        return;
      }
      pending?.disconnect();
      pending = null;

      if (host.parentElement === slot) return;

      // Finish any interrupted flight before measuring, so `first` is a real
      // resting position and not a half-animated one.
      inFlightRef.current?.();
      inFlightRef.current = null;

      const first = host.isConnected ? viewportRect(host) : restingRectRef.current;

      // Moving a node with `appendChild` blurs whatever inside it had focus,
      // and on the way into Focused Mode the page behind is marked inert in
      // the same commit — either alone is enough to drop a visitor who just
      // pressed Enter in the composer straight onto <body>. Put it back.
      const active = document.activeElement;
      const refocus = active instanceof HTMLElement && host.contains(active) ? active : null;

      slot.appendChild(host);
      refocus?.focus({ preventScroll: true });

      const last = viewportRect(host);
      restingRectRef.current = last;

      // No `first` means this is the initial placement: there is nowhere to
      // have come from, so it simply appears where it belongs.
      if (!first || prefersReducedMotion) return;
      inFlightRef.current = flip(host, first, last, () => {
        inFlightRef.current = null;
      });
    };

    place();

    return () => {
      pending?.disconnect();
      // Never leave the host pinned mid-flight if this tears down.
      inFlightRef.current?.();
      inFlightRef.current = null;
    };
  }, [mounted, focusedMode, host, prefersReducedMotion]);

  if (!mounted || !host) return null;

  return createPortal(
    <MapCopilot mode={focusedMode ? 'cockpit' : 'teaser'} />,
    host
  );
}
