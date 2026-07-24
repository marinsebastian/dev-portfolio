# 01_PORTFOLIO_STRATEGY.md — Strategic Positioning & Architecture Plan

**Candidate:** Sebastian Marin (System Engineer / Full-Stack Developer)  
**Target Context:** High-impact Full-Stack Engineering Role (with a focus on Web Applications, APIs, SQL/Data, Linux/Automation, Maps/GIS, and AI Integrations).  
**Document Version:** 1.0.0  

---

## 1. Executive Purpose

The objective of this portfolio is to establish Sebastian Marin as a high-caliber Full-Stack Developer capable of building robust, operational, data-heavy web applications, REST/cURL backend APIs, automation scripts, and interactive map dashboards.

Rather than presenting a flashy, generic developer portfolio with standard templates, this portfolio functions as an **Operational Engineering Console**. It proves through concrete case studies and live interactive demonstrations that Sebastian bridges the gap between clean frontend UI/UX, database-backed business logic, spatial map visualization, Linux server automation, and modern AI tool integration.

---

## 2. Audience Analysis

### Primary Audience
* **CTO, VP of Engineering, & Lead Developers (e.g., at Geolabs Cloud):**  
  * *What they look for:* Proof of clean TypeScript code, practical API integration (REST, cURL, webhooks), spatial data/map capabilities (Leaflet/GIS), database proficiency (MySQL, PostgreSQL, query design), Linux command-line fluency (cron, SSH, Bash), and real project execution.
  * *What turns them off:* Pure design concepts without logic, exaggerated claims (e.g. claiming advanced production PostGIS when experience is foundational), broken mobile layouts, and generic template sites.

### Secondary Audience
* **Technical Product Managers & Freelance Enterprise Clients:**  
  * *What they look for:* Ability to ship end-to-end applications (like Awtu Commerce or reservation platforms), clear UI/UX hierarchy, reliability, and business impact.

---

## 3. Positioning & Core Narrative

### Core Headlines

* **English Primary Headline:**  
  `Full-Stack Developer focused on Interfaces, APIs, Spatial Data & Automation.`
* **Spanish Primary Headline:**  
  `Desarrollador Full-Stack enfocado en Interfaces, APIs, Datos Espaciales y Automatización.`

### Core Value Proposition
> *"I build web systems that turn complex data, APIs, spatial information, and workflows into simple, operational tools."*  
> *(“Construyo sistemas web que convierten datos, APIs, información espacial y procesos en herramientas operativas simples de usar.”)*

### The Narrative Arc
1. **Interfaces:** Clean, fast, responsive Next.js/React frontends with accessible motion and enterprise design.
2. **APIs & Backend:** RESTful services, secure PHP/cURL integrations, webhooks, and polling architectures.
3. **Data & Databases:** SQL schema design, complex joins, aggregations in MySQL/PostgreSQL, and Supabase.
4. **Spatial & Maps:** Interactive geospatial visualizations with Leaflet, GeoJSON processing, and spatial bounds analysis.
5. **Automation & Linux:** PowerShell/Bash scripting, Linux CLI, cron jobs, Docker containerization, and Playwright automated QA.
6. **AI Tools:** Applied integration of Gemini API (customer support assistants) and AI-assisted workflows (Antigravity, Gemini CLI, Hermes Agent).

---

## 4. Homepage Section Architecture

The homepage is structured as an interactive engineering portfolio console:

| Section # | Section Name | Objective | Primary Visible Copy | Visual & Motion Concept | Mobile Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | **Hero & Status Header** | Immediate technical clarity and positioning. | "Full-Stack Developer — Interfaces, APIs, Data & Automation" + Live status indicator. | Terminal metric badges, subtle telemetry grid background, parallax hero text. | Stacked metrics, responsive font sizing, clear CTA touch targets. |
| **02** | **Proof Strip** | Validate technical breadth in 5 seconds. | Next.js • TypeScript • SQL • PHP/cURL • Leaflet Maps • Docker & Linux • Gemini API | Sliding marquee/badge grid with subtle glow on active icons. | Responsive wrapped wrap-grid, touch scrollable. |
| **03** | **What I Build (Capabilities)** | Categorize skills into operational pillars. | 4 Pillars: Operational Web UIs, Data & Spatial Maps, API & Sync Engines, Linux & Automation. | 2x2 Interactive feature cards with hover borders and code/architecture snippets. | Single-column cards with expandable detail drawers. |
| **04** | **Flagship Project** | Highlight flagship map & data explorer. | **GeoInsights Bolivia / Bolivia Data Explorer** — Geospatial Public Data Platform. | Embedded live interactive Leaflet map widget with layer controls, region filters, and metric cards. | Full-width touch map viewer, expandable data overlay drawer. |
| **05** | **Core Case Studies** | Deep dive into 3 supporting projects + 1 Spatial Lab. | Awtu Commerce, Sistema de Reserva, PHP Data Sync API, Voronoi Coverage Lab. | Tabbed / Grid project cards with visual architecture diagrams and proof points. | Stacked case study cards with tab navigation. |
| **06** | **Technical Stack & Systems** | Show exact tool proficiency with context. | Frontend, Backend/Databases, Linux/DevOps, AI & Tooling. | Interactive tabbed stack matrix with experience depth tags. | Grouped vertical lists with badges. |
| **07** | **Engineering Workflow & QA** | Demonstrate rigor (Playwright, Docker, Cron). | "Tested, Documented, and Automated Workflows" | Code snippet comparison tab (Playwright test, Cron sync script, Docker Compose file). | Scrollable code box with copy button. |
| **08** | **Interactive CV / Professional Profile** | Present resume cleanly in-browser with PDF download. | "Curriculum Vitae — Sebastian Marin" (Full interactive resume view). | Tabbed CV section (Perfil, Experiencia, Competencias, Educación) + PDF embed view & download button. | Responsive vertical timeline layout with direct PDF download button. |
| **09** | **Contact & Action Console** | Conversion to inquiry / interview. | "Let's build reliable systems together." | High-contrast CTA box, direct email copy, social links (GitHub, LinkedIn). | Fixed bottom quick-contact bar + touch-friendly form. |

---

## 5. Comprehensive Case Study Strategy

### 1. Flagship: GeoInsights Bolivia (Geospatial & Public Data Platform)
* **Concept:** Interactive web application demonstrating spatial data processing, Leaflet map rendering, GeoJSON layers for Bolivian departments/municipalities, public metric filtering, and Gemini-assisted spatial insights.
* **Problem:** Public datasets (population, economic metrics, infrastructure coverage) in Bolivia are often static, fragmented, or trapped in PDFs.
* **Solution:** A responsive Next.js dashboard featuring an interactive map, dynamic spatial filtering, custom GeoJSON polygon rendering, data aggregation charts, and REST API endpoints.
* **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Leaflet / React-Leaflet, GeoJSON, Lucide Icons, Recharts.
* **Proof Points & Value for Engineering Roles:** Demonstrates spatial information handling, frontend performance optimization for map layers, client/server rendering separation, clean UI layout, and API-driven dashboarding.

### 2. Supporting Project 1: Awtu Commerce (E-Commerce & Payment API Platform)
* **Concept:** Real-world commercial platform with Next.js/TypeScript frontend, admin catalog management, BCP QR payment gateway integration, and Gemini AI customer support assistant.
* **Problem:** Local e-commerce platforms need fast catalog administration, instant local QR payment reconciliation, and automated customer queries without exposing backend credentials.
* **Solution:** Built administrative views for products/categories, integrated Banco de Crédito BCP QR payment API with transaction status polling and webhooks, and constructed a Next.js API proxy for a Gemini AI support assistant.
* **Stack:** Next.js, TypeScript, MySQL, Firebase, BCP QR Payment API, Gemini API, Tailwind CSS, Playwright.
* **Proof Points & Value for Engineering Roles:** Proves production experience with REST API integration, webhook/polling payment verification, secure AI API proxying, and automated QA testing with Playwright.

### 3. Supporting Project 2: Sistema de Reserva de Ambientes (Facility Scheduling Engine)
* **Concept:** University facility management application featuring room reservations, schedule conflict validation, constraints enforcement, and database CRUD operations.
* **Problem:** Overlapping room requests, user authorization constraints, and complex time slot conflicts in academic facilities.
* **Solution:** Engineered a robust business logic engine with slot availability checks, CRUD management for classrooms/schedules/users, and relational database schema design.
* **Stack:** React, Node.js / Express, PostgreSQL / MySQL, Tailwind CSS, REST API.
* **Proof Points & Value for Engineering Roles:** Proves understanding of relational SQL queries, table join design, transaction validation logic, and practical operational software development.

### 4. Supporting Project 3: PHP Data Sync API (cURL & Cron Sync Service)
* **Concept:** Micro-service written in PHP that fetches external REST data via cURL, normalizes and stores records in MySQL, and exposes a RESTful JSON API. Includes automated cron execution script.
* **Problem:** Legacy backend infrastructures require reliable background synchronization of external datasets without heavy framework overhead.
* **Solution:** Lightweight PHP service using PDO/MySQLi, cURL request wrapper with exponential retry logic, env configuration support, structured error logging, and CLI cron integration.
* **Stack:** PHP 8.x, MySQL (PDO), cURL, Linux CLI, Bash, Cron, REST API.
* **Proof Points & Value for Engineering Roles:** Directly addresses backend requirements (PHP intermediate/advanced, cURL, REST, MySQL, Linux CLI, cron jobs, error handling) with clean, documented code.

### 5. Spatial Lab: Coverage Planner / Voronoi Map Lab (Interactive GIS Utility)
* **Concept:** Interactive browser-based spatial tool where users place service points on a map to compute approximate Voronoi coverage zones and export standard GeoJSON features.
* **Problem:** Visualizing regional coverage and spatial proximity quickly during planning.
* **Solution:** Lightweight spatial algorithm rendering dynamic Voronoi polygons on a Leaflet canvas with custom polygon styling and GeoJSON export.
* **Stack:** TypeScript, Leaflet, Turf.js / Voronoi algorithm, Tailwind CSS.
* **Proof Points & Value for Engineering Roles:** Demonstrates spatial curiosity, geometric algorithms, client-side map interactions, and data format standardization (GeoJSON).

---

## 6. Risk Management & Mitigations

| Identified Risk | Risk Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Over-Promising Skills** | Claiming advanced PostGIS or senior PHP expertise without production backing. | Be explicitly honest: frame spatial skills as "Leaflet, GeoJSON, spatial visualization, and foundational GIS queries"; frame PHP as "Robust REST microservices, cURL integrations, PDO database queries, and CLI cron jobs." |
| **Generic Template Look** | Looking like a basic Vercel starter kit or basic portfolio template. | Implement the custom **Operational Data Console** design system: dark matte background, high-contrast typography, telemetry grid overlays, status badges, and interactive live tools. |
| **AI Buzzword Overload** | Mentioning "AI" endlessly without engineering context. | Focus strictly on practical implementation details: Gemini API endpoint proxying, rate limiting, system prompt design, and AI-assisted local tools (Antigravity, Gemini CLI). |
| **Mobile Breakage** | Maps or code blocks overflowing on small screens (360px–390px). | Enforce strict responsive grid breakpoints, mobile-first drawer overlays for maps, horizontally scrolling code boxes, and 44px minimum touch targets. |

---

## 7. Success Criteria & Definition of Done

The portfolio is ready for review and delivery when:
1. All 5 case studies (GeoInsights, Awtu Commerce, Room Reservation, PHP Data Sync API, Voronoi Lab) feature live interactive demos or detailed technical walkthroughs with architecture diagrams and code snippets.
2. An interactive CV viewer and downloadable PDF link (`CV Sebastian Marin.pdf`) are seamlessly embedded.
3. Live map features (GeoInsights Bolivia & Voronoi Lab) render smoothly without SSR/hydration errors in Next.js.
4. Mobile responsiveness is verified on 360px, 390px, 768px, 1024px, 1440px, and 1920px viewports with zero horizontal scroll bug.
5. Automated Playwright smoke tests pass cleanly across desktop and mobile browsers.
6. The site achieves Lighthouse scores > 90 across Performance, Accessibility, Best Practices, and SEO.
