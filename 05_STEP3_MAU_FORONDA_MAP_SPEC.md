# 05_STEP3_MAU_FORONDA_MAP_SPEC.md — Bolivian Urban & Census Data Explorer Specification

**Project:** Sebastian Marin — Full-Stack Engineering Portfolio  
**Inspiration Source:** Mauricio Foronda ([@mauforonda](https://github.com/mauforonda)) — Open Bolivian GIS & Census Datasets  
**Document Version:** 1.0.0  

---

## 1. Context & Objective

Mauricio Foronda maintains the premier open-data ecosystem for geospatial, urban, and census information in Bolivia. His projects include:
* **`mauforonda/atlasurbano` & `mauforonda.github.io/atlasurbano`:** Urban atlas utilizing Censo 2024 data (population density, education, housing quality, basic services, internet/connectivity) mapped down to urban block levels.
* **`mauforonda/geodatos`:** Geographic datasets covering Bolivian national, departmental, and municipal boundaries in GeoJSON/GeoParquet.
* **`mauforonda/atlas-de-ciudades`:** Comparative urban spatial metrics for major metropolitan areas (Santa Cruz de la Sierra, Cochabamba, La Paz / El Alto).
* **`datosbolivia/censos`:** Historic and 2024 census records.

### Strategic Goal
Transform the existing Leaflet map into an **Interactive Bolivian Urban & Census Explorer** that wows non-technical executives (CEO, CFO, Graphic Designer, Community Manager) with rich visual layers while proving spatial data processing capabilities to technical leadership (CTO).

---

## 2. Architecture & Data Model

### 2.1 Multi-Level View Selector
The map explorer supports 4 distinct spatial view scopes:

1. **Nivel Nacional (Bolivia - 9 Departamentos):** High-level regional overview (La Paz, Santa Cruz, Cochabamba, Oruro, Potosí, Tarija, Chuquisaca, Beni, Pando).
2. **Zona Metropolitana Santa Cruz (Santa Cruz de la Sierra):** Urban census blocks, industrial corridors, agricultural expansion zones, population density (Censo 2024).
3. **Zona Metropolitana Cochabamba (Cochabamba / Quillacollo / Sacaba):** Tech & software hub concentration, academic density, urban infrastructure.
4. **Zona Metropolitana La Paz / El Alto:** Administrative node, altitude geography, transit/connectivity metrics.

### 2.2 Census 2024 & Urban Indicator Layers
Users can toggle between 4 visual data layers on any active scope:

| Layer Code | Layer Name (ES / EN) | Metric Description | Visual Color Scale |
| :--- | :--- | :--- | :--- |
| **`DENSITY`** | Densidad Poblacional / Population Density | Inhabitants per km² / urban block count (Censo 2024). | Deep Indigo to Bright Emerald (`#10b981`) |
| **`TECH_CONN`** | Conectividad y Fibra Óptica / Digital Connectivity | % Household internet access & fiber optic coverage. | Slate to Restrained Cyan (`#06b6d4`) |
| **`HOUSING_SERVICES`** | Servicios Básicos y Vivienda / Urban Basic Services | Electricity, potable water, sanitation index. | Dark Charcoal to Amber (`#f59e0b`) |
| **`ECONOMIC_HUBS`** | Nodos Económicos e Industriales / Economic Hubs | Industrial parks, commercial zones, service points. | Charcoal to Electric Teal (`#14b8a6`) |

---

## 3. Technical Implementation Specification

### 3.1 Data Schema (`data/mauForondaCensusData.ts`)

```typescript
export interface UrbanCensusZone {
  id: string;
  name: string;
  metroArea: 'Santa Cruz' | 'Cochabamba' | 'La Paz' | 'Nacional';
  coordinates: [number, number]; // [lat, lng]
  bounds: [number, number][]; // Polygon geometry
  metrics: {
    population2024: number;
    densityHabKm2: number;
    internetCoveragePct: number; // 0 - 100
    basicServicesIndex: number; // 0 - 100
    primarySector: string;
  };
  narrativeEs: string;
  narrativeEn: string;
}
```

### 3.2 Dynamic Leaflet Component (`components/map/UrbanCensusExplorer.client.tsx`)

* **Client Isolation:** Imported dynamically with `ssr: false` in Next.js App Router.
* **Tile Provider:** CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) matching the Operational Data Console dark theme.
* **Layer Styling Handler:**

```tsx
function getFeatureStyle(zone: UrbanCensusZone, activeLayer: string, isSelected: boolean) {
  let fillColor = '#1e293b';
  let opacity = 0.25;

  if (activeLayer === 'TECH_CONN') {
    fillColor = zone.metrics.internetCoveragePct > 80 ? '#06b6d4' : '#1e293b';
    opacity = zone.metrics.internetCoveragePct / 100;
  } else if (activeLayer === 'DENSITY') {
    fillColor = zone.metrics.densityHabKm2 > 3000 ? '#10b981' : '#14b8a6';
    opacity = Math.min(1, zone.metrics.densityHabKm2 / 5000);
  }

  return {
    color: isSelected ? '#14b8a6' : '#475569',
    fillColor,
    fillOpacity: isSelected ? 0.6 : opacity,
    weight: isSelected ? 3 : 1,
  };
}
```

### 3.3 Gemini AI Spatial Analysis Proxy (`app/api/gemini-assistant/route.ts`)
* Accepts `metroArea` and `layer` payload.
* Generates natural language socio-demographic insights for executive review.

---

## 4. UI/UX Design & Executive Appeal

1. **Top Scope Switcher Bar:** Tabs for `[Bolivia Nacional]` `[Santa Cruz]` `[Cochabamba]` `[La Paz]`.
2. **Layer Control Pills:** Toggle buttons for `[Densidad Censo 2024]` `[Conectividad Digital]` `[Servicios Básicos]` `[Nodos Económicos]`.
3. **Active Zone Analytics Panel:**
   - Population stats & density badge.
   - Internet connectivity bar gauge.
   - Instant AI summary button with narrative card.
4. **Bilingual Support:** Reads directly from `LanguageContext` (`ES` default, `EN` toggle).
