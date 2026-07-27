# 08_MICRO_APPS_AND_CODEBLOCK_ERADICATION_SPEC.md — Micro-Apps Persistence, API Selection & Complete CodeBlock Eradication

**Target Candidate:** Sebastian Marin — Systems Engineer & Full-Stack Developer  
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)  
**Design Philosophy:** Zero Static Code Blocks, Persistent Micro-App State, Multi-Endpoint REST Selection, and Higher-Zoom Locator Maps.

---

## 1. Executive Summary of Improvements

| Module / Component | Previous Implementation | Upgraded Implementation |
| :--- | :--- | :--- |
| **Static Code Block Eradication** | Static `<CodeBlock>` elements in `CaseStudiesSection.tsx`, `FlagshipGeoSection.tsx`, and `WorkflowQASection.tsx`. | **100% Eradicated:** Removed all static syntax code blocks. Replaced with live visual architecture cards, interactive AI tool schemas, and Playwright test runners. |
| **Hero Title De-duplication** | Candidate name repeated between Header and Hero section. | Completely removed "Sebastian Marin" from Hero text. Name lives exclusively in the Header! |
| **Tech Stack Badges** | Flex-wrapped stack badges splitting awkwardly after 3 items. | Grid row (`grid-cols-2 sm:grid-cols-4`) displaying all 4 badges (`Next.js`, `PHP 8`, `MapLibre GIS`, `Linux CLI`) in one clean row. |
| **RESUMEN PROFESIONAL Header** | Included `"Disponible para Entrevistas"` badge. | Removed status badge to allow `"RESUMEN PROFESIONAL"` title to expand cleanly across card header. |
| **API Explorer Micro-App** | 3 endpoints without descriptive selection labels. | Expanded to **5 Live Endpoints** (`/api/spatial`, `/api/php-sync`, `/api/geo-ip`, `/api/ai-copilot`, `/api/gemini-assistant`) with descriptive select dropdown. |
| **User Mini-Map Locator** | Coarse zoom (zoom 12/9). | Increased default zoom (zoom 13.5/10.5) and added interactive **`[GPS]` location request button** (`navigator.geolocation`). |
| **Web Telemetry Micro-App** | Telemetry counters reset when switching tabs. | **Global State Sync:** Telemetry click counter and session seconds persist globally across tab mounts. |

---

## 2. Technical Verification

- **`npx tsc --noEmit`:** Passed cleanly (`0 errors`).
- **`npm run build`:** Production static prerendering succeeded across 10/10 routes in 5.3s.
- **`npx playwright test`:** **39/39 Playwright tests passed (100% green)**.
