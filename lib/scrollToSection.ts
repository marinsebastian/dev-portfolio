/**
 * Manually scrolls to a section instead of relying on native/Next.js hash
 * navigation. A plain `<a href="#id">` (or next/link to the same href) stops
 * working once the address bar's hash already matches the target — which
 * happens as soon as the user scrolls elsewhere by hand, since scroll never
 * updates the URL on its own. Scrolling imperatively here sidesteps that
 * entirely: it never checks the current hash, so it can't get "stuck".
 *
 * `replaceState` (not `pushState`) keeps the hash in sync with the visible
 * section without adding a browser-history entry per click or per scroll.
 */
export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior, block: 'start' });
  window.history.replaceState(null, '', `#${id}`);
}
