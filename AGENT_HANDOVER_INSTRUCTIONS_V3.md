# AGENT_HANDOVER_INSTRUCTIONS_V3.md — Master Handover, Multi-Provider AI & Enterprise UX Blueprint

**Project:** Sebastian Marin — Full-Stack Developer Portfolio & Engineering Console  
**Live Vercel Site:** `https://dev-portfolio-lilac-chi.vercel.app`  
**GitHub Repository:** `https://github.com/marinsebastian/dev-portfolio.git`  
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)  
**Target Audience:** CEO, CFO, CTO, Graphic Designer, Community Manager  
**Document Version:** 3.1.0 (Multi-LLM AI Copilot, Liquid Glass Geolocation & Live Micro-Apps)  

---

## 1. Executive Context & Evaluation Persona Matrix

This portfolio is custom-engineered for **Sebastian Marin**, a Systems Engineer and Full-Stack Developer skilled in Next.js, React, TypeScript, PHP/cURL, MySQL/PostgreSQL, Leaflet/MapLibre GIS, Linux CLI, and Playwright QA.

### Review Team Expectations
1. **CEO & CFO:** Look for business ROI, clear value proposition, commercial proof (Awtu Commerce with QR payment reconciliation), low-overhead open-source stack, and controlled AI API token costs across multiple LLM providers.
2. **Graphic Designer & Community Manager:** Look for *Operational Data Console* visual elegance (`#0B0F17`), liquid glass modals, animated border glows, crisp monospace/sans typography, and bilingual shareability (`ES` default / `EN`).
3. **CTO:** Looks for clean Next.js 14 App Router architecture, TypeScript strict typing (`0 errors`), REST APIs (`/api/spatial`, `/api/php-sync`, `/api/gemini-assistant`), MapLibre GL + PMTiles vector GIS engine, multi-provider LLM integration (NVIDIA NIM, Gemini, OpenAI), interactive micro-apps (no static code blocks!), and automated Playwright QA runners.

---

## 2. Multi-Provider Streaming AI Architecture (`AI_CHATBOT_ARCHITECTURE.md`)

Refer to [`AI_CHATBOT_ARCHITECTURE.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/AI_CHATBOT_ARCHITECTURE.md) for full server-side proxy implementation details.

### Core Multi-Model Design Highlights
- **Interchangeable Providers:** Supports **NVIDIA NIM** (`z-ai/glm-5.2`, `meta/llama-3.3-70b-instruct`), **Google Gemini** (`gemini-3.1-flash-lite`, `gemini-2.0-flash`), and **OpenAI** (`gpt-4o-mini`, `gpt-4o`).
- **OpenAI-Compatible `/chat/completions` Abstraction:** One unified server adapter handles streaming SSE and function calling across all three providers with zero client-visible API keys.
- **Thought Signature Handling:** Manages Gemini-specific `thought_signature` echo requirements to prevent `400 INVALID_ARGUMENT` errors.
- **Provider Selector Badge:** Displays active provider and model badge (`X-AI-Provider` / `X-AI-Model`) on chat responses.

---

## 3. Comprehensive Upgrade Roadmap & Architecture

### Module 1: Map Clean-up & Selected Block Highlight
- **Clean Map Canvas:** Removed standard Leaflet/MapLibre watermarks (`i` logo, attribution overlays). Discrete text links provided in bottom section info cards.
- **Selected Block Highlight:** Selected INE block (*manzano*) renders a distinct glowing teal/cyan stroke (`#14b8a6`, line-width 3.5, 0.9 opacity).
- **Attribute Key Mapping:** Maps minified PMTiles vector attributes (`b1` density, `v1` internet, `r1` basic services, `a1` population, `g1` education).

### Module 2: Multi-LLM AI Map Copilot & Focused Mode
- **Google-Like Gradient Border:** Trigger button features an animated rotating conic gradient border glow.
- **Provider Selector:** Allows switching between `[NVIDIA NIM]`, `[Google Gemini]`, and `[OpenAI]`.
- **Focused Mode Architecture:**
  - *Desktop (≥ 1024px):* Side-by-side 50/50 Map & AI Chatbot.
  - *Mobile (< 1024px):* 50% vh Map Top / 50% vh AI Chatbot Drawer Bottom.
- **Map Mutation Function Calling:** The AI Copilot can answer questions AND actively mutate map state (`setLayer`, `flyToLocation`, `filterThresholds`).
- **Dynamic Suggestion Chips:** Enticing action bubbles (`[Analizar mi barrio]`, `[Ver áreas con fibra > 80%]`, `[Cambiar a Densidad Poblacional]`).

### Module 3: Liquid Glass Geolocation & Privacy Consent Modal
- **Liquid Glass Modal:** Renders `backdrop-blur-xl bg-slate-900/80 border border-slate-700/60 rounded-2xl` explaining location requests to center census data on the user's neighborhood.
- **IP Location Fallback:** Uses IP geolocation (`ipapi.co` / `ip-api.com`) to infer candidate department (e.g. *Cochabamba* or *Santa Cruz*).
- **Privacy Consent Logger:** Persists consent preferences in `localStorage`.

### Module 4: "Lo Que Construyo" Capability Pillars — Live Micro-Apps (No Static Code!)
- **Pillar 1 (Web Interfaces):** Real-time Website Telemetry Dashboard (live visitor ticker, response latency, active region).
- **Pillar 2 (APIs & Backend):** Interactive REST API Tester for `/api/spatial` and `/api/php-sync`.
- **Pillar 3 (Sistemas Espaciales):** Live mini-map auto-focused on user's inferred department with location derivation explanation.
- **Pillar 4 (Linux & Automatización):** Interactive Linux Terminal Console simulating `cron_sync.php` execution and Docker status.

### Module 5: Case Studies & Voronoi Spatial Lab
- **Categorized Census Layer Dropdown:** Grouped select dropdown (*Demografía & Densidad*, *Conectividad & TICs*, *Vivienda & Servicios*, *Perfil Económico*).
- **Metric System Units:** Spanish metric units (`hab/ha` or `hab/km²`).
- **Voronoi Spatial Lab:** Constrained urban population boundaries with interactive service coverage radius calculator.

### Module 6: Engineering Habits & QA Runner
- **Interactive Playwright Runner:** GUI/CLI runner displaying simulated step-by-step test execution (`✓ Hero loaded`, `✓ i18n switcher verified`, `✓ MapLibre PMTiles loaded`).
- **PHP Cron & Docker Simulation:** Terminal log animation for cron background execution and container health.

### Module 7: Contact Section Phone Protection
- **Anti-Crawler Phone Obfuscation:** Phone string protected against web scrapers, revealed on-demand via user click or scroll engagement delay.

---

## 4. Summary of Round 1 Executive Reviews (`reviews/round-1/`)

- **CEO Review ([`01_CEO_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/01_CEO_REVIEW_RESULT.md)):** *Verdict: INTERESTING CANDIDATE — Forward to CTO.*
- **CTO Review ([`02_CTO_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/02_CTO_REVIEW_RESULT.md)):** *Verdict: STRONG TECHNICAL SIGNAL.*
- **CFO Review ([`03_CFO_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/03_CFO_REVIEW_RESULT.md)):** *Verdict: YES — Approve Interview Time.*
- **Community Manager Review ([`04_COMMUNITY_MANAGER_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/04_COMMUNITY_MANAGER_REVIEW_RESULT.md)):** *Verdict: STRONG BRAND SIGNAL.*
- **UI/UX Portfolio Expert Review ([`05_UI_UX_PORTFOLIO_EXPERT_REVIEW_RESULT.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/05_UI_UX_PORTFOLIO_EXPERT_REVIEW_RESULT.md)):** *Verdict: SHIP.*
- **Master Synthesis ([`REVIEW_SYNTHESIS.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/reviews/round-1/REVIEW_SYNTHESIS.md)):** Consolidated findings and ranked top 10 fixes.

---

## 5. Round 2 Review Execution Protocol for Incoming Agent

Any agent taking over this project MUST execute **Round 2 Portfolio Reviews** using the prompts in `portfolio_review_prompts/`:

1. **Create Output Directory:** Initialize `reviews/round-2/`.
2. **Execute 5-Perspective Review:** Evaluate the codebase against each prompt:
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
4. **Apply Code Edits:** Implement top-ranked fixes across components, styling, and data files.
5. **Verify Empirically:** Run `npx tsc --noEmit`, `npm run build`, and `npx playwright test`.

---

## 6. Verification Commands

```bash
# 1. Strict TypeScript type check
npx tsc --noEmit

# 2. Next.js production static build check
npm run build

# 3. Playwright automated end-to-end smoke tests
npx playwright test
```

---

## 7. Short Prompt Template for Future Agent Handovers

Copy and paste the following prompt block to direct any incoming agent:

> **Copy & Paste Handover Prompt for Next Agent:**
> ```markdown
> Please read `AGENT_HANDOVER_INSTRUCTIONS_V3.md`, `06_ENTERPRISE_UX_AND_AI_SPEC.md`, and `AI_CHATBOT_ARCHITECTURE.md` in the root of `dev-portfolio`.
> 
> YOUR MANDATE:
> 1. Implement the Multi-LLM AI Copilot & Enterprise UX enhancements detailed in `AGENT_HANDOVER_INSTRUCTIONS_V3.md` and `AI_CHATBOT_ARCHITECTURE.md`:
>    - **Multi-Provider AI Copilot (NVIDIA NIM, Gemini, OpenAI):** Server proxy with provider selector (`[NVIDIA NIM]`, `[Gemini]`, `[OpenAI]`), animated rotating gradient border, and Focused Mode (Desktop: Side-by-side Map + Chat; Mobile: Map top / Chat bottom) with function calling map mutations and dynamic suggestion chips (`[Analizar mi barrio]`, `[Ver fibra > 80%]`).
>    - **Liquid Glass Geolocation Modal:** Requests location permission with IP fallback to center maps on user's department.
>    - **Live Capability Micro-Apps (No Static Code!):** Real-time web telemetry dashboard, REST API Tester (`/api/spatial`), user-centered mini-map, and interactive Linux CLI terminal console (`cron` & Docker logs).
>    - **Categorized Atlas Urbano Dropdown:** Demografía, Conectividad, Vivienda, Nodos Económicos in metric units (`hab/ha`).
>    - **Interactive Playwright Runner:** Live GUI/CLI runner demonstrating E2E smoke tests.
>    - **Anti-Crawler Phone Protection:** Obfuscated phone number revealed on-demand.
> 2. Conduct a complete **Round 2 Executive Review** using `portfolio_review_prompts/` (CEO, CTO, CFO, Community Manager, UI/UX). Write output files to `reviews/round-2/` and generate `reviews/round-2/REVIEW_SYNTHESIS.md`.
> 3. Verify all changes using `npx tsc --noEmit`, `npm run build`, and `npx playwright test`.
> ```
