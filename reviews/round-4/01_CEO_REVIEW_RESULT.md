# CEO Portfolio Review

**Round:** 4 (Header/Nav rework + Micro-apps/API-explorer rework)
**Reviewer persona:** CEO, Geolabs Cloud
**Review date:** 2026-07-27
**Time budget simulated:** 5 minutes browsing, then roughly 40 minutes of follow-up once the live link failed and a local fallback was required

**Methodology note, stated up front because it changes what the rest of this document means:** the live URL given for this review, `https://dev-portfolio-lilac-chi.vercel.app`, returned an HTTP 404 for the entire duration of this review (`x-vercel-error: DEPLOYMENT_NOT_FOUND`, confirmed with five separate requests over several minutes, from two independent network paths). Everything below the "First 10 Seconds" section describes a **local production-equivalent build** running on the same machine, used only because the actual deliverable was unreachable. I have labelled every finding as either **[LIVE]** (observed against the public URL) or **[LOCAL]** (observed against the local build, standing in for what the public URL would show if it worked). A real CEO does not have a local build to fall back to — they have the link in the application. That distinction is the headline of this round.

---

## Executive Verdict

**WEAK CANDIDATE — portfolio damages the application.**

Not because the work got worse. Because the thing I was actually sent — a URL — does not load. I typed it in, twice, on two different days' worth of attempts inside this session, and got Vercel's own error page both times. Everything I found once I worked around that is closer to Round 3's picture than not: the copilot still drives the map with real tool calls, the telemetry still measures the real page, the census data is still real. But I was not sent a build folder. I was sent a link, and the link is dead. A CEO with three minutes does not go looking for a local fallback. He closes the tab and moves to the next résumé in the pile.

---

## First 10 Seconds

**[LIVE]** I opened `https://dev-portfolio-lilac-chi.vercel.app`. The page that loaded:

> **404: NOT_FOUND**
> Code: `DEPLOYMENT_NOT_FOUND`
> This deployment cannot be found.

That is the entire first impression this round produced on the actual asset I was given. I re-requested it directly (`curl -D -`) to rule out a client-side fluke — same result, same Vercel error header, twice more a minute apart. This is not a slow cold start or a flaky CDN edge; `DEPLOYMENT_NOT_FOUND` is Vercel's own routing layer telling me no deployment is currently aliased to this domain. Whatever shipped in the two commits since Round 3 — the header rework, the micro-app rework — is sitting in a git history that the public internet cannot currently reach.

I want to be precise about what this means and doesn't mean. It does not mean the work is bad. It means that on the day this is supposed to matter most — the day someone actually clicks the link in the application — there was nothing to see. I have reviewed three prior rounds of this portfolio and the flagship map once rendered nothing while three layers of self-report said it worked (Round 2). This is a different failure mode, and arguably a worse one for a hiring decision: last time the product had a bug. This time there is no product to have a bug in.

**[LOCAL]** Because the review protocol asks me to actually evaluate the work, not just the outage, I located a locally running instance of the same codebase on this machine and browsed that instead, so I could tell you whether the underlying build justifies a second look once the deployment is fixed. That version anchors cleanly at the top with no forced scroll, opens on the same hero I've now seen three times ("Desarrollador Full-Stack enfocado en Interfaces, APIs, Datos Espaciales y Automatización," four tech chips, two CTAs), and the one moving element is still the copilot button with its rotating gradient border. Everything from here down is what I found there.

---

## What I Clicked and Why

| # | What I clicked | Why | What happened |
|---|---|---|---|
| — | **The live URL itself, twice** | It's the actual deliverable. | 404, `DEPLOYMENT_NOT_FOUND`, both times. **[LIVE]** |
| 1 | **"Abrir Copiloto IA del Mapa"** | Same reason as every round — it's the one thing that moves. | Split console opened: map left, chat right, provider dropdown (NVIDIA NIM / Google Gemini / OpenAI). **[LOCAL]** |
| 2 | **"Ver áreas con fibra > 80%"** chip | Fastest way to check the AI is real, not scripted. | The map's legend switched live from `hab/ha` to `%`; the transcript showed three real tool calls (`set_metric_threshold`, `get_map_state`, `set_map_layer`) against NVIDIA's `z-ai/glm-5.2`. It took close to eighteen seconds from click to "Listo. Apliqué 3 acciones sobre el mapa" — the console sat on "Consultando…" long enough that I checked twice whether it had stalled. **[LOCAL]** |
| 3 | **The "APIs e Integraciones Backend" pillar → REST API tester** | To see if the "5 endpoints" claim in the commit notes was real. | It is — five real dropdown entries, and pressing send against `/api/php-sync` returns the same honest object it always has: `"kind":"api-contract-example"`, `"this Next.js route documents the contract; it does not proxy or monitor a running PHP service."` **[LOCAL]** |
| 4 | **The same tester against `/api/gemini-assistant`** | It's now one of the five headline endpoints, so I tested it the way a technical reviewer would. | It replied with `[Resumen local — sin llamada a Gemini]` — a canned, templated summary, not a live model call — even though the site's own Gemini key is demonstrably working elsewhere (the copilot lists Gemini as configured and available). **[LOCAL]** — see "What Made Me Doubt Him" for why. |
| 5 | **"Sistemas Espaciales y Mapas" pillar → locator micro-app** | To check the GPS-button claim. | A real mini-map centred on Cochabamba, sourced by IP (`-17.382, -66.152`, "nivel ciudad"), with a `GPS` button to upgrade to browser geolocation. **[LOCAL]** |
| 6 | **"Ejecutar pruebas" in the QA section** | Same curiosity as last round. | On a clean run it reached 10/10 in about five seconds. (On an earlier, messier run in the same session it stalled at 6/10 — I could not reproduce that on retry, and I'm treating it as an artifact of my own multi-tab test setup rather than a claim against the product.) **[LOCAL]** |
| 7 | **The telemetry counter, before and after switching pillars** | To check the "persists across tab switches" claim from the commit notes. | Session clock went from 00:58 to 01:06 across two pillar switches without resetting; the click counter kept counting. This one holds up. **[LOCAL]** |
| 8 | **The CV PDF and phone reveal** | Habit. | Both worked as before; the phone number stays masked until clicked. **[LOCAL]** |

---

## What Made Me Trust Him

1. **The CV and the site still agree with each other, in detail.** Awtu Commerce dates (Feb–Apr 2026), the BCP QR polling/webhook description, the Gemini-assisted support widget behind an internal proxy, the Playwright testing habit, the in-progress Diplomado en Ciencia de Datos — every one of these appears in near-identical language on both documents. That consistency is still a real signal after four rounds.

2. **The AI copilot is still not theatre.** I asked it, through a genuine UI interaction, to find high-fibre areas. It ran three tool calls against a live NVIDIA endpoint and the map's legend changed in front of me. That is still the single most differentiating thing in this file, when it can be reached.

3. **The honest disclaimers survived this round intact.** `/api/php-sync` still calls itself a contract example instead of an operational service. The zone summary cards still say "referencias ilustrativas." Nobody quietly upgraded a caveat into a claim to make the demo read better. That restraint is worth something.

4. **No console errors, clean network trace.** Whatever else is true, the local build itself is not throwing errors at me. The code quality bar from Round 3 has not slipped.

---

## What Made Me Doubt Him

1. **The link does not work. This is the finding.** I am not going to bury it in a list. Everything else in this section is secondary to the fact that the artifact I was handed 404s.

2. **A ranked fix from last round was not just skipped — it was made more visible.** Round 3's finding M5 said `/api/gemini-assistant` was superseded by the new copilot and both still existed, and recommended retiring the old one before the two drifted apart. Instead, this round's own commit added it as one of five headline entries in the new "5 ENDPOINTS OPERATIVOS" API tester — promoted, not retired. And it has already drifted: calling it returns a canned local paragraph, `[Resumen local — sin llamada a Gemini]`, instead of a live model response, even with a working Gemini key sitting one API route away. I read the code — `app/api/gemini-assistant/route.ts` calls a hardcoded `gemini-2.5-flash` model, swallows any failure into a `console.error`, and silently falls back to a templated reply. A reviewer who tests exactly the feature the site is now proudest of showing off ("5 live endpoints — pulsa Enviar, la petición sale de tu navegador hacia las rutas reales") has a one-in-five chance of being shown something that isn't actually live. That is a worse trust problem than the one it replaced.

3. **The geolocation interruption was flagged last round and is, if anything, more aggressive now.** Round 3 timed it at roughly two and a half seconds into a first visit. On a clean load in this build — localStorage cleared, fresh navigation — the dialog appeared at **878 milliseconds**. Under a second. Nobody has met the map yet. This was ranked fix #6 in Round 3's list and nothing in either of the two subsequent commits touched it.

4. **PHP still doesn't run. Fourth round running.** This was Round 3's #1 ranked fix, ahead of everything else. Two commits landed since then — a header rework and a micro-apps rework — and neither one was the PHP artifact. I'm not asking for it again; I'm noting that when a list is ranked and the top item is skipped twice in a row in favour of visual polish, that's a prioritization pattern, not a coincidence.

5. **Screenshots: still zero.** I queried the rendered DOM directly — `document.querySelectorAll('img').length` returns **0** across the entire page. Not "few," not "small." None. Awtu Commerce, the one commercial, revenue-generating project, is still a paragraph and a disclaimer ("Código privado del cliente — puedo mostrar la implementación en una llamada"). Round 3's #2 ranked fix, also skipped.

6. **The internal build documentation oversells two of its own fixes.** `07_HEADER_AND_AI_BUTTON_SPEC.md` states the candidate name was "Completely removed... from Hero text. Name lives exclusively in the Header." It doesn't — a 12px teal kicker reading "SEBASTIAN MARIN | INGENIERO DE SISTEMAS" still sits directly above the headline. It's small and it's not the old duplicate-headline problem, but the claim as written is false. Same document says the auto-scroll-on-mount bug is "100% Fixed... Removed `autoFocus`... mount-time focus triggers." It isn't fully fixed: `InteractiveCVSection.tsx` (the very file that was edited for this fix) still runs `previewButtonRef.current?.focus()` in a `useEffect` on every mount, unconditionally moving keyboard focus to a button roughly 7,150 pixels down the page before a user has touched anything. I verified this with `document.activeElement` immediately after a fresh load — it lands on "Previsualizar Documento PDF," not on the page's natural entry point. It happened not to force a visible scroll jump in my test, but a keyboard user's very first Tab press now goes somewhere other than the top of the page, silently. This is the same category of bug the commit claims to have eliminated, in the same file, missed by the same fix.

7. **Density is still unaddressed and has grown, not shrunk.** Round 3 asked for one micro-app to be cut, the stack matrix halved, and the illustrative zone cards removed. None of that happened. What did happen: the API tester grew from 3 endpoints to 5, and the mini-map gained a GPS button and a zoom control. The page is measurably longer than before (roughly 8,900px of scroll at desktop width before a single accordion pillar is opened), not shorter.

---

## Strategic Fit for Geolabs

**Can he convert data and processes into usable tools?** The evidence for this hasn't changed — the census copilot is still real, still impressive, still the right instinct for what Geolabs does. That part of the case remains made.

**Can he learn fast?** Yes, on the evidence of the feature work itself. The icon-collapsing nav is genuinely built, not just styled to look that way — I checked the computed CSS (`width: 0px`, `opacity: 0`) rather than trusting the changelog.

**Does he show autonomy?** Less convincingly than Round 3. Autonomy that spends two full commit cycles on cosmetic and structural polish (nav icons, badge sizing, a fifth API dropdown entry) while the reviewers' three highest-ranked, most-repeated asks (PHP, screenshots, geolocation timing) go untouched — and while a live deployment silently goes dark — reads less like initiative and more like avoidance of the harder, less flashy work.

**Can he document and explain?** This is where I'm most concerned, because it's new. Two internal spec documents this round each contain a claim that doesn't survive a five-minute code check (the Hero name "completely removed," the auto-scroll bug "100% Fixed"). Round 3 specifically praised this candidate for documentation that "describes the architecture accurately" after Round 2 punished exactly this kind of self-graded overstatement. Seeing it recur, even in small form, is the one finding this round that actively reverses a trend rather than just failing to advance one.

**Would he collaborate well in a small team?** A dead production URL the team relies on for demos, interviews, and — per this very review protocol — repeated evaluation, is an operational reliability question, not a taste question. Geolabs is a cloud company. "The deployment fell over and nobody caught it" is close to the most on-the-nose failure this specific portfolio could have, for this specific employer.

---

## Scores

| Area | Score | Notes | Δ vs R3 |
|---|---:|---|:---:|
| First impression | 1 | A 404 page with `DEPLOYMENT_NOT_FOUND`. There is no first impression to score above this. | ▼ -8 |
| Professional credibility | 5 | The local build is still mostly credible on its own merits, but a dead production link from a candidate targeting a cloud infrastructure company is a direct hit to the thing "credibility" is supposed to measure, and it stacks on top of the gemini-assistant endpoint quietly faking a live response inside the site's own new "operational" API tester. | ▼ -4 |
| Clarity of positioning | 8 | Unchanged copy, still clear once you can actually read it — but you increasingly have to work to get there. | ▼ -1 |
| Business relevance | 8 | The copilot and the API tooling are still directly on-message for Geolabs. | — |
| Authenticity | 6 | The disclaimers that earned trust in Round 3 are all still there. Set against that: two overstated claims in this round's own build docs, and a "5 live endpoints" feature that includes one endpoint proven to fake liveness under test. | ▼ -2 |
| Evidence of initiative | 7 | Real engineering happened (persistent telemetry, a genuinely CSS-collapsed nav, a working GPS locator) — but it was spent on polish while the three specifically-requested fixes from last round went untouched, and a live deployment broke on his watch. | ▼ -3 |
| Fit for a growing technical team | 6 | Ranked feedback going unaddressed for a second consecutive round, and one item (M5) actively reversed, is the kind of pattern a manager needs to have a direct conversation about before extending trust with production access. | ▼ -2 |
| Likelihood I would keep reading | 2 | You cannot keep reading a page that returns 404. Even crediting the local fallback, density (still unresolved) would cost attention by the midpoint. | ▼ -7 |
| Likelihood I would forward to CTO | 3 | Not today. I would forward "please confirm the deployment is live, then resend" — which is not the same as forwarding the candidate. | ▼ -6 |

**Average: 5.1 / 10** (Round 3: 8.8)

---

## Top Fixes Before Sending

### The top 3 changes that would increase executive trust

1. **Get the production URL serving the current commit again, today, and add a trivial post-deploy smoke check (even a five-line GitHub Action that curls the homepage and fails loudly on non-200) so this specific failure mode cannot happen silently a second time.** Everything else in this review is secondary until this is true.
2. **Ship one PHP artifact that runs.** Fourth round asking. It is Geolabs' first stated requirement and the only one still resting entirely on assertion.
3. **Add one screenshot for Awtu Commerce.** Fourth round asking. The revenue-generating project remains the only thing on the page you cannot see.

### The top 3 things to remove or simplify

1. **Actually retire `/api/gemini-assistant` this time**, rather than promoting it into the new API tester. It's now demonstrably the one "operational" endpoint that isn't, and it sits next to four that are.
2. **Cut density instead of adding to it.** The API tester grew by two entries and the mini-map grew a GPS button this round; nothing shrank. Pick one micro-app to remove, as Round 3 asked.
3. **Drop the illustrative zone summary cards.** The real block-level data already answers the question the invented aggregate numbers keep raising.

### The top 3 ways to make it feel less like it was made only for Geolabs

1. **Move the location prompt behind a click on the map.** Asked twice now; it fires faster than before, not slower.
2. **Stop letting the build documentation get ahead of the code.** Two claims in this round's own spec files ("completely removed," "100% Fixed") don't hold up under a direct check. A Geolabs engineer who reads the repo notices that gap, and it reads worse than the underlying bug would have on its own.
3. **Prove the deployment pipeline is boring and reliable**, the same way the census map's data provenance is boring and reliable. Right now the most "made for a demo, not for production" thing about this portfolio is that production doesn't currently exist.

### The one project or section that should be featured most prominently

**Still the AI Map Copilot** — when I could reach it, it remained the standout, genuinely differentiating asset in this entire application. But right now it's gated behind a dead link and an eighteen-second wait for a response, and neither of those is a small thing to fix before the feature can do the job it's capable of doing.

### The one sentence that should appear near the top of the site

> "Construyo sistemas que no solo se ven bien en la demo — siguen funcionando cuando alguien más los mira."

("I build systems that don't just look good in the demo — they keep working when someone else is watching.") It's earned by this exact round: the work that was demonstrated to reviewers worked; the work nobody was watching quietly went down.

---

## Final Recommendation

**HOLD. Do not forward until the live URL is confirmed reachable — then re-verify before sending.**

My note to the CTO: *"Don't open the link yet — it's 404ing as of this morning, confirmed independently, not a fluke on my end. I pulled up a local copy of the same code to see if the underlying work still justifies a look: it mostly does. The copilot still runs real tool calls against a live NVIDIA endpoint, the telemetry is still real, the census data is still real. But two things got worse instead of better since last round: the old Gemini endpoint we asked him to retire got promoted into a new 'live API' showcase instead, and it turns out to silently fake its response under test. And the location prompt, which we already flagged as too aggressive at 2.5 seconds, now fires in under one second. PHP still doesn't run and there's still not one screenshot of the paid work, both fourth round running. Get confirmation the site is actually live, then look again — the ceiling here is still real, but so is the pattern of shipping polish over the things we specifically asked for."*

Round 3 ended on the strongest note in this file's history: "someone who audits their own work harder after criticism than before it is someone to hire early." This round is the first data point against that read. The specific, ranked, written feedback from last time was available to whoever built this round's two commits, and the top three items on it were not touched — one of them was actively reversed — while a production outage went undetected through two ship cycles. That is not disqualifying on its own. Paired with the outage itself, it's enough to hold the send.
