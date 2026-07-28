# Handoff prompt: teaser-chat → AI Cockpit transition

Copy everything below the line into a fresh session.

---

## Context

This is a Next.js 16 portfolio site (`dev-portfolio`). Its flagship project section (`components/sections/FlagshipGeoSection.tsx`, mounted at `#flagship`) is an interactive MapLibre GL map of Bolivia's 2024 census blocks (`components/map/RealBlockMapWidget.client.tsx`) paired with an AI copilot that can read and drive the map (change layers, fly to locations, filter by metric threshold).

The AI copilot is `components/ai/MapCopilot.client.tsx` (default export `MapCopilot`), built on `components/ai/useCopilotChat.ts` (verify exact path/name) and rendered in two places today:

1. **Inline**, embedded directly in `FlagshipGeoSection.tsx`'s right column, sitting beside the map at all times.
2. **Full-screen**, inside `components/ai/FocusedConsole.client.tsx` — a `role="dialog"` overlay (triggered by a floating "IA"/"AI" button on the map, `focusedMode` boolean in `context/GeoConsoleContext.tsx`) showing the map and chat side-by-side at 50/50.

These are two **separate mounted instances** of `MapCopilot`, each with its own independent chat history via its own `useCopilotChat()` call. That's the problem this task fixes.

Shared state lives in `context/GeoConsoleContext.tsx` (`useGeoConsole()`): `activeScope`, `activeLayer`, `threshold`, `selectedBlock`, `userLocation`, `focusedMode`, plus an imperative `MapController` (`flyTo`, `getCenter`, `getZoom`, etc.) registered by whichever map instance last mounted.

Geolocation consent already exists end-to-end in `components/geo/GeolocationConsent.client.tsx` + `lib/geolocation.ts`:
- Consent is stored under `GEO_CONSENT_KEY` in localStorage via `storeConsent()`/`readStoredConsent()`, with exactly three states: `'declined' | 'ip-only' | 'granted'`.
- `userLocation` (in `GeoConsoleContext`) has a `source: 'gps' | 'ip'` field once resolved, plus `department`/`city`/`lat`/`lng`/`accuracyM`.
- `nearestScope(lat, lng)` and `scopeForDepartment(name)` in `lib/geolocation.ts` map a coordinate/department name to one of the three covered metro scopes (`Santa Cruz` | `Cochabamba` | `La Paz`).
- **Do not build a new location-request path.** Everything this task needs already exists in `userLocation` and the consent state.

Translations live in `data/translations.ts` (a single `TranslationDictionary` interface + `es`/`en` objects — add every new string to both, following the existing key-naming conventions in that file).

`components/layout/Header.tsx` already has a working Framer Motion **shared-layout transition** (`layoutId="nav-active-pill"`) animating one element smoothly between different positions/sizes across renders. That exact mechanism (`layoutId` + `AnimatePresence` if needed) is the reference pattern for the transition this task needs — read that file for the working example before designing the new one.

`react-markdown` is already installed and wired into `MapCopilot.client.tsx`'s message rendering (a `ChatMarkdown` component with custom `components` overrides, since no `@tailwindcss/typography` plugin is installed — Tailwind classes for markdown elements must be literal strings, not built via template-literal interpolation, or the JIT compiler won't generate the CSS).

The custom Tippy dark theme (`theme="geoinsights"` prop, styled in `app/globals.css` under `.tippy-box[data-theme~='geoinsights']`) and the `prefersReducedMotion` convention (checked via `useReducedMotion()` from `framer-motion` and respected everywhere animation appears) are established site-wide patterns — follow them, don't reinvent.

## The problem

The inline `MapCopilot` in `FlagshipGeoSection.tsx` is a full, ever-growing chat log sitting inline on the page at all times. This is a disconnected duplicate of the Focused Mode chat (different history, confusing to have two "the AI" surfaces that don't share a conversation), and it's also just a lot of static real estate for something most scroll-past visitors never touch.

## The design (agreed in prior discussion, implement as specified)

Replace the inline embed with a **compact teaser** that hands off into the existing Focused Mode Cockpit once real interaction begins, instead of being a parallel, independent chat.

### 1. Teaser behavior
- Inline in `FlagshipGeoSection.tsx`'s right column: a single input line (not a growing message log) plus one animated greeting line above it.
- The moment the visitor's cursor enters the input and they type their **first keystroke**, immediately kick off the expand-to-Cockpit transition (don't wait for send) — this hides transition latency behind typing time rather than pretending to pre-compute an LLM response (there is no meaningful way to "pre-warm" a stateless chat-completion call on a half-typed message; don't build anything that pretends otherwise).
- Sending the message from the teaser delivers it into the now-open Cockpit's real conversation — there is exactly **one** conversation once the user engages, not a second independent one.

### 2. The critical architectural constraint — read this twice
**The teaser input and the Cockpit's composer input must be the same literal DOM `<input>` element, never two separate inputs animated between.** If they're separate elements, unmounting one and mounting the other blurs/refocuses on mobile, closing and reopening the virtual keyboard — exactly the jankiness this whole feature exists to avoid. The correct approach: one persistent input component stays mounted throughout; "opening the Cockpit" is an animation of the *container* around it (position, size, everything else on screen) via Framer Motion's `layoutId` (see `Header.tsx`'s `nav-active-pill` for the working reference pattern in this codebase), while the input itself never leaves the DOM and never loses focus. Verify this holds on a real mobile viewport with the keyboard open before considering this done — a smooth-looking CSS transition between two different inputs is not an acceptable substitute and does not satisfy this requirement.

### 3. Scripted first-touch greeting (three variants, gated on existing consent state)
Rather than the current static `copilot.intro`/`copilot.introTools` text sitting inert, animate one of three pre-formatted (not live-LLM) openers as a fast typewriter effect, chosen by the visitor's **existing** consent state (`readStoredConsent()`):

- **`declined` or no decision yet** → an animated version of the self-introduction (adapt the current `copilot.intro` + `copilot.introTools` copy — what the copilot can do — rather than the current static block).
- **`ip-only`** → something like "I noticed you might be browsing from {department}" (real detected department from `userLocation`), auto-fly the map to that scope, and give a summary of that area/viewport (aggregate-level, not a specific block — matches what IP resolution can honestly claim).
- **`granted` (GPS)** → something like "you've shared your precise location" (real, from `userLocation`), auto-fly to the nearest census block to that GPS point, and summarize that specific block's real indicators (reuse whatever block-summary logic/copy already exists for a selected block).

These must stay **honest**: real underlying data (actual detected department, actual nearest block), delivered via a scripted template + fast animation — never phrase it as if the model is live-reasoning about the user in real time it isn't. Do not fabricate signals that don't exist.

Show this **once ever per visitor** — gate with a new, separate localStorage flag (do not reuse `GEO_CONSENT_KEY`; add a new key following the same read/write helper pattern already established in `lib/geolocation.ts`). The chat log itself stays ephemeral (cleared on reload, as it is today) — only the "has the visitor seen the greeting" flag persists.

### 4. Animation-style preference toggle
A small, discreet, persistent (localStorage-remembered) toggle switching between:
- **Animated**: typewriter reveal for the scripted greeting, and normal token-by-token reveal for real streaming (today's behavior).
- **Instant**: scripted greeting shows fully formed immediately; real streaming responses are buffered client-side and revealed all at once behind a "Thinking…" spinner rather than shown token-by-token as they arrive.

This preference applies uniformly to both the fake greeting and real responses — don't let them diverge. Regardless of this toggle, `prefers-reduced-motion` always forces the instant behavior (skip the typewriter/streaming reveal entirely).

### 5. Visual polish pass
The Focused Mode "Cockpit" overlay itself (`FocusedConsole.client.tsx` + `MapCopilot.client.tsx`'s styling) should get a deliberate design upgrade alongside the new transition — specifics are left to your judgment within the site's existing dark slate/teal/cyan palette and `font-mono-tech` conventions, but it should read as a considered redesign, not just "the same UI with a new animation bolted on."

### 6. Tests
`tests/smoke.spec.ts` has existing coverage for opening Focused Mode, the suggestion chips, and the tooltip-in-Focused-Mode behavior — this is expected to need real rewriting for the new flow, not a quick patch. Update it to match the new interaction model; don't leave it broken or delete coverage without replacing it.

## Constraints carried over from the rest of this project (do not violate)
- No aggressive marketing tricks, no fabricated urgency, nothing that reads as gamed rather than naturally useful — this was an explicit, repeated instruction across this whole project's prior work.
- Every new user-facing string goes into `data/translations.ts` in both `es` and `en`, matching that file's existing key-naming and structure conventions.
- Verify in a real browser at both a desktop width and a genuine mobile viewport (this session's environment has had trouble with `resize_window` clamping narrow widths and with `computer{action:"screenshot"}` failing when the pane isn't foregrounded — prefer DOM-measurement-based verification, e.g. `getBoundingClientRect`/`getComputedStyle` via a JS-eval tool, over relying on screenshots, and use a same-origin `<iframe>` sized to the target viewport as a workaround if `resize_window` clamps).
- Run the full Playwright suite (`npx playwright test tests/smoke.spec.ts`) and get it fully green before considering this done.
