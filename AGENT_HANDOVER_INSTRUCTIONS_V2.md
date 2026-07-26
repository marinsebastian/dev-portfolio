# AGENT_HANDOVER_INSTRUCTIONS_V2.md — Complete Agent Handover & Iterative Improvement Protocol

**Project:** Sebastian Marin — Full-Stack Developer Portfolio & Engineering Console  
**Live Vercel Site:** `https://dev-portfolio-lilac-chi.vercel.app`  
**GitHub Repository:** `https://github.com/marinsebastian/dev-portfolio.git`  
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)  
**Target Audience:** CEO, CFO, CTO, Graphic Designer, Community Manager  
**Document Version:** 2.0.0 (Post-Step 3 PMTiles & Review Synthesis Implementation)  

---

## 1. Executive Context & Target Organization

This portfolio is custom-engineered for **Sebastian Marin**, a Systems Engineer and Full-Stack Developer skilled in Next.js, React, TypeScript, PHP/cURL, MySQL/PostgreSQL, Leaflet/MapLibre GIS, Linux CLI, and Playwright QA.

### The Geolabs Cloud Review Persona Matrix
1. **CEO & CFO:** Look for business value, clear positioning, commercial e-commerce proof (Awtu Commerce with BCP QR payments), low-overhead tech stack, and controlled AI API costs.
2. **Graphic Designer & Community Manager:** Look for *Operational Data Console* visual elegance (`#0B0F17`), crisp monospace/sans typography, high contrast, smooth Framer Motion reveals, and bilingual shareability (`ES` default / `EN`).
3. **CTO:** Looks for clean Next.js 14 App Router architecture, TypeScript strict typing (`0 errors`), REST APIs (`/api/spatial`, `/api/php-sync`, `/api/gemini-assistant`), PHP 8 cURL sync handlers, secure Gemini API key proxies, and automated Playwright E2E test suites.

---

## 2. Work Completed & Current Status

| Feature / Step | Status | Implementation Details |
| :--- | :---: | :--- |
| **Step 1: i18n Bilingual System** | ✅ **COMPLETED** | Created `context/LanguageContext.tsx` and `data/translations.ts`. **Spanish (`ES`) is default**, with header pill toggle to `EN`. |
| **Step 2: Executive Redesign** | ✅ **COMPLETED** | Redesigned `components/sections/HeroSection.tsx` with an Executive Product Overview Card displaying candidate credentials, commercial metrics, and quick CTAs. |
| **Step 3: Mau Foronda Urban Census Map** | ✅ **COMPLETED** | Built `components/map/RealBlockMapWidget.client.tsx` using **MapLibre GL + PMTiles vector tiles** streaming real-world INE census city blocks (*Manzanos Reales*). |
| **5-Reviewer Portfolio Review & Fixes** | ✅ **COMPLETED** | Executed 5 executive review evaluations (`reviews/round-1/`), generated synthesis report (`REVIEW_SYNTHESIS.md`), and applied code fixes. |
| **Automated Testing & Build** | ✅ **COMPLETED** | Passed Next.js production build (`npm run build` static prerender in 4.3s) and 5/5 Playwright E2E smoke tests (`npx playwright test`). |

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

## 4. Key Codebase Files

```
dev-portfolio/
├── context/
│   └── LanguageContext.tsx              # Global language state (ES default / EN toggle)
├── data/
│   ├── translations.ts                  # Bilingual dictionaries for all site sections
│   ├── mauForondaCensusData.ts          # Urban census metadata & scope configs
│   ├── portfolioData.ts                 # Case studies, capabilities, stack matrix
│   ├── boliviaGeoJson.ts                # Departmental GeoJSON coordinates
│   └── cvData.ts                        # Resume data matching CV PDF
├── components/
│   ├── layout/
│   │   ├── Header.tsx                   # Navbar with ES/EN switcher & CV modal trigger
│   │   └── Footer.tsx                   # Console footer
│   ├── sections/
│   │   ├── HeroSection.tsx              # Redesigned executive hero with bilingual support
│   │   ├── FlagshipGeoSection.tsx       # Flagship map section hosting RealBlockMapWidget
│   │   ├── CaseStudiesSection.tsx       # Awtu Commerce, Room Reservation, PHP Sync, Voronoi Lab
│   │   ├── InteractiveCVSection.tsx     # Tabbed resume viewer + PDF modal
      └── ContactSection.tsx           # Contact form
├── map/
│   ├── RealBlockMapWidget.client.tsx    # MapLibre GL + PMTiles vector tile map engine
│   └── VoronoiLab.client.tsx            # Client-side Voronoi spatial lab
├── portfolio_review_prompts/            # Master 5-reviewer evaluation prompts
│   ├── pro.md                           # Orchestration prompt
│   ├── 01_CEO_REVIEW.md                 # CEO review prompt
│   ├── 02_CTO_REVIEW.md                 # CTO review prompt
│   ├── 03_CFO_REVIEW.md                 # CFO review prompt
│   ├── 04_COMMUNITY_MANAGER_REVIEW.md   # Community Manager review prompt
│   └── 05_UI_UX_PORTFOLIO_EXPERT_REVIEW.md # UI/UX review prompt
├── reviews/round-1/                     # Round 1 review results & synthesis
│   ├── 01_CEO_REVIEW_RESULT.md
│   ├── 02_CTO_REVIEW_RESULT.md
│   ├── 03_CFO_REVIEW_RESULT.md
│   ├── 04_COMMUNITY_MANAGER_REVIEW_RESULT.md
│   ├── 05_UI_UX_PORTFOLIO_EXPERT_REVIEW_RESULT.md
│   └── REVIEW_SYNTHESIS.md              # Master synthesis & prioritized fix list
├── tests/
│   └── smoke.spec.ts                    # Playwright E2E smoke test suite (5 tests)
├── AGENT_HANDOVER_INSTRUCTIONS_V2.md    # This document
└── README.md
```

---

## 5. Iterative Review & Continuous Improvement Loop Protocol

To run a new evaluation and improvement round on the portfolio:

```
                  ┌──────────────────────────────┐
                  │ 1. Read Review Prompts       │
                  │    (portfolio_review_prompts)│
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ 2. Evaluate & Write Reports  │
                  │    (reviews/round-N/*.md)    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ 3. Generate REVIEW_SYNTHESIS │
                  │    (Rank top 10 fixes)       │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ 4. Implement Code Updates    │
                  │    (components/ data/ app/)  │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │ 5. Run Empirical QA          │
                  │    (tsc, build, playwright)  │
                  └──────────────────────────────┘
```

### Execution Steps:
1. **Load Prompt Templates:** Read `portfolio_review_prompts/01_CEO_REVIEW.md` through `05_UI_UX_PORTFOLIO_EXPERT_REVIEW.md`.
2. **Conduct Perspective Reviews:** Write review evaluation result files in `reviews/round-N/` following the required markdown table schemas.
3. **Synthesize Findings:** Create `reviews/round-N/REVIEW_SYNTHESIS.md` with:
   - Overall Verdict (*SHIP / SENDABLE AFTER FIXES / DO NOT SEND*)
   - Blockers & High-Impact Fixes
   - Geolabs Requirement Coverage Table
   - Ranked Top 10 Fixes table (Rank, Task, Rationale, Branch, Impact, Difficulty).
4. **Apply Code Edits:** Implement top-ranked fixes across components, styling, and data files.
5. **Verify Empirically:** Run `npx tsc --noEmit`, `npm run build`, and `npx playwright test` before declaring completion.

---

## 6. Verification Commands

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

## 7. Short Prompt for Handover to Future Agents

When directing a new AI agent to take over or iterate on this project, copy and paste the following prompt:

> **Copy & Paste Prompt for Next Agent:**
> ```markdown
> Please read `AGENT_HANDOVER_INSTRUCTIONS_V2.md` and review `reviews/round-1/REVIEW_SYNTHESIS.md` in the root of `dev-portfolio`. 
> 
> Continue developing and polishing the portfolio for Sebastian Marin applying to Geolabs Cloud.
> 
> Key Rules:
> 1. Preserve Spanish (`ES`) as default language with English (`EN`) header switcher.
> 2. Maintain MapLibre GL + PMTiles vector tile integration in `components/map/RealBlockMapWidget.client.tsx` using minified keys (`b1` for density, `v1` for internet, `r1` for services, `a1` for population, `g1` for education).
> 3. Verify all changes using `npx tsc --noEmit`, `npm run build`, and `npx playwright test` before finishing.
> ```
