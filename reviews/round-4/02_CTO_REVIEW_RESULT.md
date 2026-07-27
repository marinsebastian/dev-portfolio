# CTO Portfolio Review

**Round:** 4 (Header/Nav rework + Micro-apps/API-explorer rework, commits `8e1a808`, `0d0c28c`, `fe0a2b2`, `6738c9e`, `381dc79` since Round 3's `24172df`)
**Reviewer persona:** CTO, Geolabs Cloud
**Review date:** 2026-07-27
**HEAD at review time:** `381dc79`
**Method:** live URL first, per protocol; local production-equivalent fallback once the live URL proved unreachable; then `tsc`/`eslint`/`build`/`playwright`, then targeted source review of anything credited or flagged; live provider round-trips against NVIDIA and Gemini with the app's own configured keys; DOM/network instrumentation at 360 / 390 / 768 / 1024 / 1440px.

**Labelling convention, used throughout:** **[LIVE]** = observed against `https://dev-portfolio-lilac-chi.vercel.app`. **[LOCAL]** = observed against `http://localhost:3000`, a locally-running instance of the exact same commit (`381dc79`), used only because the live target does not serve anything. Any claim not tagged is a static fact (source code, git history, command output) that is identical regardless of where it runs.

---

## Hiring Verdict

**DO NOT SEND YET.**

Round 3 closed at STRONG TECHNICAL SIGNAL on the strength of a genuinely hard, genuinely working multi-provider AI copilot. This round I went back to specifically re-exercise that copilot the way Round 3 did — live, through the real UI, against real keys — expecting to confirm it still holds. Two things happened instead.

First: the deliverable itself does not load. `https://dev-portfolio-lilac-chi.vercel.app` returns Vercel's own `404: NOT_FOUND` / `DEPLOYMENT_NOT_FOUND` on every request, from this session and independently confirmed outside it. As the reviewer instructed to open the live URL before touching code, my actual first technical finding this round is that there is nothing to open. That alone is enough to hold the send for a cloud-infrastructure employer — reachability is not a nice-to-have for this specific role.

Second, and worse for the technical case specifically: working around the outage with a local instance of the identical commit, I re-ran Round 3's own headline test — ask the copilot to do something ordinary — and the flagship feature broke. Asking the Gemini-backed copilot to do two things in one sentence ("switch the layer and center on La Paz") makes Gemini emit two tool calls in the same turn, but it only attaches its required `thought_signature` to the first one. The client dutifully echoes back exactly what it received — which is correct per Round 3's model — and Gemini's own API then rejects the *following* turn with `400 Request contains an invalid argument`, because one of the two function-call parts arrived unsigned. I reproduced this twice, from a clean conversation both times, with the exact request/response bodies captured below. Round 3 praised this exact contract as "the two provider traps, both handled" and shipped a regression test for it — but that test only ever offers the model one tool, so it can never hit the case where Gemini partially signs a multi-tool turn. Nobody building or testing this feature ever gave the model a reason to ask for two things at once, which is the single most natural thing a user does with a chat interface.

Layered on top: an internal spec document (`07_HEADER_AND_AI_BUTTON_SPEC.md`) explicitly claims the auto-scroll-on-mount bug is "100% Fixed... Removed `autoFocus`... mount-time focus triggers." It is not — `InteractiveCVSection.tsx` line 52 still runs `previewButtonRef.current?.focus()` unconditionally on mount, in the very file the commit touched to fix this exact bug class. And the endpoint Round 3 explicitly recommended retiring (`/api/gemini-assistant`, finding M5) was instead promoted into a new "5 ENDPOINTS OPERATIVOS" showcase — and now demonstrably fakes liveness, returning a canned `[Resumen local — sin llamada a Gemini]` fallback and telling the user to configure a key that is, in fact, already configured and working elsewhere in the same codebase.

None of this erases what still works — NVIDIA's tool-calling loop is real and I watched it drive the map live, the PMTiles pipeline still streams genuine census data, `tsc`/`eslint`(mostly)/`playwright` are still green. But the pattern this round is regressions in exactly the places Round 3 gave the most credit, discovered by doing the same thing Round 3 did rather than reading a new claim. That is not a portfolio to forward today.

---

## Technical Evaluation Scores

| Area | Score /10 | Δ vs R3 | Notes |
|---|---:|:---:|---|
| Full-stack credibility | 6 | ▼ | Real breadth (Next.js API routes, multi-provider proxy, map data pipeline) but two of the routes tested this round misbehave live. |
| Frontend quality | 6 | ▼ | Zero page-level h-scroll confirmed fresh at 390/768/1024/1440. Undercut by two leaked i18n keys rendering as raw text, a duplicate-React-key console error, and a mount-time focus steal — all visible on a fresh load, no interaction required. |
| API/backend credibility | 5 | ▼ | Solid validation, real SSE passthrough, correct key isolation — but 1 of 5 showcased "live" endpoints silently fakes its response, and the flagship proxy 400s on an ordinary two-tool Gemini turn. |
| Database credibility | 4 | — | Unchanged: one correct interval-overlap query as a static sample; no live database. |
| PHP relevance | 3 | — | H1 unchanged, fourth round running: `/api/php-sync` still honestly self-labels `"kind":"api-contract-example"`; nothing executes. |
| Linux/automation evidence | 5 | — | Unchanged: crontab, cron script, Docker Compose, replayable terminal — demonstration, correctly labelled as such. |
| Map/geospatial relevance | 8 | — | Still the strongest asset. Reconfirmed fresh via `playwright test` (byte-range PMTiles streaming, per-block census values on click) and source review; still no keyboard path (H3, unchanged). |
| AI integration credibility | 5 | ▼▼ | NVIDIA path reproduced live and correct. Gemini — the provider Round 3 singled out as correctly handling `thought_signature` — now 400s live on a realistic multi-tool prompt, with zero test coverage for that path. |
| Code maintainability | 5 | ▼ | `eslint` no longer clean (1 error). A duplicate-key React bug. Two divergent, undeduplicated Gemini call paths where Round 3 asked for one. A "fix" commit left an identical unfixed bug in the file it edited. |
| Documentation quality | 4 | ▼▼ | Reverses Round 3's biggest gain. `07_HEADER_AND_AI_BUTTON_SPEC.md` contains a "100% Fixed" claim that a two-minute source read disproves; its route count (10/10) doesn't match the actual build output (8 routes, verified below). |
| Hiring confidence | 3 | ▼▼▼ | Unreachable production deployment plus fresh regressions in the exact feature used to justify last round's interview recommendation. |

**Aggregate: ≈4.9/10** (Round 3 synthesis aggregate: 8.4/10 — no per-area breakdown was published that round, so deltas above are directional, not row-matched.)

---

## First Technical Impression

**[LIVE]** I opened `https://dev-portfolio-lilac-chi.vercel.app` per the review protocol, before touching any code. It returned:

```
404: NOT_FOUND
Code: DEPLOYMENT_NOT_FOUND
ID: gru1::fm7z2-1785137974387-c5993f4adb55
```

Confirmed via the network panel (`GET / → 404`), not a client render of a 404 page — this is Vercel's own edge routing layer reporting no deployment is currently aliased to the domain the README (`README.md:7`) and this review's own brief both point to. This is not a cold start; cold starts return the app slowly, they don't return a platform-level "deployment not found." Whatever the last two commits shipped is sitting in git history the public internet cannot currently reach.

**[LOCAL]** Per instruction, I fell back to a locally-running instance of the identical commit (`381dc79`) to actually evaluate the work. It anchors cleanly at `#overview` with no forced scroll — the auto-scroll-on-mount fix genuinely works for the two mount points it addressed (`GeolocationConsent.client.tsx`, the PDF-modal close button) — and the hero renders the same clear positioning statement as Round 3. The header now carries the candidate's name and title prominently (`Sebastian Marin` / `Ingeniero de Sistemas | Full-Stack`), and desktop nav genuinely collapses to icons — I confirmed this is real CSS (`max-w-0 opacity-0` → `group-hover:max-w-xs group-hover:opacity-100` in `components/layout/Header.tsx:66`), not just styled to look collapsed.

I went straight back to the AI copilot, because Round 3's entire verdict rested on it. `GET /api/ai-copilot` **[LOCAL]** still reports all three providers configured:

```json
{"available":[
  {"id":"nvidia","label":"NVIDIA NIM","model":"z-ai/glm-5.2"},
  {"id":"gemini","label":"Google Gemini","model":"gemini-3.1-flash-lite"},
  {"id":"openai","label":"OpenAI","model":"gpt-5-nano"}
],"fallback":false}
```

Clicking "Ver áreas con fibra > 80%" against NVIDIA reproduced Round 3 almost exactly: three real POST round trips, a genuine layer switch (`DENSITY` → `TECH_CONN`), a threshold badge, and a closing message — "Listo. Apliqué 3 acciones sobre el mapa." with `nvidia · z-ai/glm-5.2` badged on the reply. NVIDIA is unambiguously still real.

Then I asked the obvious next question: does the same hold for Gemini, the provider this portfolio's own documentation and Round 3's review both spent the most words praising for correctness? It does not. Details below.

---

## The Gemini regression: multi-tool-call `thought_signature` gap

This is the section Round 3 would have called "the two provider traps, both handled." I want to show why that no longer holds, because the failure mode is subtle and the existing regression test cannot catch it.

**[LOCAL]** Fresh conversation, Gemini selected, single message: *"Cambia a la capa de densidad y centra el mapa en La Paz"* (switch to the density layer and center the map on La Paz — an entirely ordinary compound request). I intercepted the client's own `fetch` calls to capture the raw wire bodies:

Round 1 response (`200 OK`), streamed SSE, reassembled:
```json
{"delta":{"tool_calls":[{
  "extra_content":{"google":{"thought_signature":"EjQKMgERTTIPGenjXOqqcyi8utzXdh29b+1WlsB97qPpeQjKf7hldHDAqb1+Eeul6vv7sXYS"}},
  "function":{"name":"set_map_layer","arguments":"{\"layer\":\"DENSITY\"}"},
  "id":"U11J8Nlt","type":"function"}]}}
{"delta":{"tool_calls":[{
  "function":{"name":"set_map_scope","arguments":"{\"scope\":\"La Paz\"}"},
  "id":"Rf3HPioH","type":"function"}]}}
```

Note the second tool call has **no `extra_content` field at all** — Gemini itself only signed the first of the two calls it made in this turn. The client (`components/ai/useCopilotChat.ts:118`, `if (fragment.extra_content !== undefined) existing.extra_content = fragment.extra_content;`) correctly captures per-call, so it forwards exactly what it received: one signed call, one unsigned call, both in the same `tool_calls` array on the echoed assistant turn.

Round 2 request, echoing both calls back verbatim as required → **`400 Bad Request`**:
```json
{"error":"Request contains an invalid argument.","provider":"gemini","model":"gemini-3.1-flash-lite"}
```

I reproduced this twice from a clean "Reiniciar conversación" state with the identical prompt, both times: `200` then `400`. The user-visible result in the chat is `"El copiloto no pudo responder: Request contains an invalid argument."` — a dead end on the second message of a session, using the provider the portfolio specifically calls out for handling this contract correctly.

**Why the existing test didn't catch it.** `tests/smoke.spec.ts:510` ("requires the thought_signature to be echoed back") is a real, well-constructed test — but it hands Gemini exactly one tool (`set_map_layer`), which forces a single-call turn where Gemini always signs the one call it makes. It asserts both the echo-success and strip-then-400 paths correctly, but it structurally cannot exercise the case where Gemini itself only partially signs a multi-call turn, because the test never gives the model a reason to make two calls. The production system prompt and tool schema (nine tools, including two the model reached for together above) make multi-call turns common; the test suite's Gemini coverage does not model that at all.

This is a materially different finding from anything in Round 3, and it directly undercuts the review's own best-technical-positioning sentence from that round, which specifically cited the `thought_signature` handling as evidence of debugging rather than assembly. The debugging clearly happened for the single-call case; it did not extend to the multi-call one, and that is precisely the shape of bug that only live testing — not a scripted demo — surfaces.

---

## `/api/gemini-assistant`: promoted, not retired, and now demonstrably fake

Round 3's finding M5 flagged `/api/gemini-assistant` as a redundant code path superseded by the copilot, and recommended retiring it. This round's commit `fe0a2b2` did the opposite: it added the route as one of five headline entries in a new "5 ENDPOINTS OPERATIVOS" API Explorer (`components/micro/ApiExplorer.client.tsx:22-29`), with a pre-filled example body, presented as one of the site's own proof points ("Proxy de la API de Gemini en el servidor").

**[LOCAL]** I called it exactly as the UI does:

```
POST /api/gemini-assistant  {"metroArea":"La Paz","activeLayer":"TECH_CONN","language":"es"}
→ 200
{
  "reply": "[Resumen local — sin llamada a Gemini]\n...\n\n[Configura GEMINI_API_KEY en el entorno para habilitar el resumen generado por Gemini. Sin la clave, esta respuesta se arma en el servidor a partir de los datos ya cargados.]",
  "meta": { "source": "local-fallback", "model": null, ... }
}
```

`GEMINI_API_KEY` **is** configured in this environment — confirmed both by `/api/ai-copilot` listing Gemini as available and by a successful live Gemini stream moments earlier through the copilot. The route's own fallback text is telling the user to configure a key that already works elsewhere in the same repository. Reading `app/api/gemini-assistant/route.ts:92-133`, the cause is structural: this route calls the raw `v1beta/models/gemini-2.5-flash:generateContent` REST endpoint directly with a hardcoded model string, a completely different code path from `lib/aiProviders.ts`'s OpenAI-compatible adapter (`v1beta/openai`, model `gemini-3.1-flash-lite`) that the copilot uses successfully. `gemini-2.5-flash` is not in `aiProviders.ts`'s own `knownModels` list for Gemini (`gemini-3.1-flash-lite`, `gemini-2.0-flash`) — whatever the reason the direct call fails, it is caught by a bare `catch (err) { console.error(err) }` and silently swallowed into the canned fallback, with no error surfaced to the caller beyond a `source: "local-fallback"` field the UI doesn't display prominently.

The net effect: a feature now marketed as "5 ENDPOINTS OPERATIVOS — pulsa Enviar, la petición sale de tu navegador hacia las rutas reales" has a 1-in-5 chance, on the exact example body it ships with, of silently not being live — while claiming the opposite reason for the fallback than the true one.

---

## Requirement-by-Requirement Fit

| Requirement | Evidence | Strength | Δ vs R3 |
|---|---|:---:|:---:|
| **PHP** | Still no executing PHP. `/api/php-sync` still honestly labels itself `"kind":"api-contract-example"` with an explicit disclaimer. Fourth round running. | **medium** | — |
| **Interactive responsive UI** | Zero page-level h-scroll confirmed fresh at 390/768/1024/1440px. Undercut by leaked i18n keys, a duplicate-key console error, and a mount-time focus steal, all present on an unmodified fresh load. | **medium** | ▼ from strong |
| **MySQL/PostgreSQL** | Unchanged: correct half-open-interval query as a static sample; no live database. | **medium** | — |
| **REST APIs / cURL** | Five route handlers, real SSE streaming, real validation caps — but one of the five ("5 ENDPOINTS OPERATIVOS") silently fakes liveness under exactly the test the site invites a reviewer to run. | **medium** | ▼ from strong |
| **Linux / cron / processes** | Unchanged: crontab, cron script, Docker Compose, replayable terminal — demonstration, correctly labelled. | **medium** | — |
| **AI tools / agents** | NVIDIA tool-calling reproduced live and correct. Gemini — the provider previously praised most — now 400s on a realistic two-tool turn with no test coverage for that path. | **medium** | ▼▼ from strong |
| **Maps / GIS** | Reconfirmed fresh: `playwright test` still shows byte-range PMTiles streaming and real per-block census values on click. Source architecture unchanged since Round 3. Still no keyboard path. | **strong** | — |
| **Git / clean docs** | `eslint` regressed to 1 error / 1 warning. A shipped spec document (`07_HEADER_AND_AI_BUTTON_SPEC.md`) contains a verifiably false "100% Fixed" claim and an inflated route count. | **medium** | ▼▼ from strong |
| **MCP** (desirable) | Still not claimed — correctly. | N/A | — |
| **PostGIS** (desirable) | Not claimed. | N/A | — |

---

## Project Credibility Review

**GeoInsights Bolivia / the flagship map+copilot.** Still the best single artifact in the application, and the one part of this round's testing that reconfirmed itself cleanly on the map-data side: a fresh `npx playwright test` run (below) shows the PMTiles byte-range streaming test and the click-to-reveal census-value test both passing, exercising the exact "does this actually stream real data" question Round 2 failed. The AI layer sitting on top of it, however, is where this round's credibility damage concentrates — see above. I would still lead with this project; I would not, this round, let a reviewer touch the Gemini provider selector without expecting to see it break.

**API Explorer micro-app.** Genuinely issues live requests to live routes, confirmed by intercepting the actual fetch calls — this is not mocked. But "genuinely live" and "genuinely working" are different claims, and the tool now demonstrates the gap between them on one of its five options.

**Awtu Commerce.** Unchanged from Round 3: a paragraph and an honest "code is private" disclaimer. Still the revenue-generating work, still the least visible thing on the page, still zero screenshots (`document.querySelectorAll('img').length === 0` **[LOCAL]**, matching the CEO round's finding).

**Micro-apps generally (telemetry, terminal, locator).** Spot-checked the telemetry counter's cross-tab persistence claim from `08_MICRO_APPS_AND_CODEBLOCK_ERADICATION_SPEC.md`: the module-level `globalTelemetryState` object in `WebTelemetryDashboard.client.tsx` does survive component remounts within a session (confirmed by reading the implementation — it's a plain module-scope object, not React state, so unmount/remount doesn't reset it). It resets on a full page reload, which the spec doesn't claim otherwise, so this one holds up as described.

---

## Code / Repo Findings

**Verified command output, this session, against `381dc79`:**

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npx eslint .` | **FAIL** — 1 error, 1 warning (see below) |
| `npm run build` | **PASS** — 8 routes (`/`, `/_not-found`, 5 API handlers, `/opengraph-image`) |
| `npx playwright test` | **PASS** — 39/39 |

**The `eslint` regression, precisely:**
```
components/micro/WebTelemetryDashboard.client.tsx
  54:5  error  'globalTelemetryState' is never reassigned. Use 'const' instead  prefer-const

components/sections/WorkflowQASection.tsx
  5:20  warning  'Shield' is defined but never used  @typescript-eslint/no-unused-vars
```
Both traced to `fe0a2b2`, this round's micro-apps commit. Neither is severe on its own (the `let` works fine at runtime since only its properties mutate; the unused import is cosmetic), but both spec documents for this round (`07_HEADER_AND_AI_BUTTON_SPEC.md`, `08_MICRO_APPS_AND_CODEBLOCK_ERADICATION_SPEC.md`) claim `0 errors` without mentioning `eslint` was run at all — `tsc`, `build`, and `playwright` are the only three checks either document cites. That's a gap in what "verified" means in this repo's own documentation, not just a lint nit.

**Doc-vs-build mismatch:** both round-4 spec documents state "static prerendering succeeded across 10/10 routes." The actual build output lists 8 routes total (2 static pages, 5 API handlers, 1 OG image), matching Round 3's own verified count exactly. Minor, but it's the second inflated number in this round's internal documentation (the first being the "100% Fixed" claim below), and both point the same direction.

**The auto-scroll fix, done half right.** `git diff 8e1a808~1 8e1a808` shows two focus-triggering calls removed: `autoFocus` on the PDF-modal close button (`InteractiveCVSection.tsx`) and `primaryRef.current?.focus()` on the geolocation modal (`GeolocationConsent.client.tsx`). Both genuinely stop the auto-scroll they caused. But `InteractiveCVSection.tsx:51-53` still has:
```tsx
useEffect(() => {
  if (!pdfModalOpen) previewButtonRef.current?.focus();
}, [pdfModalOpen]);
```
`pdfModalOpen` starts `false`, so this effect fires on every mount and silently moves keyboard focus to the "Previsualizar Documento PDF" button — the same file, the same bug class, missed by the same commit that claims to have eliminated it. I confirmed via `document.activeElement` on a fresh load **[LOCAL]**: it is not `<body>`. The right fix here (and for the geolocation modal, which now has `role="dialog" aria-modal="true"` but moves focus nowhere on open — a real regression against the standard modal pattern) was `.focus({ preventScroll: true })`, not deleting focus management. The bug report was "focus causes an unwanted scroll," and the fix removed focus rather than the scroll.

**Duplicate React key, live-reproducible.** `MapCopilot.client.tsx:307` renders tool-call action chips with `key={action}`, where `action` is the tool's bare name. NVIDIA's own multi-tool responses routinely call the same tool twice in one turn (I observed `set_metric_threshold` called twice in a single 3-action response) — React logs "Encountered two children with the same key... set_metric_threshold" to the console every time this happens. Cosmetic in effect, but it is exactly the kind of defect that shows up the moment a reviewer actually drives the feature instead of reading about it.

**Leaked translation keys.** `flagship.centerOnMe` (the map's "center on me" button, `RealBlockMapWidget.client.tsx:541`) and `flagship.thresholdActive` / `flagship.thresholdClear` (the AI-copilot-driven threshold badge, lines 604 and elsewhere) render as raw dotted-path strings in production because those three keys were never added to `context/LanguageContext.tsx`'s translation table; `t()`'s fallback (`context/LanguageContext.tsx:104`, `?? path`) surfaces the lookup path itself when a key is missing. These date to `7dc2755` (Round 3's own base commit) and were not caught by that round's review either — but they are directly visible in the exact "Ver áreas con fibra > 80%" flow Round 3 used as its star demo, which is precisely the flow I re-ran this round.

**Security posture, unchanged and still sound.** Keys read only in route handlers; no key-shaped strings in served HTML or JS chunks (spot-checked). `resolveProvider` still falls through silently rather than leaking which providers are configured. Validation (empty messages, >40 messages, >200KB body) still runs before any paid call.

---

## Broken or Weak Areas

| # | Issue | Severity | Status |
|:---:|---|:---:|:---:|
| 1 | **Production deployment unreachable.** `https://dev-portfolio-lilac-chi.vercel.app` returns `404 DEPLOYMENT_NOT_FOUND` on every request. | **Critical** | **New** |
| 2 | **Gemini copilot 400s on realistic multi-tool-call turns.** Reproduced twice from a clean conversation; exact cause is a partially-signed `thought_signature` the existing test cannot catch (single-tool-only coverage). | **High** | **New** |
| 3 | **`/api/gemini-assistant` silently fakes liveness** while promoted as 1 of "5 ENDPOINTS OPERATIVOS," and its own fallback message misreports the reason (says the key is missing; it is configured and working). | **High** | **Regressed** (M5, was "redundant," now "redundant and broken") |
| 4 | **No PHP executes anywhere.** Fourth round running, our headline requirement. | **High** | Unchanged (H1) |
| 5 | **Map canvas has no keyboard path or text alternative.** | **High** | Unchanged (H3) |
| 6 | **Auto-scroll fix incomplete in the file it targeted** — `InteractiveCVSection.tsx` still steals focus on every mount; `GeolocationConsent.client.tsx`'s dialog now moves focus nowhere on open, a new a11y regression from how the original bug was fixed. | **Medium** | **New / partially regressed** |
| 7 | **`eslint` no longer clean** — 1 error, 1 warning, both from this round's own commit, neither mentioned in either round-4 spec document's "verified" section. | **Medium** | **New** |
| 8 | **Two leaked i18n keys visible in production** on the flagship map, in the exact demo flow this portfolio leads with. | **Medium** | Present since R3 base, newly noticed |
| 9 | **Duplicate React key console error** when a tool-call turn repeats a tool name (observed live). | **Low** | **New** |
| 10 | No rate limiting on `/api/ai-copilot` beyond message-count/body-size caps. | Medium | Unchanged (M1) |
| 11 | No rolling conversation summarisation — still a hard 400 at 40 messages. | Medium | Unchanged (M2) |
| 12 | Internal spec docs overstate two fixes this round (`07_HEADER_AND_AI_BUTTON_SPEC.md`'s "100% Fixed" claim; both docs' "10/10 routes" vs. the actual 8). | Medium | **New** |
| 13 | Desktop hover-expanding nav labels never appear for keyboard-only focus, only `:hover` (`Header.tsx:63-68` has no focus-visible equivalent to the hover reveal). Text remains in the accessibility tree, so screen-reader users are unaffected; sighted keyboard users see icon-only buttons. | Low | **New** |

---

## What to Remove or Hide

* **`/api/gemini-assistant`, for real this time.** It was asked to be retired in Round 3 for being redundant. It is now redundant *and* silently broken, and it is currently the most prominent it has ever been in the UI. Promoting a fake-live endpoint into a "5 live endpoints" showcase is a worse outcome than leaving it alone would have been.
* **The Gemini option in the copilot provider selector, until the multi-tool-call signature gap is fixed.** Showing three providers when one reliably breaks on ordinary input is worse than showing two that work every time — the current failure mode hands a reviewer a broken demo mid-conversation with no warning.
* **The "10/10 routes" and "100% Fixed" claims in `07_HEADER_AND_AI_BUTTON_SPEC.md`** — neither survives a direct check, and this class of internal doc is exactly what Round 3 credited for having become trustworthy.

---

## What to Improve Before Sending

**Should fix:**
1. **Get the production deployment live again and add a trivial post-deploy check** (a GitHub Action that curls `/` and fails on non-200 is enough) so this cannot recur silently. This blocks everything else in this file from mattering.
2. **Fix the Gemini multi-tool-call `thought_signature` gap.** Either merge/backfill a signature across all calls in a turn before echoing, detect a partially-signed turn server-side and force single-tool-call rounds for Gemini, or catch the resulting 400 client-side and retry once with `tools` stripped rather than surfacing a dead-end error. Then extend `tests/smoke.spec.ts:510` to offer Gemini two tools in one prompt, so this class of regression cannot ship silently again.
3. **Make `/api/gemini-assistant` either actually call Gemini successfully or say so honestly** — right now it does neither: it fails silently and blames a key that works. At minimum, surface the real upstream error in `meta` instead of swallowing it into `console.error`.
4. **Finish the auto-scroll fix.** Replace the deleted focus calls with `.focus({ preventScroll: true })` in both `InteractiveCVSection.tsx` and `GeolocationConsent.client.tsx`, restoring correct modal focus behaviour without reintroducing the scroll jump.
5. **Add the three missing translation keys** (`flagship.centerOnMe`, `flagship.thresholdActive`, `flagship.thresholdClear`) to `LanguageContext.tsx`. Trivial fix, high visibility — they're on screen in the site's own star demo.
6. Fix the `prefer-const` error and the unused `Shield` import; re-run `eslint` before writing "0 errors" in the next spec document.

**Nice to have (unchanged from Round 3, still true):**
7. Ship one PHP artifact that actually runs.
8. Add rate limiting and rolling conversation summarisation to `/api/ai-copilot`.
9. Give the map canvas a keyboard path and text alternative.
10. Add `group-focus-within`-equivalent handling so the header nav's text labels appear for keyboard focus, not only mouse hover.

---

## Best Technical Positioning Sentence

> "One OpenAI-compatible server adapter fronts NVIDIA NIM, Gemini and OpenAI with streaming SSE and client-side function calling that drives a live MapLibre GL map over 247,346 real INE census blocks — verified this round by driving it live against NVIDIA, and by finding, live, the exact edge case in Gemini's `thought_signature` contract that its own regression test doesn't cover."

That second half is not a criticism dressed as praise — it is the honest sentence right now. The architecture is still real and still hard to fake. It is not, this round, fully correct, and a candidate who can find and fix the multi-tool-call signature gap before the next review would be demonstrating exactly the debugging instinct Round 3 credited him for — applied to a bug this round's own testing missed.

---

## Final Recommendation

**Hold. Do not forward until (1) the production URL is confirmed reachable and (2) the Gemini provider either works on realistic multi-tool prompts or is temporarily removed from the selector.**

Round 3 ended on: "someone who audits their own work harder after criticism than before it is someone to hire early." This round is the first data point against that read, on the technical side specifically. The two hardest-won pieces of credibility from Round 3 — the provider-quirk handling that made the AI integration the standout requirement, and documentation good enough to be cited as evidence in its own right — both took a step back this round, not because the underlying idea is wrong, but because neither was re-tested against a case the original build didn't anticipate. That is a normal, fixable gap. It is not, yet, evidence I'd put in front of Geolabs.

**Interview questions, if this does proceed to interview once the above is fixed:**

1. "Your Gemini test only ever gives the model one tool. Walk me through what happens when it reaches for two — and how would you have caught this before a reviewer did?"
2. "The auto-scroll bug was 'fixed' by deleting a focus call instead of adding `preventScroll`. What's the actual accessibility cost of that shortcut, and where else in the codebase should I expect to find the same pattern?"
3. "The old Gemini endpoint was flagged as redundant last round. This round it got promoted into a 5-endpoint showcase and it turned out to be silently broken. Walk me through the decision to feature it more, not less."
4. "Show me PHP that ran in production against a real database, and tell me what broke." *(Unchanged from Round 3 — still unanswered.)*
