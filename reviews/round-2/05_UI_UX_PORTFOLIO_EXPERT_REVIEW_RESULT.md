# UI/UX Portfolio Expert Review

**Round:** 2
**Reviewer persona:** Senior UI/UX designer — developer portfolios and premium SaaS interfaces
**Review date:** 2026-07-26
**Method:** live production build experienced as a user first, then instrumented across six viewports, then source inspection to diagnose what I found

---

## Overall Verdict

**FIX BEFORE SENDING.**

Round 1 said SHIP. I disagree, and I want to be specific about the disagreement rather than just contradicting a colleague.

Round 1's UI/UX verdict praised "zero horizontal overflow on mobile (360px–1920px)." I measured the same thing and got the same top-line result — `document.body.scrollWidth` equals the viewport at every breakpoint from 360 to 1920. But that number is produced by `overflow-x: hidden` on `body` in `globals.css`. The page doesn't scroll sideways because sideways scrolling has been switched off. Underneath it, **22 elements extend past the right edge at 360px**, including a "Copy" button that lands at x=362 on a 360px screen — clipped, invisible, unreachable.

That is the difference between "no overflow" and "overflow suppressed." The distinction matters because one is a layout that fits and the other is a layout that has been told not to complain.

Set that aside and the design work here is genuinely good. The visual system is coherent and has a point of view. But a portfolio whose headline interactive feature renders a blank screen on its first tab is not in ship state, whatever the aesthetics.

---

## First 10 Seconds

The five questions a developer portfolio must answer:

| Question | Answered? | How fast |
|---|:---:|---|
| Who is this person? | **Yes** | Immediately — name, title, country, photo-less but unambiguous |
| What kind of work do they do? | **Yes** | Immediately — the headline is specific and un-generic |
| What proof exists? | **Partly** | The map is proof. Everything else is assertion. |
| Which project should I click first? | **Yes** | The primary CTA is unmistakable and points at the best work |
| Can I contact or interview them easily? | **Partly** | Email and phone are real; the form is not |

Four and a half out of five inside ten seconds is a strong result. The hero does its job: clear hierarchy, one obvious primary action, a secondary and tertiary action correctly de-emphasised, and a right-hand card that gives an executive everything they need without scrolling.

The visual identity registers immediately and it is not a template. Near-black `#0B0F17`, a single teal accent used only for live/interactive states, monospace for data and sans for prose, a faint 32px telemetry grid, one soft radial glow. It commits to the operations-console metaphor and follows through consistently, which is what separates an identity from a colour scheme.

---

## Navigation and Scroll Behaviour

**Works well:**
- Sticky header with a genuine state change at 20px of scroll — transparent to blurred/bordered. Subtle and correct.
- Scroll progress bar is spring-damped, sits at the top, fits the console metaphor rather than decorating it.
- `scroll-smooth` on `<html>` with anchor navigation. Section IDs (`#overview`, `#flagship`, `#projects`, `#stack`, `#cv`, `#contact`) all resolve.
- Section reveals fire once (`useInView` with `once: true`) — no re-animating on scroll-back, which is the single most annoying thing scroll animation libraries do by default.

**Broken:**
- **The header collides with itself at exactly 1024px.** The desktop nav appears at the `lg` breakpoint (1024px), and at that width the logo + six nav links + language switcher + CV button do not fit. The right-hand action group (`hidden sm:flex … whitespace-nowrap`) overflows the container — 12 elements past the right edge, measured. Because `whitespace-nowrap` prevents wrapping and body overflow is hidden, the CV button is simply clipped. iPad Pro landscape and small laptops hit this exactly.
- **No active-section indication.** Six nav links, none of which ever highlights. On a single-page site with scroll navigation, the nav is the reader's map, and this one never says "you are here."
- **The mobile drawer is gated on the wrong breakpoint.** The hamburger button is `sm:hidden` (hidden ≥640px) but the drawer panel is `lg:hidden` (hidden ≥1024px). Between 640px and 1024px there is no visible way to open the nav — the button is gone and the desktop nav hasn't appeared yet. Tablet users get no navigation at all.

---

## Desktop Review

**1440px and 1920px** — the design's home territory, and it looks the part. The 12-column grid splits cleanly, the hero's 7/5 split is well proportioned, the flagship's 7/5 map-to-analytics ratio is the right call, and content is properly bounded at `max-w-7xl` so the 1920px view doesn't stretch into an unreadable line length. At 1920px I measured zero overflowing elements. Clean.

**1024px** — the breakpoint collision described above. This is the most-used laptop width in the world and it's the width where the header breaks.

**Visual quality at desktop:**
- Spacing is consistent (`py-20` sections, `space-y-4/6/8` internally) — the rhythm is deliberate.
- Alternating section backgrounds (`#0b0f17` → `#090d14` → `#070a11`) create separation without borders doing all the work. Nicely judged.
- `items-stretch` on the card grids means equal-height cards. Somebody cared.
- Shadow usage is heavy — `shadow-2xl` on almost every card. On a near-black background shadows do very little except add render cost. The borders are already doing the separation work.

---

## Mobile Review

Measured at 360px and 390px:

| Metric | 360px | 390px |
|---|---:|---:|
| Body scroll width vs viewport | 360 / 360 | 390 / 390 |
| Elements extending past the right edge | **22** | **16** |
| Interactive elements below 44×44px | **32 of 56** | **30 of 54** |

**The code block header is the clearest failure.** `CodeBlock` renders a `justify-between` row: filename + language chip on the left, Copy button on the right. With a filename like `components/map/RealBlockMapWidget.client.tsx`, the left group alone measures 58→362px on a 360px screen. The Copy button starts at x=362 — off-screen, clipped by the body's hidden overflow. Every code block on the page, and there are seven, has an unreachable Copy button on a small phone. The row needs `min-w-0` + `truncate` on the filename, or the header needs to wrap.

**Tap targets are the systemic problem.** The `ES`/`EN` switcher on mobile measures **29×21px**. WCAG 2.5.8 sets 24×24 as the AA minimum and Apple's HIG recommends 44×44. This control is below the accessibility floor on one axis, and it is the single most important control on the page for a bilingual reviewer — it's the first thing anyone on our side touches. The layer pills (27px tall), the Copy buttons (23px), and the AI trigger (28px) are all in the same category.

**The flagship section is a very long scroll on mobile.** Stacked: scope tabs → layer pills → 460px map → zone metrics card → comparison chart → proof list → relevance box → code block. That's roughly four screens of dense monospace at 10–11px. The 10px uppercase mono labels (`text-[10px]`) are at the edge of legible on a phone, and there are dozens of them.

**What works on mobile:** the layout genuinely does reflow — grids collapse to single column, the hero stacks sensibly, the drawer animates cleanly, and the map is touch-responsive with working pinch-zoom. The bones are right. It's the details that are clipped.

---

## Project Section Review

**Structure:** tabbed case studies with problem → solution → stack → proof → code. The pattern is good and the tab interaction is smooth (`SectionReveal` keyed on `activeStudy.id` re-triggers the reveal on switch — a nice touch).

**What's missing is everything visual.** No screenshots. No images. No recordings. No links. Four case studies describing software, and there is not one picture of any of it.

The `CaseStudy` TypeScript interface literally declares:

```ts
liveDemoUrl?: string;
githubUrl?: string;
```

Neither field is populated on any of the five case studies, and the component never renders them. Round 1's fix #3 was "Add Direct Live Demo Links to Case Study Cards." The data model was extended to support it and the work stopped there.

So the reader's experience is: read a paragraph, look at a code snippet the candidate typed into a data file, move on. For Awtu Commerce — real commercial work with a real payment gateway — there is nothing to look at and nowhere to go.

**The metric pills damage more than they help.** "60 FPS", "AI Summary Latency < 800ms", "Execution Overhead < 45ms", "Calculation Speed < 16ms (Inmediato)". Presented in monospace, in bordered tiles, in the visual language of a telemetry readout. None of them are measurements. Designing an estimate to look like an instrument reading is a design decision, and it's the wrong one.

**The flagship map — and the reason this review says FIX BEFORE SENDING.**

The intent is the most technically ambitious thing I've seen in a candidate portfolio this year: real INE census blocks, authentic irregular geometry, four metric layers with data-driven colour scales, click-to-inspect, animated transitions between cities.

**None of it is on screen.** The census layer renders zero polygons — not in the national view, not in any city. What a visitor actually sees is a dark street basemap. It looks intentional, which is why I did not catch it by eye and neither did the previous review; the engineers found it by querying the map for rendered features and getting zero back. The cause is a latitude/longitude ordering mistake carried over from the Leaflet implementation, which parks the camera in the South Atlantic.

From a pure UX standpoint this is the worst possible failure mode: **the interface gives no indication that anything is wrong.** No spinner stuck, no error, no empty state. The scope tabs animate, the layer pills highlight, the legend renders its gradient — a complete set of controls for a dataset that isn't there. A user's only signal is a vague sense that the map is boring.

The rest, still true and still needing fixing once the blocks appear:
- **The "Bolivia Nacional" tab has a second, independent reason to be empty.** The archive has no tiles below zoom 8; the app flies to zoom 5.5. Even with the camera corrected, that view needs an explicit "no coverage at this zoom" message. There is none.
- **No attribution is displayed.** `attributionControl: false` and nothing added back. CARTO, OpenStreetMap, and the dataset author are all uncredited. Beyond the licence obligation, an unattributed map looks unfinished to anyone who works with maps.
- **The block inspector could never identify a block.** It falls back to the literal string "MANZANO REAL INE" because the tile schema has no ID field — the fallback is the only reachable branch.
- **Layer pills can silently do nothing.** The paint-update effect bails out if the style hasn't loaded and never retries. Click a layer during load and nothing happens, with no feedback either way.

---

## Interaction and Animation Review

**Good restraint overall.** 0.5–0.7s durations, small 15–24px translations, a sensible custom easing curve, staggered hero entrance with 0.1s increments. Nothing bounces, nothing slides in from off-screen, nothing draws attention to the animation itself. This is disciplined motion design and it's rarer than it should be.

**Specific interactions:**
- Copy-to-clipboard with a 2s checkmark confirmation — correct pattern, well implemented.
- The CV PDF modal (iframe with `#toolbar=0`, download action in the header) is a genuinely nice touch.
- Map `flyTo` with a 1200ms duration between cities feels good.
- Hover states are consistent across cards, pills, and links.

**Problems:**

- **The contact form's success state is a lie.** `handleSubmit` calls `preventDefault()` and `setFormSubmitted(true)`. Nothing is transmitted. The UI then displays a green checkmark and "sent successfully." This is the most serious interaction defect on the site — not because it's technically complex, but because the interface makes a factual claim that is false, and the user has no way to detect it.
- **The AI button returns the wrong region.** Select La Paz, click "Ejecutar Análisis IA Gemini", receive a paragraph about Equipetrol in Santa Cruz. Reproducible every time. From a UX standpoint this is worse than an error state, because a confident wrong answer teaches the user to distrust the whole panel.
- **Reduced motion is only half-honoured.** `globals.css` has a `prefers-reduced-motion` block that zeroes out CSS `animation-duration` and `transition-duration`. But every meaningful animation on this page is **Framer Motion**, which animates via JavaScript-driven inline transforms — completely unaffected by that CSS rule. A user with vestibular sensitivity who has set the OS preference still gets the full set of scroll reveals, the hero stagger, and the spring-damped progress bar. The fix is `useReducedMotion()` from `framer-motion`, wired into `SectionReveal` and the hero. The CSS block currently provides the appearance of compliance without the substance.
- **No focus-visible styling anywhere.** More on this below.

---

## Accessibility Review

This is the weakest dimension of the site, and several items here are also Round 1 fixes that were never applied.

| Issue | Standard | Severity |
|---|---|:---:|
| **`<html lang="es">` never changes when the user switches to English.** Static in `layout.tsx`; the language toggle only swaps a React context value. Screen readers announce English content with a Spanish voice. | WCAG 3.1.1 / 3.1.2 (A) | **High** |
| **Language switcher has no accessible state.** Two buttons labelled "ES" and "EN", no `aria-pressed`, no `aria-label`, no `role="group"`, no announcement of which is active. Active state is conveyed by background colour alone. | WCAG 1.4.1, 4.1.2 (A) | **High** |
| **No visible focus indicators.** No `focus-visible:` utility appears anywhere in the codebase, and the mobile menu button explicitly sets `focus:outline-none` with no replacement. Keyboard navigation is possible but invisible. | WCAG 2.4.7 (AA) | **High** |
| **Tap targets below minimum.** 32 of 56 interactive elements under 44×44px at 360px; the language switcher at 29×21px is below even the 24×24 AA floor on one axis. | WCAG 2.5.8 (AA) | **High** |
| **Reduced motion not honoured for JS animations.** CSS-only override; all real animation is Framer Motion. | WCAG 2.3.3 (AAA), user-preference respect | **Medium** |
| **The PDF modal is not a dialog.** No `role="dialog"`, no `aria-modal`, no focus trap, no Escape handler, no focus restoration on close. Keyboard users can tab straight out of it into the page behind. | WCAG 2.1.2, 4.1.2 (A) | **Medium** |
| **Tab panels are not tabs.** Case studies, CV sections, and capability pillars all use plain `<button>` elements with no `role="tab"`, `aria-selected`, or `aria-controls`. | WCAG 4.1.2 (A) | **Medium** |
| **The map canvas is unreachable by keyboard and unlabelled.** No text alternative, no keyboard interaction path for the flagship feature. | WCAG 1.1.1, 2.1.1 (A) | **Medium** |
| **Decorative `//` markers are read aloud.** Seven section headers begin with a literal `//` span, which screen readers announce as "slash slash." | WCAG 1.3.1 (A) | **Low** |
| **10px monospace body text.** `text-[10px]` used extensively for data labels — below comfortable reading size, and dense at that scale. | WCAG 1.4.4-adjacent | **Low** |

**Contrast is the bright spot.** Teal `#14b8a6` and `#5eead4` on `#0B0F17`, slate-300 body text on near-black — all comfortably above 4.5:1. The colour system was clearly built with contrast in mind. Slate-500 on slate-950 for the smallest labels is marginal, but it's used for secondary text only.

---

## What Feels AI-Generated

I'm asked to be harsh here, so:

1. **The metric-pill pattern.** Every project has two to four bordered tiles containing a label and a value. When the value is "0% (Proxy Backend)" or "100% Validadas" or "Configurable", the tile exists because the template has a slot, not because there was a number to report. This is the strongest tell on the page.
2. **Machine vocabulary applied to a human.** "LISTO PARA DESPLIEGUE." "DIAGNÓSTICO TÉCNICO." "PATRÓN VERIFICADO." "PUNTOS DE PRUEBA TÉCNICA." A person is being described in the register of a CI pipeline.
3. **Section-header uniformity.** Seven sections, each with: centred `//` marker, centred uppercase mono tag, centred heading, centred paragraph, then a grid. Identical structure seven times reads as generated, even when the content underneath isn't.
4. **The stack matrix.** Nineteen technologies, each with a level badge and a one-line description, arranged in a grid. Exhaustive lists are what generators produce; humans pick six things and say something interesting about each.
5. **The "relevance to the role" box on every project.** Five projects, five paragraphs explaining relevance to a specific employer. No human writes that five times without wincing.
6. **Precision without provenance.** "< 800ms", "< 45ms", "< 16ms", "60 FPS", "168 tokens". Specific enough to look measured, absent from any measurement.

**What does NOT feel AI-generated,** and deserves saying: the census map. The choice of dataset, the decision to decode a minified attribute schema by hand, the four metric layers, the specific cities. No generator produces that. It is unmistakably the work of a person who wanted to see if it would work.

---

## What Feels Premium

- **The colour discipline.** One accent, used only for interactive and live states. Never decorative. This is the hardest thing to get right in a dark UI and it's right here.
- **The type pairing.** Inter and JetBrains Mono, with a consistent semantic split — mono means "this is data," sans means "this is prose." Applied consistently enough that the typeface itself carries meaning.
- **The console metaphor, followed through.** Status chips, uppercase field labels, telemetry grid, scroll progress, terminal-styled code panes. A metaphor pursued to completion reads as intentional design.
- **The CV modal.** Embedded PDF with the browser toolbar suppressed and a download action in the header. That's a considered detail.
- **Motion restraint.** Nothing showing off.
- **The map, once it works.** Real irregular census geometry in a well-chosen colour ramp over a dark basemap is genuinely beautiful — and it is beautiful precisely because the data is real. Everything needed for that is built; it is pointed at the wrong coordinates.

---

## Broken / Nonfunctional Elements

| Element | Behaviour | Impact |
|---|---|:---:|
| **The entire census layer** | Renders zero polygons in every scope — camera coordinates are `[lat, lng]` where MapLibre needs `[lng, lat]`, placing it outside the dataset's bounds. No error, no empty state; the controls all behave as if data were present | **Blocker** |
| **"Bolivia Nacional" map scope** | Additionally has no data below zoom 8, with no message explaining it | **Blocker** |
| **Contact form submit** | Displays "sent successfully"; sends nothing | **Blocker** |
| **"Ejecutar Análisis IA Gemini"** | Always returns Santa Cruz / Equipetrol regardless of the selected city | **Blocker** |
| **Block inspector ID** | Always "MANZANO REAL INE" — fallback is the only reachable branch | High |
| **Code block Copy buttons (7×)** | Clipped off-screen at 360px | High |
| **Header at 1024px** | CV button clipped; nav and actions collide | High |
| **Navigation at 640–1023px** | Hamburger hidden at `sm:`, drawer hidden until `lg:` — no nav available | High |
| **Language toggle (EN)** | 12 strings remain in Spanish, including the whole hero card | High |
| **Flagship proof points** | Render in English while the site is in Spanish (`proofPointsEs` exists, unused) | Medium |
| **Layer pills during load** | Silently no-op before the map style finishes loading | Medium |
| **Map attribution** | Not rendered at all | Medium |
| **Reduced-motion preference** | Ignored by all Framer Motion animation | Medium |
| **PDF modal** | No Escape key, no focus trap, no focus restoration | Medium |

**Console errors on load:** none. **Broken external links:** none — every outbound link resolves.

---

## Scores

| Area | Score | Notes |
|---|---:|---|
| Hero clarity | 9 | Answers four of five key questions in ten seconds. Excellent. |
| Visual originality | 8 | The console identity is a real point of view, consistently executed. |
| Premium feel | 8 | Colour discipline, type pairing, and motion restraint all read as considered. |
| Information hierarchy | 7 | Strong within sections; seven identical section structures flatten the page. |
| Project-card quality | 5 | Well-written, well-organised, and completely without images or links. |
| Case-study depth | 6 | Good problem/solution structure; proof is assertion, and metrics are decorative. |
| Interaction polish | 5 | Genuinely nice details alongside a form that lies and an AI that answers wrong. |
| Animation quality | 8 | Restrained and well-tuned. Docked for ignoring reduced-motion. |
| Mobile UX | 5 | Reflows correctly; 22 clipped elements and 32 undersized tap targets at 360px. |
| Accessibility | 3 | Frozen `lang`, no focus indicators, undersized targets, unlabelled toggle, non-modal modal. |
| Conversion / contact clarity | 5 | Email and phone are real and prominent. The form actively misleads. |
| Overall send-readiness | 5 | Excellent bones, three blocking defects, one accessibility layer effectively missing. |

**Average: 6.2 / 10**

---

## Must Fix Before Sending

Only genuine blockers.

1. **The census layer must actually render.** Fix the `[lat, lng]` / `[lng, lat]` camera ordering, and add a test that asserts polygons are present — an interface that presents a full control surface for absent data is the most misleading state a UI can be in. Then give the national scope an explicit in-map message, since it genuinely has no data below zoom 8.
2. **The contact form must stop reporting false success.** Wire it to a real destination or convert it to a `mailto:` composer with honest confirmation copy.
3. **The AI analysis must describe the region the user selected.** Currently returns Santa Cruz for every city.
4. **`<html lang>` must follow the language toggle,** and the twelve untranslated strings must be translated. The keys already exist in `translations.ts` — `activeZone`, `legendTitle`, `legendLow`, `legendHigh`, `scopeLabel` are all defined in both dictionaries and simply aren't being used.
5. **Add visible focus indicators.** A single `focus-visible:ring-2 focus-visible:ring-teal-400` utility applied across interactive elements. Currently a keyboard user cannot see where they are.

---

## High-Impact Improvements

Things that would make the site feel twice as good.

1. **Add images.** One screenshot per project. This is the highest-leverage change available — a portfolio about building visual interfaces currently contains one picture, and it's the map.
2. **Fix the mobile tap targets.** 44×44 minimum, starting with the language switcher. Thirty-two undersized controls is a systemic issue, not a detail.
3. **Fix the `CodeBlock` header overflow.** `min-w-0` + `truncate` on the filename group; keep the Copy button pinned. Seven blocks affected.
4. **Add active-section highlighting to the nav.** An `IntersectionObserver` over the section IDs. On a single-page site, this is the reader's orientation.
5. **Fix the 640–1023px navigation gap and the 1024px header collision.** Move the hamburger to `lg:hidden` to match the drawer, and let the header actions wrap or collapse below `xl`.
6. **Honour `prefers-reduced-motion` properly** via `useReducedMotion()` in `SectionReveal` and the hero.
7. **Restore map attribution.** A compact `AttributionControl`. Licence obligation, and it makes the map look finished.
8. **Give the flagship a real empty/loading state** for every scope, not just the initial dynamic-import spinner.

---

## Remove or Hide

1. **The unverifiable metric pills** — "60 FPS", "< 800ms", "< 45ms", "< 16ms", "100% Validadas", "0% (Proxy Backend)". Styling estimates as instrument readings is the strongest AI tell on the page.
2. **The Voronoi Lab, in its current form.** The visual is four dashed squares, the name means nothing to a general reader, and the description claims an algorithm the code doesn't implement. Either implement real Voronoi cells — which would make it genuinely impressive — or cut it.
3. **Half the stack matrix.** Nineteen entries with level badges is a wall of assertion. Six, with something interesting said about each, would carry more weight.
4. **"LISTO PARA DESPLIEGUE."** He's a person.
5. **The per-project "relevance to the role" boxes** — reframe as "Dónde se aplica."

---

## Make It Feel Less Like It Is Trying to Fit Geolabs

**Wording:** rename every "RELEVANCIA PARA EL ROL FULL-STACK" heading to "Dónde se aplica" and describe the class of problem rather than our job posting. Drop "PATRÓN VERIFICADO" — verified by whom, against what?

**Visual:** the entire page is a geospatial console. Let one section look like something else — a plain, well-typeset piece of writing about how he approaches a problem, with no borders, no mono labels, no telemetry. The contrast would make the console sections stronger and would prove the design range is a choice rather than a single trick.

**Project ordering:** lead with Awtu Commerce. It's paid commercial work with a payment gateway, and it currently sits behind a tab in the second half of the page while a self-initiated GIS demo occupies the first screen. The GIS work is more *impressive*; the commerce work is more *reassuring*. A portfolio that leads with the reassuring thing and follows with the impressive one reads as confident. The current order reads as targeted.

**Broader capability:** show one thing with no map in it. The Linux and PHP work exists only as code samples in a viewer. A short piece on the UMSS IT automation — what was manual, what he automated, what broke — would demonstrate range and dissolve the sense that this site was reverse-engineered from a job description.

---

## Better Interaction Ideas

Realistic, in rough effort order:

1. **Hover preview on the case-study tabs** — a small screenshot on hover. Solves the no-images problem and the which-should-I-click problem at once.
2. **Sticky section nav on the flagship** — the map section is four screens tall on mobile; a small sticky bar showing the active scope and layer would keep the user oriented.
3. **A "compare two cities" mode** — split the map or overlay two scopes' distributions on the chart. The data is already loaded; this would turn a viewer into a tool.
4. **Zoom-aware map guidance** — surface the current zoom and, when below 8, show "Acércate para ver los manzanos del Censo." Turns the current blocker into a feature that teaches the reader how the dataset works.
5. **Before/after diagram per case study** — "manual process → automated flow" as a small SVG. Would carry the operational-value story better than any paragraph.
6. **Make the block inspector a real drill-down** — clicking a block could scroll the analytics panel to that block's values, wiring the two halves of the flagship together. Right now the map and the panel are two separate things sharing a section.

---

## Final Send Recommendation

**FIX BEFORE SENDING — one focused day of work, then this is genuinely good.**

I want to be clear that the criticism above is criticism of finish, not of ability. The visual system here is better than most professional developer portfolios I review: it has a real point of view, it commits to it, the colour discipline is excellent, and the motion is restrained in a way that suggests genuine taste. The flagship map is the most technically ambitious thing I've seen in a candidate portfolio this year, and when the census blocks render it is legitimately beautiful.

But three things are broken in ways a reviewer will hit within their first two minutes — an empty first tab on the headline feature, a form that claims to send and doesn't, and an AI that answers about the wrong city. And beneath those, the accessibility layer is largely absent: a `lang` attribute that never changes, no focus indicators at all, and thirty-two tap targets below the minimum.

Fix the five blockers and the eight high-impact items and I'd change this to SHIP without reservation. The foundation genuinely does not need rebuilding — it needs finishing.
