/**
 * ── Data provenance ──────────────────────────────────────────────────────────
 *
 * Two different kinds of data meet in the flagship map, and they must not be
 * confused with each other:
 *
 *  1. REAL — the block polygons and their attributes, streamed at runtime from
 *     Mauricio Foronda's atlasurbano PMTiles archive (INE Censo 2024) and
 *     rendered directly by MapLibre GL. Note the archive's mixed schema: count
 *     fields (population, density per hectare) are absolute, while coverage
 *     fields are 0–1 proportions. Nothing in this file touches them.
 *
 *  2. ILLUSTRATIVE — the aggregate zone figures below (population, density,
 *     internet coverage, services index). These are hand-authored reference
 *     values used to give each metro area a readable summary card. They are NOT
 *     official INE readings and the UI labels them as such.
 *
 * See DATA_SOURCES.md for the full breakdown.
 */

export interface UrbanCensusZone {
  id: string;
  name: string;
  metroArea: 'Santa Cruz' | 'Cochabamba' | 'La Paz' | 'Nacional';
  coordinates: [number, number]; // [lat, lng]
  bounds: [number, number][]; // Zone bounding box
  /** Illustrative reference figures — see the provenance note above. */
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

export const GEOBOLIVIA_DATASET_METADATA = {
  titleEs: "Límite Referencial Departamentos y Manzanos del Censo 2024 de Bolivia",
  titleEn: "Referential Boundary of Departments and Urban Blocks (Censo 2024 Bolivia)",
  provider: "GeoBolivia / Viceministerio de Autonomías & Datasets de @mauforonda (atlasurbano)",
  sourceUrl: "https://github.com/mauforonda/atlasurbano",
  descriptionEs: "Muestra la división espacial a nivel de Manzanos Urbanos y Departamentos de Bolivia con datos procesados del Censo de Población y Vivienda 2024 de Bolivia por Mauricio Foronda (@mauforonda).",
  descriptionEn: "Displays spatial divisions down to urban city blocks (manzanos) and department levels across Bolivia, sourced from Mauricio Foronda's atlasurbano Censo 2024 dataset."
};

export type ScopeType = 'Nacional' | 'Santa Cruz' | 'Cochabamba' | 'La Paz';
export type LayerCode = 'DENSITY' | 'TECH_CONN' | 'LANDLINE_PHONE' | 'HOUSING_SERVICES' | 'ECONOMIC_HUBS';

export interface LayerConfig {
  code: LayerCode;
  labelEs: string;
  labelEn: string;
  descriptionEs: string;
  descriptionEn: string;
  primaryColor: string;
}

/**
 * Camera presets for the MapLibre GL flagship map.
 *
 * NOTE THE COORDINATE ORDER. Everything else in this file uses Leaflet's
 * `[lat, lng]`, but MapLibre GL — like GeoJSON — takes `[lng, lat]`. These
 * centres are therefore stored in MapLibre order and are named accordingly.
 * Getting this backwards puts the camera in the South Atlantic, outside the
 * census archive's bounds, and the block layer renders nothing at all while the
 * unbounded raster basemap keeps loading ocean tiles — a silent failure with no
 * console error.
 */
export const SCOPE_CONFIG: Record<
  ScopeType,
  { centerLngLat: [number, number]; zoom: number; labelEs: string; labelEn: string }
> = {
  Nacional: {
    centerLngLat: [-64.5, -16.5],
    zoom: 5.5,
    labelEs: 'Bolivia Nacional',
    labelEn: 'National Bolivia',
  },
  'Santa Cruz': {
    centerLngLat: [-63.18, -17.78],
    zoom: 12.2,
    labelEs: 'ZM Santa Cruz (Manzanos)',
    labelEn: 'Santa Cruz Metro (Blocks)',
  },
  Cochabamba: {
    centerLngLat: [-66.16, -17.39],
    zoom: 12.8,
    labelEs: 'ZM Cochabamba (Manzanos)',
    labelEn: 'Cochabamba Metro (Blocks)',
  },
  'La Paz': {
    centerLngLat: [-68.13, -16.51],
    zoom: 12.5,
    labelEs: 'ZM La Paz / El Alto (Manzanos)',
    labelEn: 'La Paz / El Alto Metro (Blocks)',
  },
};

/**
 * Census layers grouped for the selector dropdown.
 *
 * `unitLabel` is the unit the layer is actually expressed in, which differs by
 * field: the archive stores population and density as absolute values and
 * coverage indicators as 0–1 proportions rendered as percent. Showing the unit
 * next to the label is what stops "densidad" and "cobertura" from being read on
 * the same scale.
 */
export interface CensusLayerGroup {
  code: string;
  labelEs: string;
  labelEn: string;
  layers: (LayerConfig & { unitLabel: string })[];
}

export const CENSUS_LAYER_GROUPS: CensusLayerGroup[] = [
  {
    code: 'DEMOGRAFIA',
    labelEs: 'Demografía y Densidad',
    labelEn: 'Demographics & Density',
    layers: [
      {
        code: 'DENSITY',
        labelEs: 'Densidad poblacional',
        labelEn: 'Population density',
        descriptionEs: 'Habitantes por hectárea a nivel de manzano urbano (campo b1).',
        descriptionEn: 'Inhabitants per hectare at the urban block level (field b1).',
        primaryColor: '#10b981',
        unitLabel: 'hab/ha',
      },
      {
        code: 'ECONOMIC_HUBS',
        labelEs: 'Población por manzano',
        labelEn: 'Population per block',
        descriptionEs: 'Total de habitantes registrados en cada manzano (campo a1).',
        descriptionEn: 'Total inhabitants recorded in each block (field a1).',
        primaryColor: '#14b8a6',
        unitLabel: 'hab',
      },
    ],
  },
  {
    code: 'CONECTIVIDAD',
    labelEs: 'Conectividad y TICs',
    labelEn: 'Connectivity & ICT',
    layers: [
      {
        code: 'TECH_CONN',
        labelEs: 'Cobertura de internet',
        labelEn: 'Internet coverage',
        descriptionEs: 'Proporción de viviendas con internet residencial o fibra (campo x1).',
        descriptionEn: 'Share of households with residential internet or fibre (field x1).',
        primaryColor: '#06b6d4',
        unitLabel: '%',
      },
      {
        code: 'LANDLINE_PHONE',
        labelEs: 'Telefonía fija',
        labelEn: 'Landline telephone',
        descriptionEs: 'Proporción de viviendas con servicio de línea telefónica fija (campo v1).',
        descriptionEn: 'Share of households with fixed landline telephone service (field v1).',
        primaryColor: '#8b5cf6',
        unitLabel: '%',
      },
    ],
  },
  {
    code: 'VIVIENDA',
    labelEs: 'Vivienda y Servicios',
    labelEn: 'Housing & Services',
    layers: [
      {
        code: 'HOUSING_SERVICES',
        labelEs: 'Agua por cañería',
        labelEn: 'Piped water',
        descriptionEs: 'Proporción de viviendas con agua por cañería de red (campo y1).',
        descriptionEn: 'Share of households with piped mains water (field y1).',
        primaryColor: '#f59e0b',
        unitLabel: '%',
      },
    ],
  },
];

export const CENSUS_LAYERS: LayerConfig[] = [
  {
    code: 'TECH_CONN',
    labelEs: 'Conectividad Digital y Fibra',
    labelEn: 'Digital & Fiber Connectivity',
    descriptionEs: 'Porcentaje de viviendas por manzano con internet residencial, fibra óptica y LTE.',
    descriptionEn: 'Percentage of households per block with residential internet & fiber optic.',
    primaryColor: '#06b6d4', // Cyan
  },
  {
    code: 'LANDLINE_PHONE',
    labelEs: 'Telefonía Fija (Línea Fija)',
    labelEn: 'Fixed Landline Telephone',
    descriptionEs: 'Porcentaje de viviendas por manzano con servicio de telefonía fija residencial (campo v1).',
    descriptionEn: 'Percentage of households per block with residential fixed telephone line (field v1).',
    primaryColor: '#8b5cf6', // Violet
  },
  {
    code: 'DENSITY',
    labelEs: 'Densidad Poblacional (Manzano)',
    labelEn: 'Block Population Density',
    descriptionEs: 'Habitantes por hectárea a nivel de manzano urbano (campo b1 del archivo PMTiles).',
    descriptionEn: 'Inhabitants per hectare at the urban block level (field b1 of the PMTiles archive).',
    primaryColor: '#10b981', // Emerald
  },
  {
    code: 'HOUSING_SERVICES',
    labelEs: 'Servicios Básicos y Agua',
    labelEn: 'Basic Services & Water',
    descriptionEs: 'Cobertura de energía eléctrica, agua potable y alcantarillado por manzano.',
    descriptionEn: 'Electricity, potable water, and sewage coverage per block.',
    primaryColor: '#f59e0b', // Amber
  },
  {
    code: 'ECONOMIC_HUBS',
    labelEs: 'Nodos Económicos',
    labelEn: 'Economic Hubs',
    descriptionEs: 'Concentración de parques industriales, zonas comerciales y oficinas tech.',
    descriptionEn: 'Concentration of industrial parks, commercial corridors, and tech offices.',
    primaryColor: '#14b8a6', // Teal
  },
];

export const RAW_ZONES = [
  // --- SANTA CRUZ METRO ---
  {
    id: 'scz-equipetrol',
    name: 'Equipetrol & Distrito Financiero',
    metroArea: 'Santa Cruz' as const,
    coordinates: [-17.765, -63.195] as [number, number],
    bounds: [
      [-17.752, -63.208],
      [-17.752, -63.182],
      [-17.778, -63.182],
      [-17.778, -63.208],
    ] as [number, number][],
    metrics: {
      population2024: 84500,
      densityHabKm2: 4200,
      internetCoveragePct: 94.5,
      basicServicesIndex: 98.2,
      primarySector: 'Finanzas, Corporativo & Servicios Tech',
    },
    narrativeEs: 'Nodo corporativo de mayor densidad de conectividad digital en Santa Cruz. Manzanos de alta penetración de fibra óptica e infraestructuras corporativas.',
    narrativeEn: 'Top corporate node with highest digital connectivity in Santa Cruz. Urban blocks with high fiber optic penetration and corporate towers.',
  },
  {
    id: 'scz-centro',
    name: 'Centro Histórico & Casco Viejo',
    metroArea: 'Santa Cruz' as const,
    coordinates: [-17.783, -63.182] as [number, number],
    bounds: [
      [-17.770, -63.195],
      [-17.770, -63.169],
      [-17.796, -63.169],
      [-17.796, -63.195],
    ] as [number, number][],
    metrics: {
      population2024: 112000,
      densityHabKm2: 5800,
      internetCoveragePct: 88.0,
      basicServicesIndex: 96.5,
      primarySector: 'Comercio Central, Administración & Turístico',
    },
    narrativeEs: 'Núcleo comercial e histórico con cuadrícula de manzanos coloniales y alta densidad de comercios.',
    narrativeEn: 'Commercial and historic core with colonial urban block grid and high commercial density.',
  },
  {
    id: 'scz-parque-ind',
    name: 'Parque Industrial & Zona Norte',
    metroArea: 'Santa Cruz' as const,
    coordinates: [-17.750, -63.150] as [number, number],
    bounds: [
      [-17.737, -63.163],
      [-17.737, -63.137],
      [-17.763, -63.137],
      [-17.763, -63.163],
    ] as [number, number][],
    metrics: {
      population2024: 165000,
      densityHabKm2: 3100,
      internetCoveragePct: 78.5,
      basicServicesIndex: 91.0,
      primarySector: 'Manufactura, Logística & Agroindustria',
    },
    narrativeEs: 'Principal polo industrial del oriente boliviano con manzanos destinados a manufactura y logística agroindustrial.',
    narrativeEn: 'Main industrial manufacturing and logistics hub in eastern Bolivia with industrial-scale urban blocks.',
  },

  // --- COCHABAMBA METRO ---
  {
    id: 'cbba-prado',
    name: 'Centro Histórico & El Prado',
    metroArea: 'Cochabamba' as const,
    coordinates: [-17.390, -66.158] as [number, number],
    bounds: [
      [-17.377, -66.171],
      [-17.377, -66.145],
      [-17.403, -66.145],
      [-17.403, -66.171],
    ] as [number, number][],
    metrics: {
      population2024: 98000,
      densityHabKm2: 4900,
      internetCoveragePct: 91.2,
      basicServicesIndex: 97.8,
      primarySector: 'Servicios Profesionales, Gastronomía & Banca',
    },
    narrativeEs: 'Eje gastronómico y administrativo central del valle valluno. Manzanos con excelente infraestructura de redes y servicios.',
    narrativeEn: 'Central culinary and professional services avenue. Urban blocks with high fiber optic penetration.',
  },
  {
    id: 'cbba-tiquipaya',
    name: 'Tiquipaya Campus & Tech Corridor',
    metroArea: 'Cochabamba' as const,
    coordinates: [-17.340, -66.210] as [number, number],
    bounds: [
      [-17.327, -66.223],
      [-17.327, -66.197],
      [-17.353, -66.197],
      [-17.353, -66.223],
    ] as [number, number][],
    metrics: {
      population2024: 64000,
      densityHabKm2: 2400,
      internetCoveragePct: 93.8,
      basicServicesIndex: 94.0,
      primarySector: 'Educación Superior (Univalle/UMSS), Software & I+D',
    },
    narrativeEs: 'Hub universitario y de ingeniería de software. Manzanos con alta concentración de laboratorios de desarrollo y campus tech.',
    narrativeEn: 'Software engineering hub. Urban blocks housing development labs, engineering campuses, and tech incubators.',
  },
  {
    id: 'cbba-quillacollo',
    name: 'Corredor Quillacollo & Colcapirhua',
    metroArea: 'Cochabamba' as const,
    coordinates: [-17.395, -66.280] as [number, number],
    bounds: [
      [-17.382, -66.293],
      [-17.382, -66.267],
      [-17.408, -66.267],
      [-17.408, -66.293],
    ] as [number, number][],
    metrics: {
      population2024: 172000,
      densityHabKm2: 3800,
      internetCoveragePct: 76.8,
      basicServicesIndex: 89.4,
      primarySector: 'Manufactura Ligera, Software & Comercio',
    },
    narrativeEs: 'Corredor metropolitano occidental con manzanos en rápida transición industrial y comercial.',
    narrativeEn: 'Western metropolitan corridor with urban blocks undergoing rapid commercial and industrial growth.',
  },

  // --- LA PAZ / EL ALTO METRO ---
  {
    id: 'lpz-sopocachi',
    name: 'Sopocachi & Centro Gubernamental',
    metroArea: 'La Paz' as const,
    coordinates: [-16.510, -68.130] as [number, number],
    bounds: [
      [-16.497, -68.143],
      [-16.497, -68.117],
      [-16.523, -68.117],
      [-16.523, -68.143],
    ] as [number, number][],
    metrics: {
      population2024: 92000,
      densityHabKm2: 6100,
      internetCoveragePct: 92.4,
      basicServicesIndex: 98.5,
      primarySector: 'Gobierno Central, Embajadas & Cultura',
    },
    narrativeEs: 'Corazón administrativo e histórico de La Paz. Manzanos integrados con líneas de transporte por cable (Mi Teleférico).',
    narrativeEn: 'Administrative core of La Paz. Urban blocks integrated with Mi Teleférico cable car transport network.',
  },
  {
    id: 'lpz-calacoto',
    name: 'Calacoto & Zona Sur Commercial Hub',
    metroArea: 'La Paz' as const,
    coordinates: [-16.540, -68.085] as [number, number],
    bounds: [
      [-16.527, -68.098],
      [-16.527, -68.072],
      [-16.553, -68.072],
      [-16.553, -68.098],
    ] as [number, number][],
    metrics: {
      population2024: 128000,
      densityHabKm2: 3400,
      internetCoveragePct: 95.8,
      basicServicesIndex: 99.0,
      primarySector: 'Banca Corporativa, Comercio & Startups',
    },
    narrativeEs: 'Distrito corporativo y residencial de la Zona Sur de La Paz. Manzanos con infraestructuras financieras y comerciales de alta velocidad.',
    narrativeEn: 'Corporate district in La Paz South Zone. Urban blocks with high-speed fiber internet and banking headquarters.',
  },
  {
    id: 'lpz-elalto-ceja',
    name: 'El Alto — La Ceja & Corredor 6 de Marzo',
    metroArea: 'La Paz' as const,
    coordinates: [-16.505, -68.165] as [number, number],
    bounds: [
      [-16.492, -68.178],
      [-16.492, -68.152],
      [-16.518, -68.152],
      [-16.518, -68.178],
    ] as [number, number][],
    metrics: {
      population2024: 410000,
      densityHabKm2: 8200,
      internetCoveragePct: 68.5,
      basicServicesIndex: 85.0,
      primarySector: 'Comercio Popular, Importaciones & Transporte',
    },
    narrativeEs: 'Hub neurálgico de intercambio comercial a 4,000 msnm. Manzanos de altísima densidad comercial e industrial.',
    narrativeEn: 'Commercial exchange hub at 4,000m altitude. Highly dense commercial and transport urban blocks.',
  },

  // --- NACIONAL (DEPARTAMENTAL) ---
  {
    id: 'nac-santacruz',
    name: 'Santa Cruz (Departamento)',
    metroArea: 'Nacional' as const,
    coordinates: [-17.80, -63.18] as [number, number],
    bounds: [
      [-16.0, -64.5],
      [-16.0, -60.0],
      [-20.0, -60.0],
      [-20.0, -64.5],
    ] as [number, number][],
    metrics: {
      population2024: 3115000,
      densityHabKm2: 8.4,
      internetCoveragePct: 82.5,
      basicServicesIndex: 89.0,
      primarySector: 'Agroindustria, Gas, Comercio & Servicios',
    },
    narrativeEs: 'Departamento más poblado y motor económico agroindustrial de Bolivia.',
    narrativeEn: 'Most populous department and agricultural powerhouse of Bolivia.',
  },
  {
    id: 'nac-lapaz',
    name: 'La Paz (Departamento)',
    metroArea: 'Nacional' as const,
    coordinates: [-16.50, -68.15] as [number, number],
    bounds: [
      [-14.0, -69.5],
      [-14.0, -66.8],
      [-18.0, -66.8],
      [-18.0, -69.5],
    ] as [number, number][],
    metrics: {
      population2024: 3020000,
      densityHabKm2: 22.5,
      internetCoveragePct: 79.8,
      basicServicesIndex: 87.5,
      primarySector: 'Servicios Gubernamentales, Minería & Comercio',
    },
    narrativeEs: 'Sede de Gobierno con diversidad geográfica desde el Altiplano hasta los Yungas.',
    narrativeEn: 'Seat of government spanning diverse geographical regions.',
  },
  {
    id: 'nac-cochabamba',
    name: 'Cochabamba (Departamento)',
    metroArea: 'Nacional' as const,
    coordinates: [-17.38, -66.16] as [number, number],
    bounds: [
      [-16.0, -67.5],
      [-16.0, -64.5],
      [-18.5, -64.5],
      [-18.5, -67.5],
    ] as [number, number][],
    metrics: {
      population2024: 2005000,
      densityHabKm2: 36.0,
      internetCoveragePct: 76.0,
      basicServicesIndex: 86.0,
      primarySector: 'Desarrollo de Software, Gastronomía & Energía',
    },
    narrativeEs: 'Corazón geográfico de Bolivia y hub de formación universitaria e ingeniería de software.',
    narrativeEn: 'Geographic heart of Bolivia and central university software hub.',
  },
];

export const URBAN_CENSUS_ZONES: UrbanCensusZone[] = RAW_ZONES;
