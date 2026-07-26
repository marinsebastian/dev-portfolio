export interface UrbanCensusZone {
  id: string;
  name: string;
  metroArea: 'Santa Cruz' | 'Cochabamba' | 'La Paz' | 'Nacional';
  coordinates: [number, number]; // [lat, lng]
  bounds: [number, number][]; // Polygon geometry [lat, lng] points
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
  titleEs: "Límite Referencial Departamentos del Estado Plurinacional de Bolivia 2015",
  titleEn: "Referential Boundary of Departments of the Plurinational State of Bolivia 2015",
  provider: "GeoBolivia / Viceministerio de Autonomías (339 Municipios 2015)",
  sourceUrl: "https://mauforonda.github.io/geodatos/",
  descriptionEs: "Muestra la división política-administrativa de los 9 departamentos de Bolivia, entidades subnacionales mayores en las que se subdivide el territorio del Estado Plurinacional, que de acuerdo a la Constitución Política del Estado poseen ineludiblemente, continuidad territorial y desde el 4 de abril de 2010, cuentan con autonomía reconocida a nivel ejecutivo y legislativo pero no judicial. Dato del ex Ministerio de las Autonomías hoy Viceministerio de Autonomías, que proviene de la información de los 339 municipios del año 2015 (carácter referencial).",
  descriptionEn: "Displays the political-administrative division of the 9 departments of Bolivia, major subnational entities in which the territory of the Plurinational State is subdivided with executive and legislative autonomy. Sourced from the Vice Ministry of Autonomies (339 municipalities, 2015) and open datasets from Mauricio Foronda."
};

export type ScopeType = 'Nacional' | 'Santa Cruz' | 'Cochabamba' | 'La Paz';

export type LayerCode = 'DENSITY' | 'TECH_CONN' | 'HOUSING_SERVICES' | 'ECONOMIC_HUBS';

export interface LayerConfig {
  code: LayerCode;
  labelEs: string;
  labelEn: string;
  descriptionEs: string;
  descriptionEn: string;
  primaryColor: string;
}

export const SCOPE_CONFIG: Record<ScopeType, { center: [number, number]; zoom: number; labelEs: string; labelEn: string }> = {
  Nacional: {
    center: [-16.5, -64.5],
    zoom: 5.5,
    labelEs: 'Bolivia Nacional',
    labelEn: 'National Bolivia',
  },
  'Santa Cruz': {
    center: [-17.78, -63.18],
    zoom: 11.5,
    labelEs: 'ZM Santa Cruz',
    labelEn: 'Santa Cruz Metro',
  },
  Cochabamba: {
    center: [-17.39, -66.16],
    zoom: 12,
    labelEs: 'ZM Cochabamba',
    labelEn: 'Cochabamba Metro',
  },
  'La Paz': {
    center: [-16.51, -68.13],
    zoom: 11.8,
    labelEs: 'ZM La Paz / El Alto',
    labelEn: 'La Paz / El Alto Metro',
  },
};

export const CENSUS_LAYERS: LayerConfig[] = [
  {
    code: 'DENSITY',
    labelEs: 'Densidad Poblacional (Censo 2024)',
    labelEn: 'Population Density (2024 Census)',
    descriptionEs: 'Habitantes por km² a nivel de manzaneo urbano e indicador departamental.',
    descriptionEn: 'Inhabitants per km² across urban block zones and regional indicators.',
    primaryColor: '#10b981', // Emerald
  },
  {
    code: 'TECH_CONN',
    labelEs: 'Conectividad Digital y Fibra',
    labelEn: 'Digital & Fiber Connectivity',
    descriptionEs: 'Porcentaje de viviendas con internet residencial, fibra óptica y cobertura LTE.',
    descriptionEn: 'Percentage of households with residential internet, fiber optic & LTE coverage.',
    primaryColor: '#06b6d4', // Cyan
  },
  {
    code: 'HOUSING_SERVICES',
    labelEs: 'Servicios Básicos y Vivienda',
    labelEn: 'Basic Services & Housing Index',
    descriptionEs: 'Índice de cobertura de energía eléctrica, agua potable y saneamiento básico.',
    descriptionEn: 'Coverage index of electricity, potable water, and basic sanitation.',
    primaryColor: '#f59e0b', // Amber
  },
  {
    code: 'ECONOMIC_HUBS',
    labelEs: 'Nodos Económicos e Industriales',
    labelEn: 'Economic & Industrial Hubs',
    descriptionEs: 'Concentración de parques industriales, zonas comerciales y hubs financieros.',
    descriptionEn: 'Concentration of industrial parks, commercial corridors, and financial hubs.',
    primaryColor: '#14b8a6', // Teal
  },
];

export const URBAN_CENSUS_ZONES: UrbanCensusZone[] = [
  // --- SANTA CRUZ METRO ZONES ---
  {
    id: 'scz-equipetrol',
    name: 'Equipetrol & Distrito Financiero',
    metroArea: 'Santa Cruz',
    coordinates: [-17.765, -63.195],
    bounds: [
      [-17.755, -63.205],
      [-17.755, -63.185],
      [-17.775, -63.185],
      [-17.775, -63.205],
    ],
    metrics: {
      population2024: 84500,
      densityHabKm2: 4200,
      internetCoveragePct: 94.5,
      basicServicesIndex: 98.2,
      primarySector: 'Finanzas, Corporativo & Servicios Tech',
    },
    narrativeEs: 'Nodo corporativo de mayor densidad de conectividad digital en Santa Cruz de la Sierra. Concentra oficinas bancarias, sedes tecnológicas y desarrollos inmobiliarios verticales.',
    narrativeEn: 'Top corporate node with highest digital connectivity in Santa Cruz. Hosts tech headquarters, financial services, and high-density residential towers.',
  },
  {
    id: 'scz-centro',
    name: 'Centro Histórico & Casco Viejo',
    metroArea: 'Santa Cruz',
    coordinates: [-17.783, -63.182],
    bounds: [
      [-17.775, -63.190],
      [-17.775, -63.174],
      [-17.792, -63.174],
      [-17.792, -63.190],
    ],
    metrics: {
      population2024: 112000,
      densityHabKm2: 5800,
      internetCoveragePct: 88.0,
      basicServicesIndex: 96.5,
      primarySector: 'Comercio Central, Administración Pública & Turístico',
    },
    narrativeEs: 'Núcleo comercial e histórico con cuadrícula colonial. Elevado flujo peatonal y alta densidad de comercio formal e informal.',
    narrativeEn: 'Commercial and historic core with colonial grid layout. High pedestrian volume and dense commercial services.',
  },
  {
    id: 'scz-parque-ind',
    name: 'Parque Industrial & Zona Norte',
    metroArea: 'Santa Cruz',
    coordinates: [-17.750, -63.150],
    bounds: [
      [-17.735, -63.165],
      [-17.735, -63.135],
      [-17.765, -63.135],
      [-17.765, -63.165],
    ],
    metrics: {
      population2024: 165000,
      densityHabKm2: 3100,
      internetCoveragePct: 78.5,
      basicServicesIndex: 91.0,
      primarySector: 'Manufactura, Logística & Agroindustria',
    },
    narrativeEs: 'Principal polo industrial del oriente boliviano con conexión ferroviaria y vial directa a las carreteras biocéanicas.',
    narrativeEn: 'Main industrial manufacturing and logistics hub in eastern Bolivia with direct rail and highway connections.',
  },
  {
    id: 'scz-plan3000',
    name: 'Plan 3000 (Ciudad Andrés Ibáñez)',
    metroArea: 'Santa Cruz',
    coordinates: [-17.820, -63.130],
    bounds: [
      [-17.805, -63.150],
      [-17.805, -63.110],
      [-17.835, -63.110],
      [-17.835, -63.150],
    ],
    metrics: {
      population2024: 340000,
      densityHabKm2: 6400,
      internetCoveragePct: 62.4,
      basicServicesIndex: 84.5,
      primarySector: 'Comercio Popular, Microempresa & Servicios',
    },
    narrativeEs: 'Distrito urbano de crecimiento demográfico acelerado. Alta vibración microempresarial e inversión pública creciente en redes de saneamiento.',
    narrativeEn: 'Rapidly growing urban district with intense micro-enterprise commercial activity and ongoing municipal infrastructure expansion.',
  },
  {
    id: 'scz-urubo',
    name: 'Zona Urubó & Colinas de Porongo',
    metroArea: 'Santa Cruz',
    coordinates: [-17.760, -63.220],
    bounds: [
      [-17.740, -63.240],
      [-17.740, -63.200],
      [-17.780, -63.200],
      [-17.780, -63.240],
    ],
    metrics: {
      population2024: 38000,
      densityHabKm2: 1200,
      internetCoveragePct: 96.0,
      basicServicesIndex: 95.0,
      primarySector: 'Residencial de Alta Gama & Hotelería',
    },
    narrativeEs: 'Expansión metropolitana al oeste del río Piraí. Urbanización planificada con infraestructuras privadas de alta velocidad.',
    narrativeEn: 'Metropolitan expansion west of Piraí River featuring master-planned communities and high-speed residential fiber networks.',
  },

  // --- COCHABAMBA METRO ZONES ---
  {
    id: 'cbba-prado',
    name: 'Centro Histórico & El Prado',
    metroArea: 'Cochabamba',
    coordinates: [-17.390, -66.158],
    bounds: [
      [-17.380, -66.170],
      [-17.380, -66.146],
      [-17.400, -66.146],
      [-17.400, -66.170],
    ],
    metrics: {
      population2024: 98000,
      densityHabKm2: 4900,
      internetCoveragePct: 91.2,
      basicServicesIndex: 97.8,
      primarySector: 'Servicios Profesionales, Gastronomía & Banca',
    },
    narrativeEs: 'Eje gastronómico y administrativo central del valle valluno. Alta cobertura en redes de fibra óptica y servicios urbanos consolidados.',
    narrativeEn: 'Central culinary and professional services avenue. Consolidated municipal utilities and robust fiber optic penetration.',
  },
  {
    id: 'cbba-quillacollo',
    name: 'Corredor Quillacollo & Colcapirhua',
    metroArea: 'Cochabamba',
    coordinates: [-17.395, -66.280],
    bounds: [
      [-17.375, -66.310],
      [-17.375, -66.250],
      [-17.415, -66.250],
      [-17.415, -66.310],
    ],
    metrics: {
      population2024: 172000,
      densityHabKm2: 3800,
      internetCoveragePct: 76.8,
      basicServicesIndex: 89.4,
      primarySector: 'Manufactura Ligera, Software & Agricultura Periurbana',
    },
    narrativeEs: 'Nodo concéntrico de conexión con la zona andina. Desarrollo emergente de hubs de desarrollo de software y pequeñas industrias.',
    narrativeEn: 'Concentric connecting hub toward western valleys. Emerging software development talent pools and light manufacturing.',
  },
  {
    id: 'cbba-tiquipaya',
    name: 'Tiquipaya Campus & Tech Corridor',
    metroArea: 'Cochabamba',
    coordinates: [-17.340, -66.210],
    bounds: [
      [-17.320, -66.230],
      [-17.320, -66.190],
      [-17.360, -66.190],
      [-17.360, -66.230],
    ],
    metrics: {
      population2024: 64000,
      densityHabKm2: 2400,
      internetCoveragePct: 93.8,
      basicServicesIndex: 94.0,
      primarySector: 'Educación Superior (Univalle/UMSS), Software & I+D',
    },
    narrativeEs: 'Conocida como la Ciudad Universitaria y de Software. Concentra campus universitarios privados y laboratorios de ingeniería de sistemas.',
    narrativeEn: 'Renowned as Cochabamba’s Software & University town. Houses engineering campuses, R&D labs, and tech incubators.',
  },
  {
    id: 'cbba-sacaba',
    name: 'Sacaba & Corredor Oriental',
    metroArea: 'Cochabamba',
    coordinates: [-17.400, -66.040],
    bounds: [
      [-17.380, -66.070],
      [-17.380, -66.010],
      [-17.420, -66.010],
      [-17.420, -66.070],
    ],
    metrics: {
      population2024: 215000,
      densityHabKm2: 3600,
      internetCoveragePct: 71.0,
      basicServicesIndex: 86.2,
      primarySector: 'Logística, Granos & Vivienda Social',
    },
    narrativeEs: 'Expansión urbana en el valle oriental con alta densidad poblacional y rápido crecimiento de proyectos habitacionales.',
    narrativeEn: 'Eastern valley urban expansion experiencing high population inflow and residential project developments.',
  },

  // --- LA PAZ / EL ALTO METRO ZONES ---
  {
    id: 'lpz-sopocachi',
    name: 'Sopocachi & Centro Gubernamental',
    metroArea: 'La Paz',
    coordinates: [-16.510, -68.130],
    bounds: [
      [-16.498, -68.142],
      [-16.498, -68.118],
      [-16.522, -68.118],
      [-16.522, -68.142],
    ],
    metrics: {
      population2024: 92000,
      densityHabKm2: 6100,
      internetCoveragePct: 92.4,
      basicServicesIndex: 98.5,
      primarySector: 'Gobierno Central, Embajadas, Consultoría & Cultura',
    },
    narrativeEs: 'Corazón administrativo y cultural de Bolivia. Alta pendiente topográfica integrada por líneas de transporte por cable (Mi Teleférico).',
    narrativeEn: 'Administrative and cultural core of Bolivia. Steep altitude topography connected seamlessly via Mi Teleférico cable car system.',
  },
  {
    id: 'lpz-calacoto',
    name: 'Calacoto & Zona Sur Commercial Hub',
    metroArea: 'La Paz',
    coordinates: [-16.540, -68.085],
    bounds: [
      [-16.525, -68.100],
      [-16.525, -68.070],
      [-16.555, -68.070],
      [-16.555, -68.100],
    ],
    metrics: {
      population2024: 128000,
      densityHabKm2: 3400,
      internetCoveragePct: 95.8,
      basicServicesIndex: 99.0,
      primarySector: 'Banca Corporativa, Comercio de Lujo & Startups',
    },
    narrativeEs: 'Valle residencial y financiero de menor altitud. Centro de servicios corporativos multinacionales e incubadoras tecnológicas.',
    narrativeEn: 'Lower altitude financial and residential valley. Prime location for corporate banks, international offices, and tech startups.',
  },
  {
    id: 'lpz-elalto-ceja',
    name: 'El Alto — La Ceja & Corredor 6 de Marzo',
    metroArea: 'La Paz',
    coordinates: [-16.505, -68.165],
    bounds: [
      [-16.490, -68.180],
      [-16.490, -68.150],
      [-16.520, -68.150],
      [-16.520, -68.180],
    ],
    metrics: {
      population2024: 410000,
      densityHabKm2: 8200,
      internetCoveragePct: 68.5,
      basicServicesIndex: 85.0,
      primarySector: 'Comercio Popular, Importaciones & Transporte',
    },
    narrativeEs: 'Hub neurálgico de intercambio comercial y transporte terrestre/aéreo a 4,000 msnm. Impresionante vitalidad económica de ferias populares.',
    narrativeEn: 'Commercial exchange and transport hub at 4,000m altitude. Dynamic informal economy and major highland trade center.',
  },
  {
    id: 'lpz-elalto-satelite',
    name: 'El Alto — Ciudad Satélite & Río Seco',
    metroArea: 'La Paz',
    coordinates: [-16.520, -68.155],
    bounds: [
      [-16.505, -68.168],
      [-16.505, -68.140],
      [-16.535, -68.140],
      [-16.535, -68.168],
    ],
    metrics: {
      population2024: 285000,
      densityHabKm2: 7100,
      internetCoveragePct: 74.2,
      basicServicesIndex: 88.5,
      primarySector: 'Servicios de Salud, Educación & Microindustria',
    },
    narrativeEs: 'Distrito residencial urbano en El Alto con infraestructura hospitalaria moderna y estaciones intermodales de transporte.',
    narrativeEn: 'Dense residential area in El Alto featuring modern hospital infrastructure and intermodal transit hubs.',
  },

  // --- NACIONAL (DEPARTAMENTAL) SCOPE ---
  {
    id: 'nac-santacruz',
    name: 'Santa Cruz (Departamento)',
    metroArea: 'Nacional',
    coordinates: [-17.80, -63.18],
    bounds: [
      [-16.0, -64.5],
      [-16.0, -60.0],
      [-20.0, -60.0],
      [-20.0, -64.5],
    ],
    metrics: {
      population2024: 3115000,
      densityHabKm2: 8.4,
      internetCoveragePct: 82.5,
      basicServicesIndex: 89.0,
      primarySector: 'Agroindustria, Gas, Comercio & Servicios',
    },
    narrativeEs: 'Departamento más poblado y motor económico agroindustrial de Bolivia. Concentra el 30% del PIB nacional y liderazgo exportador.',
    narrativeEn: 'Most populous department and agricultural powerhouse of Bolivia. Produces ~30% of GDP with leading export logistics.',
  },
  {
    id: 'nac-lapaz',
    name: 'La Paz (Departamento)',
    metroArea: 'Nacional',
    coordinates: [-16.50, -68.15],
    bounds: [
      [-14.0, -69.5],
      [-14.0, -66.8],
      [-18.0, -66.8],
      [-18.0, -69.5],
    ],
    metrics: {
      population2024: 3020000,
      densityHabKm2: 22.5,
      internetCoveragePct: 79.8,
      basicServicesIndex: 87.5,
      primarySector: 'Servicios Gubernamentales, Minería & Comercio',
    },
    narrativeEs: 'Sede de Gobierno con diversidad geográfica desde el Altiplano hasta los Yungas y Amazonía norte.',
    narrativeEn: 'Seat of government spanning diverse geographical regions from Altiplano highlands to tropical Yungas.',
  },
  {
    id: 'nac-cochabamba',
    name: 'Cochabamba (Departamento)',
    metroArea: 'Nacional',
    coordinates: [-17.38, -66.16],
    bounds: [
      [-16.0, -67.5],
      [-16.0, -64.5],
      [-18.5, -64.5],
      [-18.5, -67.5],
    ],
    metrics: {
      population2024: 2005000,
      densityHabKm2: 36.0,
      internetCoveragePct: 76.0,
      basicServicesIndex: 86.0,
      primarySector: 'Desarrollo de Software, Gastronomía & Energía',
    },
    narrativeEs: 'Corazón geográfico de Bolivia. Destaca como hub nacional de formación universitaria, ingeniería de software y generación hidroeléctrica.',
    narrativeEn: 'Geographic heart of Bolivia. Key national hub for university software talent, energy generation, and central logistics.',
  },
  {
    id: 'nac-oruro',
    name: 'Oruro (Departamento)',
    metroArea: 'Nacional',
    coordinates: [-17.98, -67.11],
    bounds: [
      [-17.0, -68.5],
      [-17.0, -66.5],
      [-19.5, -66.5],
      [-19.5, -68.5],
    ],
    metrics: {
      population2024: 570000,
      densityHabKm2: 10.6,
      internetCoveragePct: 69.2,
      basicServicesIndex: 81.0,
      primarySector: 'Comercio Aduanero, Minería & Folclore',
    },
    narrativeEs: 'Puerto seco comercial de conexión biocéanica con Chile y tradición minera milenaria.',
    narrativeEn: 'Highland trade hub connecting Bolivia with Pacific ports in Chile alongside rich mining heritage.',
  },
  {
    id: 'nac-potosi',
    name: 'Potosí (Departamento)',
    metroArea: 'Nacional',
    coordinates: [-19.58, -65.75],
    bounds: [
      [-18.5, -68.0],
      [-18.5, -64.8],
      [-22.0, -64.8],
      [-22.0, -68.0],
    ],
    metrics: {
      population2024: 875000,
      densityHabKm2: 7.4,
      internetCoveragePct: 61.5,
      basicServicesIndex: 74.0,
      primarySector: 'Litio, Minería Evaporítica & Turismo (Salar)',
    },
    narrativeEs: 'Hogar de las mayores reservas mundiales de Litio en el Salar de Uyuni y patrimonio histórico de la minería global.',
    narrativeEn: 'Home to the world’s largest lithium reserves in Uyuni Salt Flat and historic silver mining landmarks.',
  },
  {
    id: 'nac-tarija',
    name: 'Tarija (Departamento)',
    metroArea: 'Nacional',
    coordinates: [-21.53, -64.73],
    bounds: [
      [-20.5, -65.5],
      [-20.5, -62.5],
      [-23.0, -62.5],
      [-23.0, -65.5],
    ],
    metrics: {
      population2024: 600000,
      densityHabKm2: 16.0,
      internetCoveragePct: 75.4,
      basicServicesIndex: 88.0,
      primarySector: 'Hidrocarburos, Vitivinicultura & Turismo',
    },
    narrativeEs: 'Valle del sur boliviano, centro de extracción de gas natural y principal productor vitivinícola de vinos de altura.',
    narrativeEn: 'Southern valley rich in natural gas reserves and high-altitude wine and singani production.',
  },
  {
    id: 'nac-chuquisaca',
    name: 'Chuquisaca (Sucre)',
    metroArea: 'Nacional',
    coordinates: [-19.04, -65.26],
    bounds: [
      [-18.2, -65.8],
      [-18.2, -63.5],
      [-21.0, -63.5],
      [-21.0, -65.8],
    ],
    metrics: {
      population2024: 660000,
      densityHabKm2: 12.8,
      internetCoveragePct: 70.8,
      basicServicesIndex: 82.5,
      primarySector: 'Capital Histórica, Poder Judicial & Cemento',
    },
    narrativeEs: 'Capital Constitucional de Bolivia, sede del Órgano Judicial y patrimonio arquitectónico colonial con tradición universitaria.',
    narrativeEn: 'Constitutional capital of Bolivia, housing the Judicial Branch and colonial historic monuments.',
  },
  {
    id: 'nac-beni',
    name: 'Beni (Trinidad)',
    metroArea: 'Nacional',
    coordinates: [-14.83, -64.90],
    bounds: [
      [-11.5, -67.5],
      [-11.5, -62.5],
      [-16.0, -62.5],
      [-16.0, -67.5],
    ],
    metrics: {
      population2024: 525000,
      densityHabKm2: 2.4,
      internetCoveragePct: 58.0,
      basicServicesIndex: 71.0,
      primarySector: 'Ganadería Extensiva, Pesca & Amazonía',
    },
    narrativeEs: 'Vasta llanura amazónica con potencial ganadero ecológico y riqueza hídrica de ríos navegables.',
    narrativeEn: 'Vast Amazon plains featuring extensive cattle ranching and navigable river transport routes.',
  },
  {
    id: 'nac-pando',
    name: 'Pando (Cobija)',
    metroArea: 'Nacional',
    coordinates: [-11.03, -68.77],
    bounds: [
      [-9.5, -69.8],
      [-9.5, -66.5],
      [-12.5, -66.5],
      [-12.5, -69.8],
    ],
    metrics: {
      population2024: 165000,
      densityHabKm2: 2.6,
      internetCoveragePct: 64.0,
      basicServicesIndex: 73.5,
      primarySector: 'Castaña Amazónica, Madera & Comercio Fronterizo (Brasil)',
    },
    narrativeEs: 'Departamento septentrional amazónico con zona franca de frontera comercial con Brasil y recolección de castaña orgánica.',
    narrativeEn: 'Northernmost tropical rainforest department with Brazil cross-border trade zone and organic Brazil nut harvesting.',
  },
];
