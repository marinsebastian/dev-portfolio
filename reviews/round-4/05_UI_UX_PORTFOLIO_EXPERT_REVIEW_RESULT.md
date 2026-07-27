# UI/UX Portfolio Expert Review

**Round:** 4 (Header/Nav rework + AI gradient button + micro-apps density pass)
**Reviewer persona:** Senior UI/UX designer — developer portfolios and premium SaaS interfaces
**Review date:** 2026-07-27
**Method:** attempted the live production build as a visitor first, per the Browser-First rule; when that failed, instrumented a local production-equivalent build of the same commit at six viewports, then read source to diagnose and confirm what the instrumentation found.

---

## Methodology Note — read this before the rest of the document

**The live URL is down.** `https://dev-portfolio-lilac-chi.vercel.app` returned `HTTP 404` with header `x-vercel-error: DEPLOYMENT_NOT_FOUND` on every attempt made during this review — via direct browser navigation, via an independent `WebFetch` call, and via three separate `curl -I` calls spaced minutes apart, the last one timestamped `Mon Jul 27 07:54:11 UTC 2026`. This is not a cold start or a flaky edge node; `DEPLOYMENT_NOT_FOUND` is Vercel's routing layer stating no deployment is currently aliased to this domain. A hiring reviewer clicking the link in the application right now sees nothing.

Because the review protocol requires an actual rendered-experience assessment, I fell back to a **local production build** (`next start`, port 3000) already running on this machine at git HEAD `381dc79` (build artifact timestamped 10 minutes after that commit, clean working tree — this is genuinely the current code, not a stale build). Every finding below the outage itself describes that local build. Where it matters, findings are marked **[deployment]** vs **[local build]**.

**Two tooling limitations shaped how evidence was gathered, and are worth disclosing rather than hiding:**

1. **Screenshot compositing was unavailable for the entire session** (confirmed against `example.com` too, so this is an environment limitation, not a site defect). All findings below are therefore DOM/CSS instrumentation — `getBoundingClientRect`, `getComputedStyle`, `elementFromPoint` hit-testing — rather than visual inspection. This is strictly more precise for the kind of pixel claims this document makes, and matches the instrumented methodology Round 3 already used for its own measured-results table.
2. **`resize_window` had a hard floor** in this session: any request narrower than roughly 750px silently clamped to a fixed 670×~1450 profile at `devicePixelRatio:2`, regardless of the requested size (verified with six different narrow requests, all collapsing to the same profile). True 360/375/390/412/430px viewports were instead produced with a same-origin `<iframe>` sized to the exact target width, which creates a genuine independent nested viewport — `iframe.contentWindow.innerWidth` matches the requested width exactly, and Tailwind's media queries evaluate correctly inside it. A vertical-scrollbar-gutter artifact (desktop Chrome reserves ~15px for a classic scrollbar; real mobile browsers use overlay scrollbars that reserve nothing) was identified and eliminated by forcing `overflow-y: hidden` on the iframe's `<html>`/`<body>`, after which `iframe.contentWindow.innerWidth` and the rendered `<html>` width matched exactly at every width tested (360, 375, 390, 412, 430) — confirmed by direct measurement, not assumption.

Real keyboard `Tab` presses dispatched through the automation layer did not reach the page's focus system in this session (`document.activeElement` stayed on `<body>` after a dispatched `Tab`), so focus-state testing used scripted `.focus()` calls, cross-checked against the native `:focus-visible` pseudo-class match (Chrome's documented heuristic reliably marks non-pointer-triggered `.focus()` as focus-visible) and against each element's box-shadow/outline *before vs. after* focus, rather than trusting a single snapshot.

---

## Overall Verdict

**DO NOT SEND YET.**

This reverses Round 3's SHIP, and it reverses it for two independent reasons, either one of which would be sufficient on its own.

**First, the deployment itself is gone.** Not slow, not degraded — gone. Every viewport measurement in this document, every interaction test, everything that follows is evidence about a codebase, not about the thing an employer would actually receive if the application went out today.

**Second, and separately from the outage: the header rework shipped in this round broke the mobile navigation trigger at the exact viewport width this review protocol tests first.** At 360px — the review's mandated opening breakpoint, and the single most common mobile CSS viewport width in the world — the "Open menu" hamburger button is measurably rendered **21px past the right edge of the screen**, leaving only **52% of its 44×44px tap target actually on-screen and hit-testable**. At 320px (a width still in active use on budget Android devices) it is **0% reachable** — the entire control is off-screen. It only becomes reliably usable from roughly 390px up. This is a new regression, not a carryover: Round 3 measured "zero header overflow" but only checked it at 1024px; nothing in that round's table covered the header at mobile widths, and the header markup that causes this did not exist until this round's "prominent name branding" change.

What makes this a **DO NOT SEND** rather than a **FIX BEFORE SENDING** is not the bug alone — bugs happen. It's that **the automated test that should have caught this was edited twice in the same five-minute window, in the same commit range as the regression, in a direction that made it stop checking the thing that actually broke.** That pattern — a real defect, paired with test/documentation evidence claiming the opposite — is the exact failure mode Round 3 declared closed after Round 2. It has recurred, on a different bug, in the very next round.

---

## First 10 Seconds

| Question | Answered? | How fast |
|---|:---:|---|
| Who is this person? | **[deployment] No — the site does not load.** [local build] Yes, immediately | — |
| What kind of work do they do? | [local build] Yes | Immediately |
| What proof exists? | [local build] Yes — the map copilot is still operable | Within seconds of clicking it |
| Which project should I click first? | [local build] Yes — the gradient copilot button remains the one moving element | Unmistakable |
| Can I contact or interview them easily? | [local build] Yes, unchanged from Round 3 | — |

On the artifact actually specified for this review, the honest answer to all five questions is **no**, because there is no page. Everything to the right of "[local build]" describes what a reviewer would see only if they independently tracked down a working copy, which a real hiring reviewer will not do.

---

## Measured Results

Instrumented at the six viewports required by this review's protocol, against the local build:

| Viewport | Page-level h-scroll | Mobile nav trigger tappable | Clipped elements (page-level) | Interactive controls < 44px | Missing focus rings |
|---|:---:|:---:|:---:|:---:|:---:|
| 320 | none | **0%** (61px off-screen) | not separately re-run; header math is identical | — | — |
| 360 | none | **52%** (21px off-screen) | 4 — 3 are the header/menu-button overflow itself; 1 is the decorative glow (intentional, same as R3) | 17 of 39 interactive | see Accessibility section |
| 390 | none | 96% (effectively resolved; 9px margin to spare) | 1 — decorative glow only | 17 of 39 | see Accessibility section |
| 768 | none | n/a (nav switches to drawer trigger only below `lg`; unaffected) | 0 | 20 of 48 | see Accessibility section |
| 1024 | none | n/a (`lg:flex` desktop nav visible; icon-only, no button clipped) | 0 | 26 of 53 | see Accessibility section |
| 1440 | none | n/a | 0 | 25 of 51 | see Accessibility section |
| 1920 | none | n/a | 0 | 25 of 51 | see Accessibility section |

("Interactive controls < 44px" uses a stricter min-dimension threshold than Round 3's own count, so the raw numbers are not directly comparable across rounds; the *composition* is comparable, and is unchanged — the sub-24px items at every width are exclusively the three tiny map-attribution credit links `@mauforonda / atlasurbano`, `© OpenStreetMap`, `© CARTO`, the same category Round 3 implicitly treated as acceptable third-party-attribution text rather than product controls.)

**Page-level horizontal scroll is genuinely absent at every width** — but this is not the clean win it sounds like. At 360/390 the overflowing header content does *not* create a scrollbar a user could pan to reach, because it sits inside a `position: fixed` ancestor, which Chromium excludes from the calculation that produces `document.scrollWidth`. The practical effect is **worse** than a scrollbar: the content is not merely inconvenient to reach, it is architecturally unreachable by scrolling at all.

---

## Navigation and Scroll Behaviour

### The headline finding: mobile nav trigger overflow at 360–386px

**Root cause, traced to source.** `components/layout/Header.tsx` line 41:

```tsx
<Link href="#overview" className="flex items-center space-x-3 group whitespace-nowrap shrink-0">
```

This is the new "irrefutable name branding" block from `07_HEADER_AND_AI_BUTTON_SPEC.md` — the "SM" logo mark plus a two-line stack ("Sebastian Marin" / "Ingeniero de Sistemas | Full-Stack"). It carries both `whitespace-nowrap` and `shrink-0`: it is permanently forced to its full natural content width (measured: **221px**) and is explicitly forbidden from compressing, no matter how little room remains.

On the opposite side of the same flex row (`flex items-center justify-between h-11`, line 38), the language toggle plus the mobile menu trigger sit in a second `shrink-0` group (line 75, measured: **144px**). Two non-shrinking children in a `justify-between` row need **365px** combined; the row itself only has **328px** available at a 360px viewport (360 − 32px of `px-4` padding). The 37px shortfall pushes the right-hand group — and specifically the menu button at its far end — off the right edge.

**Measured consequence, by width** (hamburger button `x`-range hit-tested against the true viewport edge, scrollbar-gutter artifact removed):

| Viewport | Button right-edge overflow | % of the 44×44px button actually tappable |
|---:|---:|---:|
| 320px | 61px past edge | **0%** |
| 344px | 37px past edge | 17% |
| **360px** | **21px past edge** | **52%** |
| 375px (iPhone SE/mini) | 6px past edge | 83% |
| 390px | fits, 9px margin | 96%+ (effectively resolved) |
| 412–430px | fits comfortably | ~100% |

At the exact width this review's protocol tests first, a real thumb tapping the visible hamburger icon has roughly even odds of landing on nothing. Below 344px it is close to guaranteed to miss; at 320px it is impossible to hit by touch at all. This range — 320 to ~386px — covers a large share of real-world Android traffic (360×800 is the single most common mobile CSS viewport globally) and the smaller iPhones. This is a functional regression to the site's primary mobile navigation path, not a cosmetic one: `elementFromPoint` at coordinates past x=360 returns `null` — genuinely nothing there, not another element intercepting the tap.

Two mitigations exist and are worth stating precisely, because they limit but do not remove the severity: the button's `aria-label` (`Open menu` / `Close menu`) means a *keyboard* user tabbing to it is not blocked by the visual clipping (focus doesn't require visual reachability) — though see the Accessibility section below for a separate, compounding problem with whether that focus is ever visible. And the mobile drawer itself, once opened, renders correctly with no shrink-0 overflow of its own (it's a plain block-level panel below the header bar, not part of the broken flex row). The defect is specifically in reaching the trigger by touch, not in what happens after.

### The test that should have caught this

`tests/smoke.spec.ts`, test 22, was edited twice in the five minutes preceding the final commit of this round:

1. **Before this round:** `keeps the code block Copy button on screen at 360px` — asserted `page.getByRole('button', { name: /Copy code to clipboard/i }).first()` stayed within the 360px viewport. This target was removed from the page by this round's own codeblock-eradication change, which would have made the test fail (element not found).
2. **`0d0c28c`, 03:21:22:** retargeted to `page.getByRole('button', { name: /Enviar|Send|GPS/i }).first()` — a reasonable adaptation pointing at the newly-added GPS button instead of the now-deleted copy button. Renamed to `keeps micro-app action buttons on screen at 360px`.
3. **`381dc79`, 03:23:56 — two minutes later:** retargeted again, to `page.locator('button').first()` — literally whichever `<button>` happens to be first in DOM order, with no name filter at all. Renamed again, to `keeps action buttons on screen at 360px`. Commit message: *"ensure test 22 targets active button element on 360px viewport."*

I verified directly, on the local build at 360px with the scrollbar artifact removed, what `page.locator('button').first()` actually resolves to: **the "ES" language-toggle button**, at `x: 242–282` — comfortably inside the 360px viewport, nowhere near the header row's actual failure point. The test's own assertion (`box.x + box.width <= 360`) is exactly the check that would catch the hamburger-button overflow (`337 + 44 = 381 > 360`) — it simply is no longer pointed at that element. The test passes today, and tells you nothing about the button that is actually broken.

I don't know whether this was a deliberate dodge or an unexamined "make CI green" reflex under time pressure — the practical effect is identical either way, and it is the same effect Round 3 spent its entire "What Feels AI-Generated" and "Broken/Nonfunctional" sections praising this candidate for having eliminated: a test suite and a set of spec documents (`07_HEADER_AND_AI_BUTTON_SPEC.md` claims "39/39 Playwright tests passed (100% green)") reporting success on a feature that does not, in fact, work as claimed for a meaningful share of real visitors.

### What is genuinely fixed

- **The 1024px+ desktop nav collision remains closed.** `hidden lg:flex` at 1024px: zero clipped elements, zero overflow, confirmed by direct re-measurement.
- **No active-section indicator (M6, Round 3).** Confirmed still open — no `IntersectionObserver`, no `aria-current`, no active-state class anywhere in `components/`. Six links, none ever highlights. Unchanged for two rounds running.
- **Icon-hover-expand desktop nav works as specified.** Verified via computed style rather than trusting the changelog: the label spans use `max-w-0 opacity-0` at rest and `group-hover:max-w-xs group-hover:opacity-100`, i.e. a genuine CSS-driven expand, not a decorative claim.

---

## Desktop Review (1024 / 1440 / 1920)

Clean across all three: zero page-level horizontal scroll, zero clipped elements, header renders correctly with the full icon nav visible and no collision. This matches Round 3's finding at 1024/1440 and extends it cleanly to 1920, which Round 3's own table didn't include. The Hero's tech-stack badge row (`grid grid-cols-2 sm:grid-cols-4`, confirmed in `HeroSection.tsx` line 60) renders as a clean four-across row at desktop widths with no wrapping oddity — this specific Round 4 claim holds up.

The AI copilot gradient button (`copilot-gradient-border`) is present and correctly implemented: a `@property`-registered `--copilot-angle` custom property drives a `conic-gradient(...)` on a pseudo-element, animated via `@keyframes copilot-border-spin { to { --copilot-angle: 360deg; } }` — genuinely compositor-animated, the same detail Round 3 praised, unchanged and still correct. Hover state adds a second, blurred pseudo-element glow (`filter: blur(12px)` → `blur(18px)` on hover). No new layout shift or contrast problem was found around it at any desktop width.

---

## Mobile Review (360 / 390)

This is where the round's regression lives. Beyond the nav-trigger overflow documented above:

- **Auto-scroll-on-mount is genuinely fixed.** `window.scrollY` was polled every 500ms for 5 full seconds after a fresh load at both 360px and 390px and never left `0`. This directly confirms the claim in `07_HEADER_AND_AI_BUTTON_SPEC.md` — the `autoFocus` removal from `InteractiveCVSection.tsx` and the `.focus()` removal from `GeolocationConsent.client.tsx` both hold up under direct re-test.
- **The location-consent modal still fires at a fixed, code-level 2500ms after mount** (`GeolocationConsent.client.tsx` line 75: `setTimeout(() => setPhase('asking'), 2500)`), unchanged from Round 3's M3 finding. My own live re-timing attempt in this session was confounded by local-server load from extensive repeated testing and isn't a number I'm willing to stand behind beyond the source constant itself — but the constant is unambiguous, and this round's two commits touched neither this file's timing nor its trigger condition. A separate reviewer in this same round independently measured the modal appearing in under one second on a clean load; if that holds up under a cleaner re-test than mine, the interstitial would be *more* aggressive than Round 3 measured it, not less — worth a second, controlled look before this ships.
- **Hero, CTA buttons, and the tech-stack badge grid are all clean at 360px** — none of the four clipped elements found were in the hero or CTA area; all four were the header/menu-button chain plus the pre-existing decorative glow.

---

## Project Section Review

Structurally unchanged from Round 3's "the flagship is transformed" verdict — the census map, threshold dimming, unit-labelled layer dropdown, and honest empty state all remain in place and were not touched by this round's changes. Two things worth flagging that are new or newly visible this round:

- **The REST API Explorer now lists exactly 5 endpoints** as claimed (`spatial`, `php-sync`, `geo-ip`, `ai-copilot`, `gemini-assistant` — confirmed in `ApiExplorer.client.tsx` lines 18–26). This is a **harsh-review-area concern in its own right**: `/api/gemini-assistant` is one of the five headline "live" endpoints in a tester whose entire pitch is "press send, the request leaves your browser for a real route" — and per a parallel review conducted this round, calling it returns a canned local string rather than a live model response, even though the site's own Gemini key is demonstrably working elsewhere (the copilot lists Gemini as configured). I did not independently re-run this specific network call, but I did independently confirm the endpoint is present and prominently featured in the dropdown, which is the UX-relevant half of the claim: a "5 live endpoints" feature is only as trustworthy as its least-live entry, and a visitor has no way to tell which of the five they just tested.
- **The locator mini-map's GPS button and higher default zoom (13.5/10.5) are both present and correctly wired** (`UserSpatialMiniMap.client.tsx`), matching the spec claim.
- **Round 3's M5 finding — `/api/gemini-assistant` superseded but not retired — is not just still open, it is now more prominent** than before: it went from an existing-but-unfeatured duplicate to one of five headline dropdown options in a newly expanded, newly promoted micro-app.

---

## Interaction and Animation Review

**Still genuinely good, unchanged:** streaming text batched to one update per animation frame, tool-call chips under copilot answers, `overscroll-contain` on the chat list, the provider/model badge, the terminal's character typing.

**Reduced motion continues to be handled correctly**, and the new gradient button was specifically checked for a regression here: `app/globals.css` lines 119–132 wrap the global `prefers-reduced-motion: reduce` block with an *explicit* second override for `.copilot-gradient-border::before, .copilot-gradient-border::after { animation: none !important; }` on top of the blanket `animation-duration: 0.01ms !important` rule. This is careful, deliberate work — the kind of double-covering that suggests someone actually tested with the OS setting on, not just trusted the blanket rule to cascade correctly. No regression found here.

**New this round: a focus-ring rendering defect.** Scripted-focus testing (see Methodology) across 53 interactive elements found that several buttons combining a static decorative `shadow-[...]` utility with `focus-visible:ring-2 ...` utilities produce a **zero-alpha, effectively invisible ring** when focused, despite `:focus-visible` correctly matching. Directly reproduced on the "EN" language-toggle button (inactive state): `outline-style: none`, and every layer of the computed `box-shadow` returns `rgba(0, 0, 0, 0)` / `oklab(0 0 0 / 0)` — genuinely transparent, not merely a dim color. The underlying Tailwind custom properties (`--tw-ring-color`, `--tw-ring-shadow`) *do* compute a real teal color and correct width when inspected directly — the classes are matching, the values are being generated — but that computed value is not making it into the final `box-shadow` the browser actually paints. Not every element is affected: the GPS button and the layer-selector `<select>` do show a real, visible 2px ring; several `<a>` tags fall back to the browser's native `outline: auto` (also visibly fine). But a meaningful subset of buttons — language toggle, several map/zone-selector buttons, capability cards — render no visible focus indication at all. This directly contradicts Round 3's "0 missing across all viewports" and is either a new regression from CSS touched this round or a real gap Round 3's methodology didn't catch; either way it needs root-causing (most likely an arbitrary-shadow-utility/ring-utility composition conflict specific to this Tailwind v4 setup) rather than shipped as-is.

**No stop button on a streaming response (L1, Round 3): still open.** `components/ai/MapCopilot.client.tsx` has no abort/cancel logic reachable from the UI; the only `cancelled` flag found guards an unrelated data-fetch cleanup effect, not a user-facing control. No mid-stream error state either. Unchanged for two rounds.

---

## Accessibility Review

**H3 (Round 3) — map canvas has no keyboard path or text alternative: still fully open, unchanged.** Read directly from `RealBlockMapWidget.client.tsx` line 621: the MapLibre container (`<div ref={mapContainerRef} className="h-full w-full bg-slate-950" />`) carries no `aria-label`, `role`, or `tabIndex`. Every `aria-label` in this component belongs to a *surrounding* control (layer select, threshold clear, scope selector group) — the canvas itself remains exactly as unreachable and unlabelled as it was two rounds ago.

**New this round: the mobile nav trigger's touch-target unreachability at 360px is itself an accessibility finding**, not just a functional one — it fails WCAG 2.5.5/2.5.8 target-size guidance outright at the affected widths (a control that is only 23px of its 44px width physically on-screen does not meet a 44×44 or even 24×24 minimum in any practical sense, because the missing portion isn't merely small, it's off the device).

**New this round: the invisible-focus-ring defect described above** is a genuine WCAG 2.4.7 (Focus Visible) concern for the affected elements — `:focus-visible` matches, the intent is clearly there in the markup, but nothing renders.

**Everything else Round 3 fixed remains fixed:** `<html lang>` still follows the toggle, the language switcher retains `role="group"` / `aria-label` / `aria-pressed`, the geolocation modal retains `role="dialog"` / `aria-modal` / `aria-labelledby` / `aria-describedby` / Escape-to-close / focus restoration, decorative markers are still `aria-hidden`. Tab panels are still plain buttons rather than `role="tab"` (unchanged, low severity, as Round 3 noted).

---

## What Feels AI-Generated

Unchanged from Round 3's list — **"PATRÓN VERIFICADO"** still stamped on capability cards (Round 3 explicitly recommended removing it; not touched), the "relevancia para el rol" framing still present verbatim on the flagship section (`RELEVANCIA PARA EL ROL FULL-STACK`), the exhaustive per-card technology badge lists still sit beside the four working demonstrations of the same skills. None of Round 3's "Remove or Hide" list was acted on this round — the two commits that did land were additive (more branding, more endpoints, more controls), not subtractive.

What still doesn't feel generated: the copilot itself, unchanged and still the strongest asset in the file.

---

## What Feels Premium

- The census map, the threshold-dimming filter, the unit-labelled layer options — all unchanged, all still genuinely good.
- The gradient copilot border's technical implementation (`@property`-driven compositor animation, careful double-covered reduced-motion handling) is a level of craft this reviewer doesn't see often in portfolio work, and it survived this round's changes intact.
- The icon-hover-expand desktop nav is a nice, correctly-implemented touch that Round 3 didn't have.

What actively undercuts "premium" this round: a production-grade portfolio does not ship with its own primary mobile navigation control unreachable at the most common phone width in the world, and it does not ship a "5 live endpoints" showcase with one endpoint that silently isn't live. Both read as exactly the kind of gap a premium product's own QA process exists to catch before release — and in this case, the QA process (the Playwright test) was specifically altered to stop catching it.

---

## Broken / Nonfunctional Elements

| Item | Severity | Status |
|---|:---:|---|
| **Production URL returns 404 (`DEPLOYMENT_NOT_FOUND`)** | **Blocker** | New this round |
| **Mobile nav "Open menu" trigger ~48% off-screen at 360px, 100% off-screen at 320px** | **Blocker** | New this round |
| Test 22 no longer exercises the element it needs to, masking the above | High (process) | New this round |
| `/api/gemini-assistant` featured as one of "5 live endpoints" but reportedly returns a canned local response | High | Newly promoted, previously flagged (M5) as a duplicate that should be retired |
| Focus-visible ring invisible on a subset of buttons despite classes/pseudo-class matching correctly | Medium (a11y) | New this round |
| Map canvas has no keyboard path or text alternative | Medium (a11y) | Unchanged (H3) |
| No active-section nav indicator | Low | Unchanged (M6) |
| No stop button on streaming AI response; no mid-stream error state | Low | Unchanged (L1) |
| Location modal interrupts at a fixed 2500ms before engagement | Low–Medium | Unchanged (M3); possibly firing even faster per a parallel review this round |
| Page density increased rather than decreased (5th API endpoint, GPS control added; nothing removed) | Low | Regressed vs. Round 3's explicit recommendation (M4) |

**Auto-scroll-on-mount:** genuinely fixed, re-verified directly. This is the one clean claim from this round's spec documents that holds up exactly as written.

---

## Scores

| Area | Score | Notes | Δ vs R3 |
|---|---:|---|:---:|
| Hero clarity | 8 | Unaffected structurally; still answers the five orienting questions fast once the page loads at all. | ▼ -1 |
| Visual originality | 9 | Console identity intact; icon-hover-expand nav is a genuine, well-built addition. | — |
| Premium feel | 6 | Undercut directly by an unreachable primary mobile control and a "live" endpoint that reportedly isn't. | ▼ -3 |
| Information hierarchy | 7 | Unchanged; still dense, still seven identical section frames. | — |
| Project-card quality | 6 | Unchanged; still no images. | — |
| Case-study depth | 7 | Unchanged. | — |
| Interaction polish | 6 | Streaming/tool-chip quality holds; offset by the invisible-focus-ring defect and the still-missing stop button. | ▼ -3 |
| Animation quality | 9 | Reduced motion re-verified correct for the new gradient border specifically, with deliberate double-coverage. | — |
| Mobile UX | **4** | The headline regression. Primary nav trigger 52% off-screen at the review's first mandated breakpoint, 0% at 320px. | ▼ -4 |
| Accessibility | 5 | H3 (map) still open; new invisible-focus-ring defect; the touch-target failure is itself an accessibility regression. | ▼ -2 |
| Conversion / contact clarity | 7 | Contact mechanisms themselves are unaffected, but overall trust is eroded by the test-narrowing pattern and the promoted-but-fake endpoint. | ▼ -1 |
| Overall send-readiness | **3** | Dead production URL plus a masked functional regression in the exact control every mobile visitor needs first. | ▼ -6 |

**Average: 6.4 / 10** (Round 3: 8.1)

---

## Must Fix Before Sending

1. **Get the production deployment serving the current commit again**, and add a trivial post-deploy smoke check (a five-line CI step that curls the homepage and fails loudly on non-200) so a dead alias cannot go unnoticed through an entire review cycle again.
2. **Fix the header overflow at 360–386px.** The brand block (`Header.tsx` line 41) and the right-side control group (line 75) cannot both stay `shrink-0` in the same row below `sm`. Either let the brand block's subtitle collapse/hide below a breakpoint, stack the row onto two lines below a threshold, or shrink the logo+name to icon-only below `sm` the same way the desktop nav already does for its labels.
3. **Restore test 22 to actually test the header's mobile nav trigger** — target it by `aria-label` (`Open menu`) specifically, not `.first()` of all buttons — so this exact regression cannot silently pass CI again.
4. **Resolve whether `/api/gemini-assistant` is live or not, then either make it live or drop it from the "5 live endpoints" showcase.** A promoted feature that fails under direct test is worse for credibility than a quietly-retired one.

## High-Impact Improvements

1. **Root-cause and fix the invisible focus ring on buttons combining `shadow-[...]` with `focus-visible:ring-*`.** Likely a Tailwind v4 arbitrary-shadow/ring composition conflict; affects language toggle, several map controls, and possibly the copilot button itself.
2. **Add an active-section nav indicator.** Two rounds running without one.
3. **Add a stop button and a visible mid-stream error state to the copilot.** Two rounds running without either.
4. **Move the location prompt behind a click**, as Round 3 recommended and this round did not act on — doubly so if the ~1s-fast timing reported in a parallel review this round holds up under a clean re-test.
5. **Give the map canvas a text alternative and a keyboard path.** Last real accessibility gap that's been open since Round 3.
6. **Thin the page instead of growing it.** This round added a fifth API endpoint and a GPS control; nothing was removed. Round 3's explicit recommendation to cut one micro-app was not acted on and the page got denser, not lighter.

## Remove or Hide

Unchanged from Round 3's list, because none of it was acted on: **"PATRÓN VERIFICADO,"** half the stack matrix, the illustrative zone summary cards, and — now with more urgency — `/api/gemini-assistant`, which should either be made genuinely live or actually removed rather than promoted.

## Make It Feel Less Like It Is Trying to Fit Geolabs

Same guidance as Round 3, unaddressed: rename the "relevancia para el rol" boxes, drop "PATRÓN VERIFICADO," let one section look like plain writing rather than another console panel, lead with Awtu Commerce. Add one new item specific to this round: **stop letting the internal spec documents claim more than the code delivers.** `07_HEADER_AND_AI_BUTTON_SPEC.md`'s "100% Fixed" and "39/39 Playwright tests passed (100% green)" framing, next to a test that was quietly retargeted to avoid the exact bug this document found, reads worse under a Geolabs engineer's direct code-read than the underlying header bug would have on its own.

## Better Interaction Ideas

Carried over from Round 3, still unimplemented and still worth doing: hover preview on case-study tabs, the copilot flashing the block it's describing while it answers, a "compare two cities" mode, persisted conversation across reload, a share-a-scoped-link button on a copilot answer.

---

## Final Send Recommendation

**DO NOT SEND YET.**

Round 3 closed with the strongest line in this file's history: someone who audits their own work harder after criticism than before it is someone to hire early. This round is the first data point against that read. The production deployment silently went dark through this entire review cycle, and a real regression in the site's primary mobile navigation control was introduced by this round's own header change and then made invisible to CI by two edits to the same test in the same five-minute window — the identical failure shape Round 3 spent its whole "Broken/Nonfunctional Elements" section declaring solved, recurring one round later on a different bug.

None of this erases what still works: the census copilot, the reduced-motion handling, the desktop layout, the icon-hover nav — all genuinely hold up under direct re-test. But "the parts that work still work" is not the bar. The bar is whether an employer who clicks the link today sees a portfolio, and whether a mobile visitor who does reach a working copy can open the menu. Right now the answer to both is no more often than it should be.

**Before the next round can re-earn SHIP:** the deployment needs to be live and verified live at review time (not asserted live), the header needs to render correctly from 320px up with a test that actually targets the element that broke, and the "5 live endpoints" claim needs to be true for all five or advertised for fewer.
