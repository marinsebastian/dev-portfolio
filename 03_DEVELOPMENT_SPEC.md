# 03_DEVELOPMENT_SPEC.md — Technical Architecture & Frontend Specification

**Role:** Lead Frontend Architect & Systems Engineer  
**Project:** Sebastian Marin — Technical Engineering Portfolio  
**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Motion (Framer Motion), Leaflet, Lucide Icons, Playwright  
**Document Version:** 1.0.0  

---

## 1. Stack Architecture & Rationale

| Layer | Technology | Selection Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Hybrid SSR/SSG capabilities, fast page loads, automatic image/font optimization, route handlers for internal API proxies (e.g. Gemini API proxy, spatial endpoints). |
| **Language** | **TypeScript 5+** | Strict typing for data models (case studies, GeoJSON schemas, CV entries, API response types). |
| **Styling** | **Tailwind CSS 3.4+** | Utility-first architecture allowing precise, high-performance styling without heavy runtime CSS overhead. |
| **Motion** | **Framer Motion / Motion** | Industry standard declarative animation library for React, supporting GPU-accelerated spring dynamics, scroll cues, and reduced-motion fallbacks. |
| **Maps & GIS** | **Leaflet / React-Leaflet** | Lightweight, reliable interactive mapping library for rendering custom GeoJSON polygons, markers, and spatial layers without heavy WebGL overhead. |
| **Icons** | **Lucide React** | Consistent, lightweight SVG icon system matching the enterprise console theme. |
| **Testing** | **Playwright** | End-to-end browser testing for validating map interactions, responsive layouts, API response handling, and cross-browser smoke tests. |

---

## 2. Directory & Project File Structure

```
dev-portfolio/
├── app/
│   ├── layout.tsx                 # Root layout with fonts, providers & global scroll bar
│   ├── page.tsx                   # Main engineering console single-page application
│   ├── globals.css                # Global Tailwind directives & dark console tokens
│   ├── api/
│   │   ├── spatial/
│   │   │   └── route.ts           # GeoJSON API endpoint serving Bolivian spatial features
│   │   ├── php-sync/
│   │   │   └── route.ts           # Simulated PHP cURL sync API endpoint
│   │   └── gemini-assistant/
│   │       └── route.ts           # Gemini API proxy handler for interactive demo
│   └── cv/
│       └── route.ts               # Direct PDF handler for CV download
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # Navbar with status indicator & mobile menu drawer
│   │   ├── Footer.tsx             # Terminal footer with system metrics & direct links
│   │   └── ScrollProgress.tsx     # Top scroll progress bar
│   ├── sections/
│   │   ├── HeroSection.tsx        # Parallax hero & positioning telemetry
│   │   ├── ProofStrip.tsx         # Tech stack badge strip
│   │   ├── WhatIBuild.tsx         # 4 operational pillars
│   │   ├── FlagshipGeoSection.tsx # Interactive GeoInsights Bolivia map dashboard
│   │   ├── CaseStudiesSection.tsx # Awtu Commerce, Room Reservation, PHP Sync, Voronoi
│   │   ├── TechStackMatrix.tsx    # Interactive category filter stack list
│   │   ├── WorkflowQASection.tsx  # Code viewer for Playwright, Docker & Cron scripts
│   │   ├── InteractiveCVSection.tsx # Resume viewer tabbed UI + PDF download trigger
│   │   └── ContactSection.tsx     # Direct quick email & message form
│   ├── map/
│   │   ├── MapWidget.client.tsx   # Dynamic Leaflet map client component (no SSR)
│   │   └── VoronoiLab.client.tsx  # Client-side spatial Voronoi polygon tool
│   ├── ui/
│   │   ├── Badge.tsx              # Monospace tag / status badge
│   │   ├── Card.tsx               # Console card with hover border glow
│   │   ├── CodeBlock.tsx          # Syntax highlighted terminal code snippet view
│   │   ├── Button.tsx             # High-contrast action button
│   │   └── Modal.tsx              # Case study detail modal
│   └── motion/
│       ├── SectionReveal.tsx      # Reusable motion wrapper for scroll reveals
│       └── ParallaxWrapper.tsx    # Scroll transform wrapper
├── data/
│   ├── portfolioData.ts           # Case studies, capabilities, stack entries
│   ├── boliviaGeoJson.ts          # GeoJSON data for Bolivian departments & metrics
│   └── cvData.ts                  # Structured resume content matching CV PDF
├── lib/
│   ├── utils.ts                   # Class merge utilities (clsx/tailwind-merge)
│   └── geoUtils.ts                # Spatial calculation helpers (Voronoi, GeoJSON bounds)
├── public/
│   ├── CV Sebastian Marin.pdf     # Static PDF resume asset for download
│   ├── maps/                      # Static geojson fallback assets
│   └── images/                    # Project screenshots & architecture diagrams
├── tests/
│   ├── smoke.spec.ts              # Playwright smoke test for core navigation & sections
│   ├── map.spec.ts                # Playwright test for Leaflet map component rendering
│   └── responsive.spec.ts         # Playwright test verifying 360px-1920px viewports
├── tailwind.config.ts             # Custom color tokens & fonts
├── tsconfig.json                  # Strict TypeScript configuration
└── package.json                   # Dependencies & build scripts
```

---

## 3. Data Models & TypeScript Interfaces

```typescript
// Case Study Data Model
export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  category: 'flagship' | 'commercial' | 'operational' | 'backend' | 'spatial-lab';
  role: string;
  timeline: string;
  summary: string;
  problem: string;
  solution: string;
  proofPoints: string[];
  techStack: string[];
  geolabsRelevance: string;
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  metrics?: { label: string; value: string }[];
  liveDemoUrl?: string;
  githubUrl?: string;
}

// CV Structured Model
export interface CVProfile {
  name: string;
  title: string;
  contact: {
    location: string;
    phone: string;
    email: string;
    github: string;
  };
  summary: string;
  skills: Record<string, string[]>;
  experience: {
    role: string;
    company: string;
    period: string;
    location: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
    location: string;
    details?: string;
  }[];
  certifications: string[];
  languages: string[];
}
```

---

## 4. Key Component Specifications

### 4.1 `MapWidget.client.tsx` (GeoInsights Bolivia Map)
* **Responsibility:** Load Leaflet on client side, render Bolivian department polygons, handle hover/click events, update active department stats, and trigger spatial AI summary.
* **Props:** `onSelectDepartment: (dept: DepartmentData) => void`, `activeLayer: string`.
* **Responsive Behavior:** Height `400px` on mobile, `600px` on desktop. Touch gestures enabled with zoom controls.
* **SSR Handling:** Imported via `next/dynamic` with `ssr: false` and a high-fidelity skeleton fallback.

### 4.2 `InteractiveCVSection.tsx`
* **Responsibility:** Offer dual viewing options:
  1. An interactive, tabbed web presentation of Sebastian's CV (Perfil, Experiencia, Competencias, Educación/Certificaciones).
  2. An embedded PDF preview modal with a direct "Download CV (PDF)" button pointing to `/CV Sebastian Marin.pdf`.
* **Props:** None (reads from `cvData.ts`).
* **Accessibility:** Tab panel ARIA roles (`role="tablist"`, `role="tabpanel"`), keyboard arrow navigation.

### 4.3 `WorkflowQASection.tsx`
* **Responsibility:** Interactive terminal viewer displaying Sebastian's real engineering artifacts:
  - Playwright test script (`tests/smoke.spec.ts`)
  - PHP cURL background sync cron script (`cron_sync.php`)
  - Docker Compose service definition (`docker-compose.yml`)
* **Features:** Tab switcher, syntax highlighting, one-click copy button, execution logs output preview.

---

## 5. Reusable Motion Components

### `SectionReveal.tsx` Implementation
```tsx
'use client';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const SectionReveal = ({ children, delay = 0, className = "" }: Props) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
```

---

## 6. Performance & Optimization Strategy

1. **Dynamic Import for Leaflet:** Map libraries rely on browser globals (`window`, `document`). Dynamic imports prevent SSR errors and reduce initial JS bundle size by ~140KB.
2. **Font Optimization:** Load `Inter` and `JetBrains Mono` using `next/font/google` with `display: 'swap'` to avoid invisible text flashes.
3. **Asset Compression:** Use standard Next.js `<Image />` component with WebP/AVIF format optimization for case study screenshots.
4. **Target Lighthouse Metrics:**
   - Performance: **> 92**
   - Accessibility: **100**
   - Best Practices: **100**
   - SEO: **100**

---

## 7. Testing Strategy with Playwright

Playwright test suites in `tests/` validate essential platform functionality:
* `tests/smoke.spec.ts`: Checks homepage load, hero text, section navigation, CV tab switching, and PDF download link availability.
* `tests/map.spec.ts`: Verifies Leaflet map container initialization, GeoJSON feature clicks, and metric drawer updates.
* `tests/responsive.spec.ts`: Emulates viewports at `360x740` (Mobile), `768x1024` (Tablet), `1440x900` (Desktop) to verify no horizontal scrollbars or cut-off content.

---

## 8. Implementation Roadmap (Phases 1 - 4 Execution)

* **Phase 1 (Complete):** High-level architecture, strategy, creative direction, development spec, and QA strategy documentation.
* **Phase 2 (Build):**
  1. Next.js 14 project scaffolding with TypeScript & Tailwind CSS.
  2. Implement dark console theme tokens, global layout, header, footer, and motion wrappers.
  3. Build data models (`portfolioData.ts`, `boliviaGeoJson.ts`, `cvData.ts`).
  4. Develop Hero, Proof Strip, Capabilities, Flagship GeoInsights Bolivia Map, and Supporting Case Studies.
  5. Implement PHP Sync API demo code, Playwright workflow viewer, and Interactive CV with PDF download link.
* **Phase 3 (Verification):** Build project (`npm run build`), run ESLint/TypeScript compilation, execute Playwright test suite, and audit mobile responsiveness.
* **Phase 4 (Final QA & Delivery):** Final QA audit, documentation update in `04_FINAL_REVIEW_QA.md`, and presentation summary.
