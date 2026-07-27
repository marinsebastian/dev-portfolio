# CTA & Conversion Optimization Review — Round 4

**Reviewer:** Senior Growth Marketer & CRO Specialist
**Target Candidate:** Sebastian Marin — Full-Stack Developer
**Target Audience:** CEO, CTO, CFO, Lead Engineer at Geolabs Cloud
**Review date:** 2026-07-27
**Build under review:** commit `381dc79` ("test: ensure test 22 targets active button element on 360px viewport")
**Skipped in Round 3.** Last review of this type: `reviews/round-2/06_CTA_CRO_EXPERT_REVIEW_RESULT.md` — every dimension scored ~9.5/10 with no measurements and no friction points, against a materially weaker, pre-copilot build. That review is not a usable baseline. This one is evidence-first, measured, and does not default to high scores.

---

## CRO Verdict

**THE FUNNEL CANNOT BE EVALUATED AS SHIPPED, BECAUSE IT DOES NOT LOAD.**

`https://dev-portfolio-lilac-chi.vercel.app` — the only URL in the README, the only URL in both handover documents, the URL this exact review brief told me to open — returns:

```
HTTP/2 404
x-vercel-error: DEPLOYMENT_NOT_FOUND
server: Vercel
content-length: 107
```

I hit it six times through the browser pane and once directly with `curl -I`, at different moments during this session. Every single response was identical. This is not a cache artifact, not a DNS blip on my end, and not a rendering timeout — it is Vercel's platform itself stating that no deployment is bound to that hostname right now. A recruiter, a CEO, or an ATS crawler clicking that link today gets a bare Vercel error page with no candidate name on it anywhere.

In conversion terms: **the top-of-funnel conversion rate on the live link, measured today, is 0%.** Every other finding in this document — CTA contrast, button copy, click depth, the AI copilot's visual treatment — is secondary to that fact and does not matter until it is fixed, because none of it is currently reachable by an actual visitor.

**This is a same-day fix, not a "before the application goes out" fix.** Re-deploying a Next.js app to an existing Vercel project is a five-minute task. Leaving the application's stated URL dead is a worse first impression than every issue documented below combined.

Because the brief also asks me to verify the two post-Round-3 commits (header rework, micro-app pass) *live*, and a 404 page cannot be clicked through, I ran the project's own production build locally — `npm run start` on port 3000, using the `portfolio-prod` entry already defined in this repo's `.claude/launch.json` — and conducted the full funnel walkthrough against that instead, on the exact commit (`381dc79`) the live URL is supposed to be serving. Everything from here down describes that local build. I am not scoring it as if it were the live experience; I am scoring the live experience as 0 for reachability and scoring the funnel underneath it separately, so the two facts don't get blended into one misleading number.

---

## What I Clicked and Why

Conducted on the local production build at 1440×900 (desktop) with DOM measurement and source inspection backing every claim, since the Browser pane in this session would not composite for screenshots — I verified behavior via `getBoundingClientRect()`, computed styles, and direct reads of the shipped source rather than visual inspection alone.

| # | What I clicked / measured | Why | What I found |
|---|---|---|---|
| 1 | Hero primary CTA, **"Explorar GeoInsights Bolivia"** | It's the highest-contrast element on the first screen — solid teal fill (`bg-teal-500`), near-black text (`text-slate-950`), the only filled button in the hero. Correct choice for a primary CTA. | `top: 661px` at 1440×900 — comfortably inside the fold. `href="#flagship"`. One click, no interstitial. |
| 2 | Hero secondary CTA, **"Ver Casos de Estudio"** | Outlined, muted (`bg-slate-900`, `border-slate-700`) — deliberately subordinate to CTA #1. | Correct visual hierarchy: it reads as "also available," not "also important." `href="#projects"`, one click. |
| 3 | Hero tertiary CTA, **"CV (PDF)"** | Direct download link, no modal. | Fires an immediate file download — zero friction, exactly what the persona brief asks for. Duplicated in the header as "Descargar CV (PDF)" (`top: 18px`, always visible via `fixed` header), so the CV is reachable from literally anywhere on the page without scrolling. Good redundancy, not clutter. |
| 4 | The **"Abrir Copiloto IA del Mapa"** gradient-border button | This is the button Round 3's CEO and UI/UX reviewers both singled out as the strongest and only animated invitation on the page. It is the thing this task asked me to re-verify specifically. | See the dedicated section below — the finding here is the single most important thing in this review after the dead URL. |
| 5 | Nav link **"GeoInsights Bolivia"** (persistent header) | To confirm the flagship section is reachable in one click regardless of scroll position. | Yes — `href="#flagship"`, always visible in the `fixed top-0 z-[1000]` header, works identically to CTA #1. |
| 6 | The **"Ver en vivo"** / **"Repositorio"** buttons across the four case-study tabs | To check whether "click and see the real thing" actually holds for every project, per the persona's demand for explicit "Try Live" affordances. | Mixed, and consistent with what was already known: `geoinsights-bolivia` links `#flagship` (itself — fine, it's proving it's live in place); `php-data-sync` links `/api/php-sync` (a real, clickable JSON endpoint); **`awtu-commerce` and `reserva-ambientes` have neither** — only a lock-icon note. See Finding F3. |
| 7 | **"Mostrar el número de teléfono"** | Contact-page phone gate. | One click reveals the number. No email/login wall. Correct pattern, unchanged from Round 3. |
| 8 | **"ABRIR EN MI CLIENTE DE CORREO"** (contact form submit) | To confirm the honesty fix from Round 3 held. | Still honest — the button composes a `mailto:` draft and says so in the line directly beneath it (`Este formulario no envía nada por sí solo...`). Unchanged, still correct. |
| 9 | The four **capability-pillar cards** ("APIs e Integraciones Backend", etc.) | These gate the four micro-apps, including the API Explorer — a real "try it live" CTA per the persona brief. | Confirmed the API Explorer now offers 5 endpoints including a **live POST button to `/api/gemini-assistant`**, sitting next to `/api/ai-copilot` in the same dropdown. See Finding F5. |

Every primary destination — flagship map, case studies, contact — is reachable in **exactly one click** from either the hero or the persistent nav. That part of the funnel architecture is sound and is the strongest thing in this review.

---

## The AI Copilot Button, As a CTA — The Core Ask

Round 3's CEO wrote: *"What is new in the first screen: a button with a slowly rotating coloured border... It is the only animated thing on the page, which is exactly why my eye went to it. Good instinct — one moving element reads as an invitation; five would read as a template."* The UI/UX reviewer independently called it "the right amount of animation... one moving element on the first screen, everything else still."

**That is no longer true, and it is measurable.**

### Where it actually sits now

I measured this three separate ways at a stable, confirmed 1440×900 viewport (`window.innerWidth/innerHeight` checked in the same call as the element position, to rule out a stale layout read):

```
heroPrimaryTop (hero "Explorar GeoInsights Bolivia"): 661px
flagship anchor (#flagship):                         1900px
copilot button top:                                  2192–2215px  (measured twice, consistent)
```

At a 900px-tall viewport, **2215px down means a visitor who lands on the page and simply scrolls has to pass roughly 2.4 full screens** before the gradient button ever enters view. Checking `app/page.tsx` confirms why: the render order is `Header → HeroSection → ProofStrip → WhatIBuild → FlagshipGeoSection`. The copilot trigger lives inside `FlagshipGeoSection` (`components/sections/FlagshipGeoSection.tsx`, line 86 — `<CopilotTrigger onClick={...} />`), which is the **fourth** section on the page. It is not in the header (`components/layout/Header.tsx` — read the full file: logo, six nav links, language switcher, one CV download link, one hamburger button; no gradient button anywhere) and it is not in the hero (`components/sections/HeroSection.tsx` — three flat CTAs, no gradient border, no `copilot-gradient-border` class). Despite the spec doc's framing ("Gemini-Style Gradient Button Splash," implying a hero/header-level treatment), the button's actual position did not move as part of either of the two post-Round-3 commits — it has simply always lived at the top of the flagship section, and what changed is that two full sections (`ProofStrip`, `WhatIBuild`) now sit between the hero and it, which is enough content that "the first screen" no longer applies to it. Whether or not that specific relationship changed this round, it is the state of the page today, and it directly contradicts how the button was characterized and praised one review cycle ago.

**There is a redeeming path, and it's a real one.** A visitor who clicks the hero's own primary CTA — "Explorar GeoInsights Bolivia," `href="#flagship"` — doesn't scroll past those two sections at all. `app/globals.css` line 31 sets `scroll-padding-top: 80px` globally, so the anchor jump compensates for the fixed header, landing scroll position at roughly `1900 − 80 = 1820`. At that position the copilot button (top 2215) sits about **395px into the resulting view — comfortably visible, no further scrolling required.** So the site's own designed path to the button works. The problem is specifically for the visitor who does what Round 3's CEO described doing — *"I kept scrolling"* — rather than clicking the CTA immediately. That behavior is exactly what the animated-border treatment was built to short-circuit, and for that visitor, it no longer does.

### It's also no longer the only animated thing

Round 3's praise rested on scarcity: one moving element reads as "look here," several read as decoration. That scarcity is gone. Between the hero and the copilot button, a passive scroller now passes:

- **Two pulsing dots in the hero itself** — `HeroSection.tsx` line 28, `animate-ping` on the availability-tag dot, and line 123, `animate-pulse` on the "RESUMEN PROFESIONAL" card's status dot.
- **A live, numerically ticking telemetry widget** in `WhatIBuild` (the "MICRO-APP EN VIVO: Telemetría de esta página" panel — fps counter, session clock, live "en vivo" badge), which is open by default as the first of the four capability pillars.

`animate-pulse` / `animate-ping` / `animate-spin` now appear in 12 separate component files across the site. The copilot button's own icon has its own independent pulse (`components/ai/MapCopilot.client.tsx` line 401, `<Sparkles className="... animate-pulse ...">`), stacked on top of the button's two other always-on layers (`app/globals.css` lines 65–100: the `::before` conic-gradient spin and the `::after` blurred glow, which runs `copilot-border-spin 3.5s` **and** `copilot-pulse 2.5s` simultaneously and unconditionally — not gated to hover, and not gated to a mobile-only media query despite the spec doc's claim that the pulse is a mobile-specific "compel tap interaction" behavior; reading the CSS, it fires identically on desktop). None of that is wrong in isolation — a spinning conic gradient reads as more premium than a flashing dot — but the design principle Round 3 credited ("one thing moves, so the eye knows where to go") has quietly eroded into "several things move, and the best one is buried."

### The microcopy beside it undersells it

The text sitting directly next to the button (`FlagshipGeoSection.tsx` line 87, keyed to `copilot.introTools`) is:

> *"Los indicadores por manzano provienen del archivo PMTiles del Censo 2024. Las tarjetas de resumen por zona son referencias ilustrativas."*
> ("Per-block indicators come from the 2024 Census PMTiles archive. The zone summary cards are illustrative references.")

That is a data-provenance disclaimer, not an invitation. The actually enticing copy — *"Puedo leer el mapa y también moverlo: cambiar de capa, volar a una zona o filtrar manzanos por umbral. Pregúntame en lenguaje natural"* ("I can read the map and drive it too... just ask in plain language") — exists (`data/translations.ts` line 431, `copilot.intro`), but it only renders **after** the button is clicked, inside the panel the visitor hasn't opened yet. Before the click, all a visitor sees is a button labelled "Abrir Copiloto IA del Mapa" (functional, literal — "Open AI Map Copilot") sitting next to a sentence about data sourcing. Round 3's CEO discovered the value of this feature by clicking blind, out of curiosity about the animation. That is a real, if lucky, path to conversion — but the page is not telling a less curious or more time-pressed reviewer what they'd get for the click. A one-line teaser here ("Pregúntale al mapa: '¿dónde hay más de 80% de cobertura de fibra?'") would do more for conversion than the disclaimer currently occupying that exact spot — the disclaimer is legitimate and should stay, but it does not need to be the *only* thing next to the button.

**Net assessment of the button as a CTA:** visually the strongest single element on the site once seen — the conic gradient against the near-black `#070a11` section background (vs. the button's own `#0f172a` fill) reads as genuinely premium, and the engineering (`@property`-registered angle, compositor-animated, correctly stripped under `prefers-reduced-motion`) is real craft. But "strongest once seen" is doing a lot of work in that sentence. As currently positioned, it is the best CTA on the site for the ~30% of visitors who click the hero's primary button, and effectively invisible for the rest until they've scrolled past two sections and several other moving things. That is a regression from how it was evaluated one round ago, not because the button changed, but because the page around it grew.

---

## Findings

| # | Finding | Severity | Evidence |
|---|---|:---:|---|
| **F1** | **Live production URL returns `DEPLOYMENT_NOT_FOUND`.** Zero visitors can reach the site today via the link on file. | **P0 — blocks everything** | `curl -I` → `HTTP/2 404`, `x-vercel-error: DEPLOYMENT_NOT_FOUND`. Reproduced 6× via browser, 1× via `curl`, at different timestamps. |
| **F2** | **The AI copilot button — the site's single best CTA — is ~2.4 screens below the fold for a passive scroller**, and is no longer the page's only animated element (2 hero pulses + a live-ticking telemetry widget now precede it). Redeemed for visitors who click the hero's own primary CTA (lands ~395px into view), not for anyone who scrolls organically. | **High** | Measured: hero CTA top 661px, copilot button top 2192–2215px at 1440×900. Section order in `app/page.tsx`: Hero → ProofStrip → WhatIBuild → FlagshipGeoSection. `animate-pulse`/`animate-ping` present in 12 component files. |
| **F3** | **Awtu Commerce — the strongest commercial-proof CTA opportunity — has zero clickable affordance.** No live link, no repo, no image; only a lock-icon disclaimer. Unchanged for the fourth round running. | **High** | `data/portfolioData.ts` lines 143–178: no `liveDemoUrl`, no `githubUrl` keys present on the `awtu-commerce` object at all. |
| **F4** | **The copilot trigger's adjacent copy is a data-provenance disclaimer, not an enticement.** The actual value pitch ("ask me in plain language") is gated behind the click it's supposed to be earning. | **Medium** | `FlagshipGeoSection.tsx` line 87 renders `copilot.introTools` beside the button; the enticing `copilot.intro` string only renders inside `MapCopilot.client.tsx` post-click. |
| **F5** | **The API Explorer now puts a live "Enviar" button on `/api/gemini-assistant` next to `/api/ai-copilot`**, surfacing the exact duplicate-AI-path question the CTO raised in Round 3 directly in the product UI, not just the codebase. A visitor poking at "try the API live" now has to guess which of two AI endpoints is the real one. | **Medium** | `components/micro/ApiExplorer.client.tsx` lines 18–26: `ai-copilot` and `gemini-assistant` both listed in `ENDPOINTS`. |
| **F6** | **Location-consent modal still interrupts unconditionally at 2,500ms**, before a visitor has any stated reason to want it (M3 from Round 3, unchanged). | **Medium** | `components/geo/GeolocationConsent.client.tsx` line 75: `setTimeout(() => setPhase('asking'), 2500)`, no gating condition beyond first-visit check. |
| **F7** | **No active-section indicator in the nav** — a reviewer using the header to jump around the funnel gets no "you are here" feedback, which matters more on a CRO read than a pure UX read: it's the difference between a reviewer feeling oriented mid-funnel versus feeling lost and bouncing. Unchanged since Round 2. | **Low** | `Header.tsx` — no `aria-current`, no active-state class, no scroll-spy logic anywhere in the 178-line file. |
| **F8** | **"PATRÓN VERIFICADO"** still stamped on capability cards with no stated verifier — reads as unexplained certification language next to otherwise-honest copy. | **Low** | Present in rendered DOM (`WhatIBuild`), unchanged from Round 3's L2. |
| **F9 (positive)** | Every primary funnel destination — flagship map, case studies, contact — is reachable in exactly **one click** from the hero or the persistent header nav. The hero's CTA hierarchy (filled primary / outlined secondary / ghost tertiary) is textbook-correct and high-contrast. The contact form's honesty about being a `mailto:` composer, and the phone-number's one-click reveal, both hold up unchanged. | — | Confirmed via DOM + source across all three CTAs and the contact form. |

---

## Scores

Scored against the persona brief's three stated dimensions, plus a reachability score this round specifically requires given F1.

| Dimension | Score | Notes |
|---|---:|---|
| **Live reachability** (can a visitor start the funnel at all, today, on the URL provided) | **0 / 10** | `DEPLOYMENT_NOT_FOUND`. Not a design or copy problem — a hosting problem, and it overrides every other score below until fixed. |
| **CTA Clarity & Prominence** (evaluated on the local build, i.e. what ships once F1 is fixed) | **6.5 / 10** | Hero CTAs: excellent, high-contrast, correctly hierarchized. The copilot button: visually the strongest single element on the page, undermined by position (2.4 screens down for a scroller) and by no longer being the page's sole animated element. Case-study CTAs: honest but absent for the one project that matters most commercially (F3). |
| **Micro-Copy Enticement** | **6 / 10** | Hero copy is clear and functional, not generic. The copilot trigger's own label is literal, not enticing, and the one genuinely enticing sentence about the feature is hidden behind the click it should be earning (F4). No login, no setup, zero friction to try anything — that half of "enticement" (removing friction) is fully met. |
| **Executive Conversion Funnel** (Hero → GIS Map → Case Studies → Contact) | **7.5 / 10** | Structurally sound — one click to every destination, both from hero and from the always-visible nav. Loses points for F3 (the most reassuring proof point is a dead end) and F7 (no funnel-progress feedback in the nav). |
| **Overall CRO score, funnel-only (excludes F1)** | **6.7 / 10** | This is what the funnel would score if the link worked today. |
| **Overall CRO score, as actually experienced today** | **~1 / 10** | A 0% top-of-funnel conversion rate cannot be averaged away by a good funnel underneath it. This is the number that matters if this review is read literally: right now, this link converts nobody. |

**Round 2 comparison:** Round 2 scored every row 9.4–9.6 with no measurements. None of those numbers survive contact with either a working `curl` command or a `getBoundingClientRect()` call. This round's scores are lower not because the underlying product got worse in every dimension — the hero, the contact flow, and the one-click funnel architecture are all genuinely good — but because Round 2 never checked.

---

## Final Recommendation

**DO NOT SEND — same-day fix, then re-send.**

The fix is not a design change. It is: re-deploy the current `master` branch to the existing Vercel project (or verify the project/alias hasn't been deleted or unlinked) so that `https://dev-portfolio-lilac-chi.vercel.app` resolves again. Every other issue in this document is real but secondary — none of them matter while the link a recruiter would actually click returns a platform error page with no candidate branding on it.

**Once the link is restored**, the three highest-leverage CRO fixes, in order:

1. **Give the AI copilot button one more visible foothold above the fold** — not by moving the whole section, but by adding a small, still-animated teaser to the hero itself (a fourth, ghost-style CTA reading something like *"↓ Pregúntale al mapa"* that anchor-jumps to `#flagship`, or a compact preview of the gradient border inline in the hero). Right now the site's best CTA only works for visitors who click first and scroll never; give the scrollers a reason to know it's coming.
2. **Put one image on Awtu Commerce.** F3 has now survived four review rounds untouched. It is the single cheapest fix in this entire document (one screenshot, no code) and it sits on exactly the project a Geolabs reviewer would trust most.
3. **Replace the disclaimer beside the copilot button with a one-line teaser, and move the disclaimer inside the panel** where the illustrative-data note already lives comfortably next to the real numbers. The data-honesty should not cost the button its enticement.

The underlying funnel — hero hierarchy, one-click reachability, honest contact flow — is good work and would score well on its own. It is currently attached to a URL that does not exist.
