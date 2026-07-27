# 09_NEXT_PHASE_MASTER_PROMPT.md — Master Execution Prompt & Architectural Roadmap

**Target Candidate:** Sebastian Marin — Systems Engineer & Full-Stack Developer  
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)  
**Live Target:** `https://dev-portfolio-lilac-chi.vercel.app`  

---

## 1. Master Handover Prompt for Next Agent

Copy and paste this prompt when launching or handing over to a new agent:

```markdown
Please read `AGENT_HANDOVER_INSTRUCTIONS_V3.md`, `06_ENTERPRISE_UX_AND_AI_SPEC.md`, `08_MICRO_APPS_AND_CODEBLOCK_ERADICATION_SPEC.md`, and `AI_CHATBOT_ARCHITECTURE.md` in `dev-portfolio`.

YOUR MANDATE:
1. Preserve the **Zero Code Block Policy**: Maintain 100% live interactive micro-apps (Web Telemetry, REST API Explorer, User Mini-Map, Linux Terminal Console, Playwright Test Runner) with zero static syntax code blocks.
2. Maintain **Multi-Provider AI Copilot Architecture**: Server proxy supporting NVIDIA NIM, Google Gemini, and OpenAI with provider switching, animated gradient border glow, and Focused Mode (Desktop: Side-by-side Map + Chat; Mobile: Map top / Chat bottom) with function-calling map mutations.
3. Keep **De-duplicated Header Name Branding**: Candidate name "Sebastian Marin" is rendered exclusively in the Header with `Ingeniero de Sistemas | Full-Stack` badge and icon-focused hover-expanding nav.
4. Execute a complete **Round 4 Executive Review** using `portfolio_review_prompts/` (CEO, CTO, CFO, Community Manager, UI/UX, CTA/CRO). Write output files to `reviews/round-4/` and generate `reviews/round-4/REVIEW_SYNTHESIS.md`.
5. Verify all changes using `npx tsc --noEmit`, `npm run build`, and `npx playwright test`.
```

---

## 2. Executive Architecture Rules

- **Zero Static Code Blocks:** All static syntax code blocks (`CodeBlock`) are eradicated and replaced by working interactive micro-apps or visual architecture cards.
- **Header Branding:** Header displays **Sebastian Marin** (`font-extrabold text-white text-base sm:text-lg`) with subtitle badge (`Ingeniero de Sistemas | Full-Stack`).
- **Desktop Navbar:** Icons by default, smoothly expanding text labels on hover (`duration-300`).
- **GeoInsights AI Copilot Button:** Features animated rotating conic gradient border stroke with vibrant hover color splash and mobile pulse glow.
- **REST API Explorer:** Features 5 live endpoints (`/api/spatial`, `/api/php-sync`, `/api/geo-ip`, `/api/ai-copilot`, `/api/gemini-assistant`) with descriptive select dropdown.
- **User Mini-Map Locator:** Zoom `13.5` / `10.5` with interactive `[GPS]` location request button (`navigator.geolocation`).
- **Telemetry State:** Click counter and session timer persist globally across tab mounts.
- **Playwright Test Suite:** 39/39 tests passing 100% green.
