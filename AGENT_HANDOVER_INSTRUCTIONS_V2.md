# AGENT_HANDOVER_INSTRUCTIONS_V2.md — Complete Agent Handover, Review Context & Round 2 Review Protocol

**Project:** Sebastian Marin — Full-Stack Developer Portfolio & Engineering Console  
**Live Vercel Site:** `https://dev-portfolio-lilac-chi.vercel.app`  
**GitHub Repository:** `https://github.com/marinsebastian/dev-portfolio.git`  
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)  
**Target Audience:** CEO, CFO, CTO, Graphic Designer, Community Manager  
**Document Version:** 2.1.0 (Iterative Review Protocol & Round 2 Mandate)  

---

## 1. Context & Review Team Target Matrix

This portfolio is custom-engineered for **Sebastian Marin**, a Systems Engineer and Full-Stack Developer skilled in Next.js, React, TypeScript, PHP/cURL, MySQL/PostgreSQL, Leaflet/MapLibre GIS, Linux CLI, and Playwright QA.

### Review Team Persona Expectations
1. **CEO & CFO:** Look for business value, clear positioning, commercial e-commerce proof (Awtu Commerce with BCP QR payments), low-overhead tech stack, and controlled AI API costs.
2. **Graphic Designer & Community Manager:** Look for *Operational Data Console* visual elegance (`#0B0F17`), crisp monospace/sans typography, high contrast, smooth Framer Motion reveals, and bilingual shareability (`ES` default / `EN`).
3. **CTO:** Looks for clean Next.js 14 App Router architecture, TypeScript strict typing (`0 errors`), REST APIs (`/api/spatial`, `/api/php-sync`, `/api/gemini-assistant`), PHP 8 cURL sync handlers, secure Gemini API key proxies, MapLibre GL + PMTiles vector GIS engine, and automated Playwright E2E test suites.

---

## 2. Summary of Round 1 Executive Reviews (`reviews/round-1/`)

Round 1 reviews were conducted across 5 independent executive perspectives:

- **CEO Review ([`01_CEO_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/01_CEO_REVIEW_RESULT.md)):** *Verdict: INTERESTING CANDIDATE — Forward to CTO.* Highlights clear value proposition, executive hero card, and honest experience grounding.
- **CTO Review ([`02_CTO_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/02_CTO_REVIEW_RESULT.md)):** *Verdict: STRONG TECHNICAL SIGNAL.* Verified 0 TypeScript errors, static Next.js prerendering, REST APIs, SQL logic, PHP cURL sync handlers, and 100% Playwright test suite passing.
- **CFO Review ([`03_CFO_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/03_CFO_REVIEW_RESULT.md)):** *Verdict: YES — Approve Interview Time.* Praised practical operational tools (Awtu Commerce, BCP QR payments, UMSS IT automation) and controlled AI token costs via server-side proxies.
- **Community Manager Review ([`04_COMMUNITY_MANAGER_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/04_COMMUNITY_MANAGER_REVIEW_RESULT.md)):** *Verdict: STRONG BRAND SIGNAL.* Highlighted Spanish default with instant English header toggle (`ES | EN`), natural human copy, and internal shareability.
- **UI/UX Portfolio Expert Review ([`05_UI_UX_PORTFOLIO_EXPERT_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/05_UI_UX_PORTFOLIO_EXPERT_REVIEW_RESULT.md)):** *Verdict: SHIP.* Praised *Operational Data Console* visual identity (`#0B0F17`), high-contrast typography, GPU-accelerated reveals, and zero horizontal overflow on mobile (360px–1920px).
- **Master Synthesis ([`REVIEW_SYNTHESIS.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/REVIEW_SYNTHESIS.md)):** Synthesized findings, confirmed Geolabs requirement coverage, and established top 10 prioritized fixes.

---

## 3. Dataset & GIS Architecture Notes

### ⚠️ Mauricio Foronda's Dataset Scope Context
- **Original `atlasurbano` Scope:** Mauricio Foronda's original `atlasurbano` dataset focused primarily on **Santa Cruz (SCZ)** urban city blocks (*manzanos*).
- **Our Multi-Scope Extension:** Our platform extends departmental coverage for all 9 departments across Bolivia in the national view while streaming real INE vector block polygons for **Santa Cruz**, **Cochabamba**, and **La Paz / El Alto**.

### 🔑 Minified PMTiles Attribute Mapping
Mauricio Foronda's vector file (`https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles`) minifies attribute property names to 2-letter codes to optimize tile compression:

```typescript
export const ATLAS_FIELDS = {
  personas: 'a1',                // Total population (0.0 to 1.0)
  personas_por_hectarea: 'b1',   // Population density (0.0 to 1.0)
  dependencia_economica: 'c1',   // Economic dependency (0.0 to 1.0)
  porcentaje_menor20: 'd1',      // Youth population < 20 (0.0 to 1.0)
  porcentaje_60omas: 'e1',       // Senior population > 60 (0.0 to 1.0)
  educacion_superior: 'g1',      // Higher education rate (0.0 to 1.0)
  agua_caneria: 'r1',            // Piped water coverage (0.0 to 1.0)
  alcantarillado: 's1',          // Sewage coverage (0.0 to 1.0)
  tics_internet: 'v1',           // Residential Internet / Fiber (0.0 to 1.0)
};
```
*Note:* MapLibre GL paint property expressions MUST evaluate `['get', 'b1']`, `['get', 'v1']`, etc. instead of raw string names, otherwise blocks render in fallback slate gray.

### 🌐 HTTP 206 Partial Content Explanation
- PMTiles is a single binary archive file.
- The MapLibre GL renderer sends HTTP **Byte-Range Requests** (`Range: bytes=...`) to stream tile byte slices on demand as the user pans and zooms.
- HTTP **Status 206 Partial Content** is standard and expected behavior for byte-range tile streaming.

### 🛠️ MapLibre GL CSP Web Worker
To prevent Next.js / Turbopack from serving `index.html` as a Web Worker (which causes a `text/html` disallowed MIME error), MapLibre GL worker URL must be explicitly set:
```typescript
if (typeof window !== 'undefined') {
  (maplibregl as any).setWorkerUrl?.('https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl-csp-worker.js');
}
```

---

## 4. Instructions for Incoming Agent: Execute Round 2 Portfolio Reviews

Any agent taking over this project MUST execute **Round 2 Portfolio Reviews** using the prompts in `portfolio_review_prompts/`:

```
                  ┌──────────────────────────────────────────┐
                  │ 1. Read Master Prompts                   │
                  │    (portfolio_review_prompts/*.md)       │
                  └──────────────────┬───────────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────────┐
                  │ 2. Conduct Round 2 Evaluations           │
                  │    (Write reviews/round-2/01_CEO..05_UX)  │
                  └──────────────────┬───────────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────────┐
                  │ 3. Create Round 2 REVIEW_SYNTHESIS.md    │
                  │    (Rank new top 10 fixes)               │
                  └──────────────────┬───────────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────────┐
                  │ 4. Implement Code Improvements           │
                  │    (components/ data/ app/)              │
                  └──────────────────┬───────────────────────┘
                                     │
                                     ▼
                  ┌──────────────────────────────────────────┐
                  │ 5. Run Empirical Verification            │
                  │    (npx tsc, npm run build, playwright)  │
                  └──────────────────────────────────────────┘
```

### Protocol Details:
1. **Create Output Directory:** Initialize `reviews/round-2/`.
2. **Execute 5-Perspective Review:** Evaluate the current codebase against each prompt:
   - `01_CEO_REVIEW.md` → `reviews/round-2/01_CEO_REVIEW_RESULT.md`
   - `02_CTO_REVIEW.md` → `reviews/round-2/02_CTO_REVIEW_RESULT.md`
   - `03_CFO_REVIEW.md` → `reviews/round-2/03_CFO_REVIEW_RESULT.md`
   - `04_COMMUNITY_MANAGER_REVIEW.md` → `reviews/round-2/04_COMMUNITY_MANAGER_REVIEW_RESULT.md`
   - `05_UI_UX_PORTFOLIO_EXPERT_REVIEW.md` → `reviews/round-2/05_UI_UX_PORTFOLIO_EXPERT_REVIEW_RESULT.md`
3. **Synthesize & Rank Fixes:** Write `reviews/round-2/REVIEW_SYNTHESIS.md` with:
   - Overall Verdict (*SHIP / SENDABLE AFTER FIXES / DO NOT SEND*)
   - Consolidated Reviewer Findings & Blockers
   - Geolabs Requirement Coverage Table
   - Ranked Top 10 Fixes table (Rank, Task, Rationale, Branch, Impact, Difficulty).
4. **Apply Code Edits:** Implement the top-ranked fixes across components, styling, and data files.
5. **Verify Empirically:** Run `npx tsc --noEmit`, `npm run build`, and `npx playwright test` before declaring completion.

---

## 5. Verification Commands

Run these three commands to verify project health:

```bash
# 1. Strict TypeScript type check
npx tsc --noEmit

# 2. Next.js production static build check
npm run build

# 3. Playwright automated end-to-end smoke tests
npx playwright test
```

---

## 6. Short Prompt Template for Future Agent Handovers

Copy and paste the following prompt block to direct any incoming agent:

> **Copy & Paste Handover Prompt for Next Agent:**
> ```markdown
> Please read `AGENT_HANDOVER_INSTRUCTIONS_V2.md` and review the previous Round 1 synthesis in `reviews/round-1/REVIEW_SYNTHESIS.md` for context.
> 
> YOUR MANDATE:
> 1. Conduct a complete **Round 2 Executive Review** of this portfolio using the master prompt files in `portfolio_review_prompts/`:
>    - `portfolio_review_prompts/01_CEO_REVIEW.md` → Write `reviews/round-2/01_CEO_REVIEW_RESULT.md`
>    - `portfolio_review_prompts/02_CTO_REVIEW.md` → Write `reviews/round-2/02_CTO_REVIEW_RESULT.md`
>    - `portfolio_review_prompts/03_CFO_REVIEW.md` → Write `reviews/round-2/03_CFO_REVIEW_RESULT.md`
>    - `portfolio_review_prompts/04_COMMUNITY_MANAGER_REVIEW.md` → Write `reviews/round-2/04_COMMUNITY_MANAGER_REVIEW_RESULT.md`
>    - `portfolio_review_prompts/05_UI_UX_PORTFOLIO_EXPERT_REVIEW.md` → Write `reviews/round-2/05_UI_UX_PORTFOLIO_EXPERT_REVIEW_RESULT.md`
> 2. Generate `reviews/round-2/REVIEW_SYNTHESIS.md` containing the overall verdict, consolidated blockers, Geolabs requirement coverage table, and ranked top 10 fixes.
> 3. Implement the top-ranked code improvements across the codebase.
> 4. Verify all edits using `npx tsc --noEmit`, `npm run build`, and `npx playwright test` before completing your turn.
> ```
