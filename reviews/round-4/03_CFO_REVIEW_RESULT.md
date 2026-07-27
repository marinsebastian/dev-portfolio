# CFO Portfolio Review

**Round:** 4
**Reviewer persona:** CFO, Geolabs Cloud
**Review date:** 2026-07-27
**Question I am answering:** is spending interview hours — and eventually salary — on this candidate a sensible use of company money?

---

## Business Verdict

**MAYBE — and the reason has nothing to do with the code.**

I opened `https://dev-portfolio-lilac-chi.vercel.app` as instructed. It returned:

```
HTTP/2 404
x-vercel-error: DEPLOYMENT_NOT_FOUND
server: Vercel
```

I checked this three independent ways — the browser pane, a raw `curl -D -`, and a second fetch tool — at three different timestamps during this review. All three agree: this is not a cache artifact or a transient blip, it is Vercel reporting that no deployment exists at this URL right now. **The link I was given to evaluate does not resolve to a website.**

I want to be precise about what this means before I go further, because it changes the shape of this whole review. A CFO does not get a second click. If this URL is the one on the CV, in the email signature, in the application itself, then the first and only thing a recruiting coordinator or a hiring manager sees is a Vercel error page with someone else's project name nowhere on it. That is not a UX flaw or a rough edge — it is the portfolio failing at the one job a portfolio has: being reachable.

Because my brief also asks me to verify the two post-Round-3 commits *live*, and because a dead URL cannot be evaluated for anything, I ran the project's own production build locally (`npm run start`, per this repo's own `.claude/launch.json`) and reviewed that instead, so the rest of this report has real evidence behind it rather than guesses. Everything below the fold describes what I found there. **None of it excuses the fact that the actual live link, as given, is down.** I am scoring this round with that fact carried at full weight, and I am recommending it get fixed today, not "before the application goes out" — this one is a same-day fix.

---

## First Impression

Once I substituted the local production build, the ten-second read was the same clean positioning I credited in Round 3: Systems Engineer, Cochabamba, interfaces / APIs / spatial data / automation. The header now carries "Sebastian Marin — Ingeniero de Sistemas | Full-Stack" prominently and permanently, which is a real improvement — it used to compete with the hero for the same real estate.

One inconsistency worth flagging precisely because the fix-list says otherwise: the new header/AI-button spec (`07_HEADER_AND_AI_BUTTON_SPEC.md`) claims the candidate name was "**Completely removed** from Hero text. Name lives **exclusively** in the Header." It has not been. `data/translations.ts` line 254 still sets `hero.tag: "SEBASTIAN MARIN | INGENIERO DE SISTEMAS"`, rendered as the eyebrow tag directly above the headline (`components/sections/HeroSection.tsx` line 29). The name appears in two places, not one. This is a small thing — repeating your own name twice on your own site is not a trust problem — but the internal spec overstating what shipped, on a page whose own strongest asset last round was "the docs finally match the code," is exactly the kind of small drift I'd ask about in an interview. Not a red flag on its own; a pattern to watch.

The AI copilot button now has the promised rotating gradient border and mobile pulse (`app/globals.css`, `.copilot-gradient-border` / `.copilot-pulse`) — that piece of the spec is accurate.

---

## What I Understood Without Technical Knowledge

Working from the local build, since the live one is unreachable:

1. **The multi-vendor AI adapter is unchanged and still the strongest asset on the site.** `lib/aiProviders.ts` still fronts NVIDIA, Gemini and OpenAI through one code path. This is the finding I praised most in Round 3 and it has not regressed.

2. **The page now has a live "fire a real API call" console with five buttons, one of which is the endpoint I already told them to retire.** The API Explorer (`components/micro/ApiExplorer.client.tsx`) grew from three endpoints to five, and the fifth is `POST /api/gemini-assistant` — a second, independent AI code path I flagged as duplicate maintenance surface in Round 3. It is not just "still present." It is now sitting behind a public "Enviar" button with a pre-filled JSON body, one click away for any visitor. I did not spam it — I did not need to, the code makes plain it is wired to a real fetch with no cooldown beyond the loading spinner — but the button exists, on a page with live paid keys behind it (`.env.local` on this machine has `GEMINI_API_KEY`, `NVIDIA_API_KEY`, `OPENAI_API_KEY` all set). A repeat-click loop or a five-line script hits a real, metered Gemini endpoint every time, with nothing server-side to stop it.

3. **Awtu Commerce — the one project with real revenue — still has no image.** I read the full case study again. It is honestly labelled ("Código privado del cliente — puedo mostrar la implementación en una llamada"), which is the right call ethically, but three rounds running now the paid work remains a paragraph while five other projects on the same page are fully interactive. That gap has not moved at all since Round 3.

4. **The telemetry counters now persist across tab switches**, as the micro-apps spec claims — I confirmed this in `components/micro/WebTelemetryDashboard.client.tsx`: click and session counters live in a module-level `globalTelemetryState` object rather than component state, so switching tabs and back keeps the numbers. Small, but it is exactly the kind of state-management correctness I'd expect from someone building something meant to survive contact with real users.

---

## Where I Lost Trust

1. **The live URL is down.** Covered above — this is the finding, not a footnote to it.

2. **No rate limiting on `/api/ai-copilot`, unchanged from Round 3, and I now see it is a bigger gap than I credited last round.** I re-read `app/api/ai-copilot/route.ts` end to end. It caps message count (40) and body size (200KB) before the request goes anywhere — good, and unchanged. But I looked for the per-request output cap I praised in Round 3 ("output length capped per request") and it is not there. The `upstreamBody` object built at lines 79-92 sets `model`, `messages`, `stream`, `tools`, and conditionally `temperature` — there is no `max_tokens` field, and there never has been in this file's one-commit history (`git log -p` on the route shows no version of it setting one). Whatever I was crediting last round, it is not present in the code today. That means: someone can send one valid 40-message, under-200KB request and receive however many tokens the provider will generate by default before stopping — and do that again immediately, with no per-IP or per-session throttle anywhere in the codebase (no `middleware.ts`, no rate-limit package in `package.json`, no Upstash/Redis config in `.env.example`). This candidate's own architecture reference document (`AI_CHATBOT_ARCHITECTURE.md`, §13.7) says plainly: *"caps are minimal placeholders sized for a private low-traffic app. For a public product, add real per-user rate limiting."* He has told himself this needs doing. It has now survived two feature rounds without being done, and one of those rounds actively added more surface area (the five-endpoint explorer) that makes the ungoverned endpoints easier to hit, not harder.

3. **PHP is still the gap, still unchanged.** `/api/php-sync` (`app/api/php-sync/route.ts`) is, in its own words, a `"kind": "api-contract-example"` with a disclaimer that it "does not proxy or monitor a running PHP service." Honestly labelled, same as Round 3, still nothing running. Three rounds now.

4. **The commercial work is still the least visible thing on a page full of visible things.** No change from Round 3's finding on Awtu Commerce.

---

## Business Value of Projects

| Project | Business translation | Value | Verifiable this round? |
|---|---|:---:|:---:|
| **AI Map Copilot** | Multi-vendor AI over a real dataset; still the differentiator | **Highest** | Yes, locally — not on the live URL, which is down |
| **GeoInsights Bolivia** | Explorable national census | **High** | Yes, locally |
| **Awtu Commerce** | BCP QR payment reconciliation, real production e-commerce | **High as work, low as evidence — unchanged** | No image, no link, same as Round 3 |
| **API Explorer micro-app** | Was: a demo. Now: also a live, unthrottled trigger for two real AI endpoints | **Double-edged** | Yes — and that is the concern |
| **Facility Reservation / PHP Sync / Voronoi Lab** | Same as Round 3 | Medium | Unchanged |

---

## Cost and Risk Perception

**Operating cost, in principle: still low.** No database, no tile server, static prerendering, opt-in AI spend. That architecture has not changed and it is still the right one.

**Vendor risk: still actively mitigated.** The three-provider adapter is intact and is still the strongest cost-discipline signal in this application. I am not walking that back.

**Deliberate-abuse risk: worse than I scored it in Round 3, on the evidence, not on speculation.** Last round I wrote "small, and correctly scoped to his own deployment" and gave Cost/risk awareness a 10. Having now read the exact `upstreamBody` construction line by line, I do not think a 10 was earned even then — there was no output-length cap in the code I can find in this file's history — and it is certainly not earned now that a second, uncapped-by-message-count endpoint (`/api/gemini-assistant`, which validates nothing about request shape beyond a `try { await request.json() }`) sits behind a public button. This is still a personal-portfolio risk, not a company risk — it is his own key, his own bill. But if I am scoring "cost/risk awareness" as a proxy for how this person would build the same pattern on our infrastructure, the honest score has to reflect what the code does, not what I was told it does.

**The live-URL failure is itself a cost/risk signal.** A candidate applying to a *cloud infrastructure company* whose own deployment is down reads, fairly or not, as a gap between the story ("Vercel & Docker" is listed as a stack badge on the page itself) and the operational reality. I do not know why it is down — a billing lapse, a domain change, an expired project — and I am not going to guess. I am going to report what I observed and flag it as the first question I would ask.

**Maintenance risk: mixed.** The spec-vs-shipped gap on the hero name, and the Round-3-praised output cap I could not find in the actual file, are both small individually. Together they are a pattern: claims in the project's own documentation running slightly ahead of what a fresh read of the code confirms. That is worth naming plainly because it is the opposite of what won this candidate the most credit last round.

---

## Portfolio vs CV

Unchanged in substance from Round 3 — the portfolio (when reachable) still demonstrates more than the CV claims. But this round the comparison itself is moot for anyone actually following the link from an application: the CV points at a URL that does not load. A CV that outperforms a broken link is not a comparison that helps him.

---

## Scores

| Area | Score | Notes | Δ vs R3 |
|---|---:|---|:---:|
| Clarity of value | 8 | Same clear positioning once I could see the site at all. | ▼ −1 |
| Business relevance | 9 | Vendor-independent AI over public data, unchanged and still on point. | — |
| Trustworthiness | 5 | Live URL is down; a Round-3-credited cost control (output cap) is not present in the code; a build spec overclaims what shipped on the hero. Three separate small-to-medium gaps between claim and reality, found by checking each one. | ▼ −3 |
| Cost/risk awareness | 6 | Vendor independence still real and still valuable. But the abuse-surface finding is worse on a second read, not the same, and the architecture doc's own admission that the caps are placeholders has now gone two rounds without action. | ▼ −4 |
| Communication quality | 8 | Clear, bilingual, unchanged. | — |
| Project maturity | 7 | Telemetry persistence and the GPS button both work as documented. The live deployment does not. | ▼ −1 |
| Authenticity | 8 | Awtu Commerce is still honestly scoped. The hero-text overclaim in the build spec is a small dent, not a break. | ▼ −1 |
| Likelihood I would approve interview time | 6 | Yes, but I would ask about the dead link before anything else, and I would want a direct answer, not a demo recovery mid-call. | ▼ −3 |

**Average: 7.1 / 10** (Round 3: 8.8)

The drop is concentrated in exactly two things: a URL that does not resolve, and a code-level re-check that found the cost controls are thinner than they were credited for. Everything that was strong in Round 3 that I could still verify — the vendor adapter, the census map, the honest data labels — is still strong.

---

## Top Fixes Before Sending

### Three changes that would increase business trust

1. **Get the production URL live again, today, and confirm it stays live.** Whatever the cause — expired deployment, billing, domain reassignment — this is a same-day fix, not a backlog item. Everything else in this review is secondary to a reachable link.
2. **Add a real per-IP rate limit to `/api/ai-copilot` and `/api/gemini-assistant`, or retire the latter.** This was rank #4 in Round 3's Top 10 and the candidate's own architecture doc already names the fix. Two feature rounds have shipped since without it, and one of them made the ungoverned surface easier to trigger. Close it before adding another live-fire button anywhere else.
3. **Add one screenshot of Awtu Commerce.** Fourth round asking. The revenue-generating project is still the least visible thing on the page.

### Three things to remove because they create risk or confusion

1. **The "Enviar" button on `/api/gemini-assistant` inside the API Explorer**, until rate limiting exists. A working demo of an unthrottled AI endpoint is a worse trust signal than no demo at all.
2. **`/api/gemini-assistant` itself**, per Round 3 — still unresolved, and now more exposed, not less.
3. **The hero eyebrow tag repeating the candidate's name**, or fix the spec doc that claims it was removed. Pick one; right now neither is true.

### Three ways to make projects sound like operational value rather than tech demos

Unchanged from Round 3 — none of these were acted on this round, so I am repeating them rather than inventing new ones:
1. Open each case study with the manual process it replaced.
2. Name the user — a shop owner, a faculty administrator, ninety students.
3. Say what it would cost to extend, in time.

### One better headline

Unchanged recommendation from Round 3 — still not adopted, still the right one:

> **"Construyo herramientas que reemplazan trabajo manual — y que no dependen de un solo proveedor para seguir funcionando."**

### One better project description style

Unchanged from Round 3:

> **Copiloto de Mapas con IA — pregúntale al Censo 2024**
> *Antes:* explorar los datos censales exigía saber qué capa activar y qué umbral aplicar.
> *Ahora:* se pide en lenguaje natural y el mapa se mueve solo.
> *Por qué importa comercialmente:* funciona con tres proveedores de IA intercambiables (NVIDIA, Gemini, OpenAI). Si uno sube de precio o falla, se cambia desde un menú, sin reescribir nada.
> *Coste:* cero hasta que se activa una clave; consumo acotado por petición — **una vez que ese acotamiento exista de verdad en el código.**

---

## Final Recommendation

**MAYBE. Fix the live URL, then re-send — the underlying work still clears my bar.**

I am not downgrading this to NO, because the parts of the Round 3 case that I could still verify — the vendor-independent adapter, the real 247,346-block census map, the honest data labels, the disciplined static-cost architecture — all held up under a second, harder look this round. That is a genuinely good foundation and I would still want to meet this candidate.

But I am not holding at YES either, for two reasons that are both about verification, not vibes:

1. **The live URL — the primary artifact I was asked to evaluate — does not resolve.** I confirmed this three independent ways. I cannot approve interview time on the strength of a link a hiring manager cannot open, regardless of how good the code behind it is once you find a way to run it locally.
2. **A specific cost-control claim I personally credited last round — "output length capped per request" — does not appear in the code I re-read this round.** I do not know if that was ever true and quietly regressed, or if I credited it in error last time. Either way, the responsible move is to say plainly: on today's evidence, that control does not exist, and the combination of no rate limiting plus no output cap plus a newly-added public trigger button for a second AI endpoint is a bigger abuse surface than Round 3's "small, worth one interview question" framing suggested.

**What I would tell the panel:** this is still the strongest technical portfolio in this pile by a wide margin, and the vendor-independence argument I made in Round 3 still stands entirely on its own merits. But "would I approve interview time" has to survive me actually clicking the link, and this round it did not. Fix the deployment, close the rate-limiting gap that has now been flagged twice, and this goes back to YES quickly — the underlying engineering has not gotten worse, only the two things I checked hardest this round.

**Remaining question for the panel, replacing last round's PHP question as the more urgent one:** why was the production deployment unreachable at review time, and is that a one-off or a sign that the deployment pipeline itself needs the same rigor as the application code. PHP is still requirement one on the posting and still unproven — that finding is unchanged and stays on the list — but it is no longer the first thing I would ask about.
