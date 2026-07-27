# CTO Portfolio Review

**Round:** 3 (first review of the Multi-LLM Copilot / Enterprise UX build)
**Reviewer persona:** CTO, Geolabs Cloud
**Review date:** 2026-07-27
**Method:** production build first (`npm run build && npm run start`), live provider calls, network and DOM instrumentation, then selective source review
**Verification performed:** `npx tsc --noEmit`, `npm run build`, `npx playwright test`, `npx eslint .`, live calls against NVIDIA NIM and Gemini, six-viewport layout instrumentation

---

## Hiring Verdict

**STRONG TECHNICAL SIGNAL.**

Round 2 ended at DO NOT SEND, because the flagship census map rendered zero polygons and three layers of self-assessment had reported it working. That is fixed and, more importantly, the *class* of failure is now guarded: the camera-order bug that caused it has a regression test, and the map is covered by assertions that would fail if it ever went blank again.

What has been added on top is the most substantial piece of engineering in this portfolio so far, and it is the kind that is hard to fake: a single OpenAI-compatible adapter serving three different LLM providers, streaming SSE straight through, with client-side function calling that actually drives the map. I tested it against live NVIDIA and Gemini keys. It works, and the two provider-specific traps that this integration is famous for are both handled correctly.

I would forward this to the team with a recommendation to interview.

---

## First Technical Impression

I opened the production build and went straight for the AI copilot, because that is the claim most likely to be a wrapper around a single hardcoded API call.

It is not. `GET /api/ai-copilot` returns:

```json
{"available":[
  {"id":"nvidia","label":"NVIDIA NIM","model":"z-ai/glm-5.2"},
  {"id":"gemini","label":"Google Gemini","model":"gemini-3.1-flash-lite"},
  {"id":"openai","label":"OpenAI","model":"gpt-5-nano"}
]}
```

Three providers, each behind the same adapter, each reporting the model actually resolved from its own environment override. The selector renders only providers whose key exists server-side — so the UI never offers an option that will fail on click.

Then I checked the thing I always check with this pattern, which is whether the "streaming" is real or a `await response.json()` dressed up with a typewriter animation. It is real: the route pipes `upstream.body` through untouched, and the client parses SSE frames with a proper partial-line buffer.

---

## The two provider traps, both handled

This is the section that moved my verdict, so I want to show the evidence rather than assert it.

### 1. Gemini's `thought_signature`

Gemini's OpenAI-compat layer attaches an opaque signature to every tool call and rejects the *following* turn if you do not echo it back verbatim. Most implementations discover this the hard way. I tested both directions against a live key:

```
POST /api/ai-copilot  (gemini, tools attached)
→ 200, delta.tool_calls[0].extra_content.google.thought_signature present

Echo it back on the next turn  → 200, streams a normal answer
Strip it and send the same turn → 400 "Function call is missing a thought_signature
                                       in functionCall parts."
```

The client captures `extra_content` while accumulating streamed fragments and forwards it unmodified. Other providers never set the field, so carrying it is a no-op for them. There is a Playwright test asserting both directions, which self-skips when no Gemini key is configured — the right call, since a test that silently passes without a key would be worse than no test.

### 2. Gemini's array-wrapped error bodies

Gemini returns `[{error: {...}}]` where OpenAI and NVIDIA return `{error: {...}}`. A naive `parsed?.error?.message` yields `undefined` on the array and the real cause — quota, bad model name — disappears behind a generic failure. `extractUpstreamError` checks `Array.isArray(parsed) ? parsed[0]?.error : parsed?.error`. I saw it working: the 400 above surfaced its actual message rather than a placeholder.

### Bonus: `temperature` is omitted unless requested

`if (typeof body.temperature === 'number')` — so the field is simply absent from the upstream request by default. Reasoning-tier models reject *any* explicit temperature, including a "safe" 0.7. Getting this right without being bitten by it first suggests the reference architecture was read properly rather than skimmed.

---

## Function calling: does it actually do anything?

Nine tools, all narrow and single-concern: `set_map_layer`, `set_map_scope`, `fly_to_location`, `set_metric_threshold`, `clear_metric_threshold`, `get_map_state`, `get_selected_block`, `get_user_location`, `get_visible_block_stats`. That is the right granularity — a single "query anything" tool gets called incorrectly far more often, especially by smaller models.

Tools execute **client-side**. I initially read that as a shortcut, then reconsidered: the map instance, its rendered features and the user's inferred location all live in the browser. Round-tripping to a server to read state the client already holds would double latency for nothing. For a backend-heavy port you would flip this, and the architecture note says exactly that. The reasoning is sound and it is written down.

I clicked the "Ver áreas con fibra > 80%" chip and watched a real multi-round loop:

```
tools invoked: set_metric_threshold(), get_map_state(), set_map_layer()
layer:         DENSITY → TECH_CONN
threshold:     80+ %
answer:        "Cambié la capa a Conectividad… solo se iluminan los manzanos
                con cobertura superior al 80%…"
```

The loop is capped at four rounds and drops `tools` on the final round so the model is forced into prose instead of looping forever. Correct.

**Two defects were found and fixed during this cycle, and I want to note them because the fixes are better than the average response to these problems:**

- GLM-family models sometimes emit `<tool_call>…</tool_call>` as plain content on that final tools-free round. Rendering that to a user is worse than rendering nothing, so it is stripped before display, with a fallback that reports what actually changed on the map if nothing legible survives.
- Models routinely pass a coverage threshold as the raw field value (`0.8`) rather than the percentage the user said (`80%`). The archive stores coverage as 0–1, so trusting the model here would dim the entire city. The tool normalises instead. That is the correct instinct: validate what the model gives you rather than assuming it read your schema description.

---

## Requirement-by-Requirement Fit

| Requirement | Evidence | Strength |
|---|---|---|
| **PHP** | Still no executing PHP. Two competent static samples plus `/api/php-sync`, which now honestly labels itself `kind: "api-contract-example"` with an explicit disclaimer instead of claiming `OPERATIONAL`. The Linux console replays a `cron_sync.php` run and states plainly that it is a recording, not a shell. | **medium** — the honesty upgrade matters, but our headline requirement still has no running artifact. |
| **Interactive responsive UI** | Next.js 16.2.11, React 19.2.4, strict TS, Tailwind v4. Measured across 360/390/768/1024/1440: zero page-level horizontal scroll, zero clipped elements outside scrollable `<pre>` regions. | **strong** |
| **MySQL/PostgreSQL** | Correct half-open-interval overlap query; no live database. | **medium** |
| **REST APIs / cURL** | Five route handlers now, including a streaming SSE proxy with real validation (message cap, 200KB body cap, method check) and a server-side IP-geolocation proxy. | **strong** |
| **Linux / cron / processes** | Crontab, bash cron script, Docker Compose with healthcheck, plus the terminal replay. Still demonstration rather than execution — correctly labelled as such. | **medium** |
| **AI tools / agents** | Three providers, one adapter, streaming, function calling, tool-loop capping, provider-specific quirk handling, server-only keys. This is now the strongest requirement in the set. | **strong** |
| **Maps / GIS** | MapLibre GL v6 + PMTiles v4, 247,346 real census polygons, worker-side protocol registration, data-driven paint, threshold filtering, geometry-copy selection highlight. Verified rendering: 4,819 blocks over Santa Cruz. | **strong** |
| **Git / clean docs** | `eslint .` clean, README rewritten and accurate, `DATA_SOURCES.md` documents the mixed schema, `.env.example` covers every provider. Commit messages describe cause and evidence. | **strong** — was "weak" in Round 2. |
| **MCP** | Still not claimed. The architecture note explains when MCP earns its complexity versus plain function calling, and correctly concludes plain calling is right here. | **N/A (correctly not over-claimed)** |
| **PostGIS** | Not claimed. | **N/A (correctly not over-claimed)** |

---

## Code / Repo Findings

**Verified command output:**

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npm run build` | **PASS** — 8 routes, 5 API handlers, static prerender + generated OG image |
| `npx playwright test` | **PASS** — 39/39 |
| `npx eslint .` | **PASS** — 0 problems |

**Security.** Keys are read only in route handlers. The client may *request* a provider, but the server honours that only when the key actually exists, falling through silently otherwise — so a crafted request cannot enumerate which providers are configured by comparing error messages. I checked the served HTML and every JS chunk: no key-shaped strings. Request validation rejects non-array messages, empty arrays, >40 messages and >200KB bodies before anything reaches a paid endpoint. For a public deployment I would still want per-IP rate limiting; the current caps stop accidental blowouts, not a determined one.

**The micro-apps are genuinely live, not mock-ups.** This was the specific claim I expected to be softest, and it held up:
- Telemetry reads real `requestAnimationFrame` deltas and the Navigation Timing API, and measures an actual round trip to `/api/spatial`. Navigation timings are surfaced via `useSyncExternalStore` with a memoised snapshot rather than pushed into state from an effect — a detail most people get wrong.
- The API tester issues real requests to real routes and renders the actual status, duration, byte count and body. I watched it return a genuine 200 with Cochabamba's record.
- The locator map is a second, deliberately raster-only MapLibre instance — no PMTiles source, no worker — because it is a locator, not an analysis surface. Right call.
- The terminal is a recorded transcript and *says so*: "No es una shell remota: este panel no ejecuta comandos." A browser terminal that actually executed commands would be the one thing I'd reject outright.

**State architecture.** `GeoConsoleContext` holds scope, layer, threshold, selection and location, and the map publishes an imperative controller (`flyTo`, `getCenter`, `getVisibleStats`…) through a ref registry. That is a clean separation: the copilot drives the map without holding a MapLibre instance, and the focused-mode overlay mounts a *second* map rather than relocating a live canvas across React trees, which would lose the WebGL context. The comment says exactly that. Good.

**Attribution.** The canvas watermark is gone per the spec, but CARTO, OpenStreetMap and `@mauforonda` are credited as discrete links in the info card below the map, and a test asserts both that the links exist and that no `.maplibregl-ctrl-attrib` node does. That satisfies the OSM licence without the overlay. I would have flagged it hard if the requirement had been read as "remove attribution."

---

## Broken or Weak Areas

| # | Issue | Severity |
|:---:|---|:---:|
| 1 | **No PHP executes anywhere.** Our headline requirement is still demonstrated only by static samples and honest labels. The labels are now correct, which removes the credibility problem, but not the evidence gap. | **High** |
| 2 | **No rate limiting on `/api/ai-copilot`.** Message and body caps are in place; nothing stops one client looping requests. Fine for a portfolio, not for anything public with a metered key behind it. | **Medium** |
| 3 | **The copilot has no conversation memory strategy.** History grows unbounded within a session until the 40-message cap rejects it outright. The reference architecture describes rolling summarisation past a threshold; it is not implemented. A long session will hit a wall rather than degrade. | **Medium** |
| 4 | **No connection prewarm.** The first message of a session pays cold-start plus provider handshake. The architecture note calls this out and suggests a warm-up that produces a real greeting. Not done. | **Low** |
| 5 | **`/api/gemini-assistant` is now redundant.** The copilot supersedes it, but the older endpoint remains, with its own prompt and fallback path. Two code paths doing the same job will drift. | **Low** |
| 6 | **Zone summary cards are still illustrative figures.** Correctly labelled now, and the copilot's system prompt tells it to admit this if asked — genuinely good. But a reviewer still meets invented numbers next to real ones. | **Low** |
| 7 | **The location prompt interrupts every first visit** 2.5s in, with a full backdrop. Justified and well-written, but it is an interstitial between the reader and the content. | **Low** |
| 8 | **Focused mode on mobile gives the map ~40% of the viewport**, not the specified 50/50. The controls strip and chat header take the difference. Usable — the composer stays on screen, which matters more — but it is not what the spec says. | **Low** |

No console errors on load. No broken links. No fake buttons remaining.

---

## What to Improve Before Sending

**Should fix:**
1. Ship one PHP artifact that actually runs, even a Docker-composed container behind a documented endpoint. It is our first requirement and the only one still resting on assertion.
2. Add rolling summarisation to the copilot, or at minimum trim history and tell the user, rather than letting a long conversation hit a hard 400.
3. Add basic per-IP rate limiting before this is public with live keys.

**Nice to have:**
4. Retire `/api/gemini-assistant` or fold it into the copilot.
5. Prewarm the provider connection on chat mount, and make that warm-up produce the greeting rather than discarding it.

---

## Best Technical Positioning Sentence

> "One OpenAI-compatible server adapter fronts NVIDIA NIM, Gemini and OpenAI with streaming SSE and client-side function calling that drives a live MapLibre GL map over 247,346 real INE census blocks — including the Gemini `thought_signature` echo that the compat layer requires and returns 400 without."

Every clause is verifiable from the repository, and the last one is the part that tells another engineer this was actually built and debugged rather than assembled from a tutorial.

---

## Final Recommendation

**Forward with a recommendation to interview.**

The gap between Round 2 and Round 3 is the most informative thing in this file. Round 2 found a flagship that rendered nothing while the repository asserted it worked. Round 3 finds that bug fixed, guarded by a regression test, and a genuinely harder feature built on top — with the two provider quirks that break most first implementations handled correctly, and two further defects found and fixed during this cycle rather than shipped.

That is the trajectory I want to see. The remaining gap is unchanged and specific: **PHP in production.** Everything else our posting asks for is now demonstrated by something running.

**Interview questions:**

1. "Your tools run in the browser. When would you move them server-side, and what changes?" *(The reasoning is already written down; I want to hear him defend it unprompted.)*
2. "Walk me through the Gemini thought_signature problem." *(Tests whether he hit it and debugged it, or copied a fix.)*
3. "Show me PHP that ran in production against a real database, and tell me what broke."
4. "This conversation history grows until a 40-message cap rejects it. What would you do instead?" *(Known gap; I want to see him reach for summarisation rather than a bigger cap.)*
