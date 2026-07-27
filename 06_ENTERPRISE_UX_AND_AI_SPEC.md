# 06_ENTERPRISE_UX_AND_AI_SPEC.md — Master Technical & UX Architecture

**Target Candidate:** Sebastian Marin — Systems Engineer & Full-Stack Developer  
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)  
**Design Philosophy:** *Operational Enterprise Data Console* — Premium dark slate aesthetic (`#0B0F17`), liquid glass modals, interactive micro-apps, Multi-Provider AI Map Copilot with function calling, zero static code clutter.

---

## 1. Executive Summary & Core Architectural Upgrades

| Module / Component | Former Implementation | Upgraded Enterprise Implementation |
| :--- | :--- | :--- |
| **Map Clean-up & Attribution** | Watermarks, repetitive `@mauforonda` mentions, standard Leaflet controls. | Clean MapLibre GL canvas, zero watermark clutter, sleek bottom-overlay controls, discrete dataset attribution. |
| **Block Selection Highlight** | Static tile boundary. | Glowing teal/cyan stroke (`#14b8a6`, line-width 3.5, 0.9 opacity) on selected INE block (*manzano*). |
| **Multi-Provider AI Copilot** | Single Gemini API call. | **Multi-LLM Streaming AI Copilot (NVIDIA, Gemini, OpenAI):**<br>- Based on [`AI_CHATBOT_ARCHITECTURE.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/AI_CHATBOT_ARCHITECTURE.md).<br>- **Provider Selector:** `[NVIDIA NIM]` `[Google Gemini]` `[OpenAI]`.<br>- **Animated Gradient Border:** Triggers **Focused Mode** (Desktop: Side-by-side Map + Chat; Mobile: 50% Map Top / 50% Chat Bottom).<br>- **Function Calling:** Chatbot mutates map state (changes layers, metric colors, zooms to user location/department).<br>- **Dynamic Action Chips:** Suggested queries (`[Analizar mi zona]`, `[Ver áreas con fibra > 80%]`). |
| **User Geolocation & Privacy** | Fixed department center coordinates. | **Liquid Glass Geolocation Modal:**<br>- Requests browser/IP location to center map on user's department/neighborhood.<br>- Subtle discardable map banner.<br>- Privacy & cookie consent logger (`localStorage` state). |
| **"Lo Que Construyo" Capability Pillars** | Static syntax code blocks. | **Live Working Micro-Apps (No Code Blocks!):**<br>1. *Web Interfaces:* Real-time website telemetry dashboard (live visitor ticker, latency, click counter).<br>2. *APIs & Backend:* Interactive REST API Tester for `/api/spatial` and `/api/php-sync`.<br>3. *Spatial Systems:* Mini-map auto-focused on user's inferred department.<br>4. *Linux & CLI:* Interactive terminal simulating `cron` sync execution and Docker status. |
| **GeoInsights Bolivia Map** | Categorized layer pills. | **Categorized Dropdown Selector:**<br>- Demografía y Densidad (`b1`, `a1`)<br>- Conectividad y TICs (`v1`, `g1`)<br>- Vivienda y Servicios (`r1`, `s1`)<br>- Nodos Económicos (`c1`)<br>- Metric system units in Spanish (`hab/ha`). |
| **Voronoi Spatial Lab** | Infinite canvas points. | Constrained urban population hubs with interactive service radius coverage calculator. |
| **Engineering & QA Section** | Static Playwright code snippet. | **Interactive Playwright Test Runner:** Simulated live browser/CLI execution with real-time pass/fail status updates. |
| **Contact Phone Security** | Plain text phone number. | **Anti-Crawler Protected Phone CTA:** Obfuscated phone number revealed on-demand via click or scroll engagement. |

---

## 2. Multi-Provider AI Map Copilot Specifications (`AI_CHATBOT_ARCHITECTURE.md`)

Refer to [`AI_CHATBOT_ARCHITECTURE.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/AI_CHATBOT_ARCHITECTURE.md) for full server-side proxy architecture and streaming SSE implementation.

### 2.1 Supported AI Providers & Models
- **NVIDIA NIM:** `z-ai/glm-5.2`, `meta/llama-3.3-70b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct` (`https://integrate.api.nvidia.com/v1`).
- **Google Gemini:** `gemini-3.1-flash-lite`, `gemini-2.0-flash` (`https://generativelanguage.googleapis.com/v1beta/openai`).
- **OpenAI:** `gpt-4o-mini`, `gpt-4o` (`https://api.openai.com/v1`).

### 2.2 Visual Styling & Provider Switcher
- **Button Design:** Sleek rounded glass button with an animated gradient border (`conic-gradient` rotating teal, cyan, and indigo glow).
- **Provider Selector:** Client pill dropdown allowing the user to select `[NVIDIA NIM]`, `[Gemini]`, or `[OpenAI]`.
- **Badge:** Displays active provider badge (`X-AI-Provider` and `X-AI-Model`) on streamed chat responses.

### 2.3 Focused Mode Layout Architecture
- **Desktop Viewport (≥ 1024px):** Split 50/50 2-column layout.
  - *Left Column (50%):* Full-height MapLibre GL map canvas.
  - *Right Column (50%):* Interactive Chatbot Console with message history, provider selector, and quick suggestion chips.
- **Mobile Viewport (< 1024px):** Stacked 50/50 vertical layout.
  - *Top Half (50% vh):* Sticky MapLibre GL map canvas.
  - *Bottom Half (50% vh):* Scrollable Chatbot drawer with fixed input field.

### 2.4 AI Chatbot Function Calling Capabilities
The AI Copilot interprets natural language and returns structured action commands to mutate the map:
1. `setLayer(layerCode)` — Switches map metric layer (e.g. `TECH_CONN`, `DENSITY`).
2. `flyToLocation(lat, lng, zoom)` — Zooms map to user's neighborhood, department, or city block.
3. `setMetricThreshold(minVal, maxVal)` — Filters blocks matching user criteria.
4. `summarizeBlockData(blockProps)` — Provides executive narrative breakdown in Spanish.

---

## 3. Liquid Glass Geolocation & Privacy Consent Modal

### 3.1 Modal Behavior & Visual Design
- **Visual Style:** `backdrop-blur-xl bg-slate-900/80 border border-slate-700/60 rounded-2xl shadow-[0_0_50px_rgba(20,184,166,0.15)]`.
- **Trigger:** Displays on first visit or when clicking **"Usar Mi Ubicación"**.
- **Explanation Copy:** *"Solicitamos acceso a tu ubicación únicamente para centrar el visor del Censo 2024 en tu departamento y barrio actual. No almacenamos datos personales en servidores externos."*
- **Actions:** `[Permitir Ubicación]` and `[Continuar con Selección Manual]`.
- **IP Fallback:** If browser permission is denied, fallback to IP geolocation API (`ipapi.co` / `ip-api.com`) to infer candidate department (e.g. *Cochabamba* or *Santa Cruz*).

---

## 4. Capability Pillars: Live Micro-Apps Architecture

### 4.1 Pillar 1: Web Interfaces (Real-Time Website Telemetry)
- **Interactive Component:** `WebTelemetryDashboard.client.tsx`
- **Features:** Live visitor counter (simulated/Vercel Analytics), active session timer, API request latency ticker (ms), memory footprint graph using Recharts.

### 4.2 Pillar 2: APIs & Backend (Interactive REST API Tester)
- **Interactive Component:** `ApiExplorer.client.tsx`
- **Features:** Dropdown endpoint selector (`/api/spatial`, `/api/php-sync`, `/api/gemini-assistant`), parameter inputs, **[Send Request]** button, and JSON response tree view.

### 4.3 Pillar 3: Sistemas Espaciales (User-Centered Mini Map)
- **Interactive Component:** `UserSpatialMiniMap.client.tsx`
- **Features:** Mini MapLibre map automatically centered on the user's inferred department, showing how IP/GPS location was derived.

### 4.4 Pillar 4: Linux CLI & Automatización (Terminal Console)
- **Interactive Component:** `LinuxTerminalConsole.client.tsx`
- **Features:** Simulated Linux terminal displaying `crontab -l`, execution logs of `cron_sync.php`, and `docker ps` container health indicators.

---

## 5. Engineering QA: Interactive Playwright Test Runner

- **Component:** `PlaywrightTestRunner.client.tsx`
- **User Experience:**
  - Interactive GUI panel with a **[Run E2E Smoke Tests]** button.
  - Renders a split view: Simulated browser viewport on the left and terminal test log on the right.
  - Step-by-step test execution animation (`✓ Hero section loaded`, `✓ i18n switcher verified`, `✓ MapLibre PMTiles stream loaded`, `✓ PDF download link verified`).

---

## 6. Anti-Crawler Contact Phone Security

- **Security Strategy:** Phone number string is obfuscated in source code (`+591 7XXXXXXX` rendered via character code array).
- **UI Interaction:** Renders a blurred glass pill labeled `[Ver Teléfono de Contacto]`.
- **Unveil Mechanism:** Reveals phone number upon explicit user click or after 15 seconds of active page engagement.
