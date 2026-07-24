# AGENT_HANDOVER_INSTRUCTIONS.md — Portfolio Project Handover & Roadmap

**Project:** Sebastian Marin — Full-Stack Developer Portfolio & Engineering Console  
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)  
**Target Review Team:** CEO, CFO, CTO, Graphic Designer, Community Manager  
**Document Version:** 1.0.0  

---

## 1. Context & Executive Target Audience

This portfolio is built for **Sebastian Marin**, a Systems Engineer and Full-Stack Developer (Next.js, TypeScript, PHP/cURL, MySQL/PostgreSQL, Leaflet GIS, Linux CLI, Playwright QA).

### The Review Team Dynamic
The review team at Geolabs Cloud is composed of both executive and technical leadership:
* **CEO & CFO:** Look for clear value proposition, professional credibility, fast page load, and simple navigation.
* **Graphic Designer & Community Manager:** Look for visual elegance, crisp typography, high contrast, smooth transitions, and zero layout clutter.
* **CTO:** Looks for clean code, working API integrations, spatial/GIS maps, SQL knowledge, and automated testing rigor.

---

## 2. Status of Implementation Phases

| Phase / Step | Status | Key Deliverables & Code |
| :--- | :--- | :--- |
| **Step 1: i18n Language Switcher** | ✅ **COMPLETED** | Created `context/LanguageContext.tsx` and `data/translations.ts`. **Spanish (`ES`) is the default language**, with a one-click header pill toggle to `EN`. |
| **Step 2: Executive Visual Redesign** | ✅ **COMPLETED** | Redesigned `components/sections/HeroSection.tsx` and header bar. Removed dense code clutter; replaced hero panel with a sleek **Executive Product Overview Card**. |
| **Step 3: Mau Foronda Bolivian Map** | 📐 **SPECIFIED & READY** | Complete architecture spec written in `05_STEP3_MAU_FORONDA_MAP_SPEC.md`. Draws inspiration from Mauricio Foronda's (`@mauforonda`) Censo 2024 and urban GIS datasets. |
| **Step 4: English CV Integration** | 📝 **USER RESPONSIBILITY** | Reserved for human user. The user will prepare an English copy of the LaTeX CV to pair with the existing Spanish PDF (`/CV Sebastian Marin.pdf`). |

---

## 3. Key Codebase Files & Structure

```
dev-portfolio/
├── context/
│   └── LanguageContext.tsx        # Global language state (ES default / EN toggle)
├── data/
│   ├── translations.ts            # Spanish & English dictionaries for all site sections
│   ├── portfolioData.ts           # Case studies, capabilities, stack matrix
│   ├── boliviaGeoJson.ts          # Departmental GeoJSON coordinates & metrics
│   └── cvData.ts                  # Structured resume data matching CV PDF
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # Navbar with ES/EN language pill toggle & CV download
│   │   └── Footer.tsx             # Console footer
│   ├── sections/
│   │   ├── HeroSection.tsx        # Redesigned executive hero with bilingual support
│   │   ├── FlagshipGeoSection.tsx # Flagship map dashboard section
│   │   ├── CaseStudiesSection.tsx # Awtu Commerce, Room Reservation, PHP Sync, Voronoi Lab
│   │   ├── InteractiveCVSection.tsx # Tabbed resume viewer + PDF preview modal
│   │   └── ContactSection.tsx     # Direct contact form
│   └── map/
│       ├── MapWidget.client.tsx   # Client-side Leaflet map component
│       └── VoronoiLab.client.tsx  # Client-side Voronoi spatial lab
├── 05_STEP3_MAU_FORONDA_MAP_SPEC.md # Step 3 detailed map implementation plan
└── AGENT_HANDOVER_INSTRUCTIONS.md   # This handover document
```

---

## 4. Instructions for Executing Step 3 (Bolivian Map Explorer Upgrade)

When implementing Step 3:
1. Refer to the specification in [`05_STEP3_MAU_FORONDA_MAP_SPEC.md`](file:///C:/Users/marin/Documents/Programming/dev-portfolio/05_STEP3_MAU_FORONDA_MAP_SPEC.md).
2. Create `data/mauForondaCensusData.ts` with urban census zones for **Santa Cruz, Cochabamba, La Paz, and National Bolivia**.
3. Incorporate Censo 2024 metric layers: **Densidad Poblacional**, **Conectividad Digital**, **Servicios Básicos**, and **Nodos Económicos**.
4. Update `components/map/MapWidget.client.tsx` to support the multi-level scope switcher and metric layer toggles.
5. Verify that all strings use `t('flagship.key')` from `LanguageContext`.

---

## 5. Verification Commands

To verify the project status at any point, run:

```bash
# 1. Type checking
npx tsc --noEmit

# 2. Production build
npm run build

# 3. Playwright E2E smoke tests
npx playwright test
```
