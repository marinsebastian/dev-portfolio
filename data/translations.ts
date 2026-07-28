export interface TranslationDictionary {
  nav: {
    overview: string;
    flagship: string;
    flagshipBadge: string;
    projects: string;
    stack: string;
    cv: string;
    contact: string;
    downloadCv: string;
    operationalStatus: string;
  };
  hero: {
    titleStart: string;
    titleAccent: string;
    headlineEs: string;
    headlineEn: string;
    launchGeo: string;
    launchGeoMicrocopy: string;
    viewProjects: string;
    cvPdf: string;
    badgeNext: string;
    badgePhp: string;
    badgeGis: string;
    badgeLinux: string;
    telemetryTitle: string;
    telemetryDegree: string;
    telemetryDegreeLabel: string;
    telemetryWork: string;
    telemetryWorkLabel: string;
    telemetrySpecialty: string;
    telemetrySpecialtyLabel: string;
    telemetryQaLabel: string;
    telemetryQaValue: string;
    telemetryDeployLabel: string;
    telemetryDeployValue: string;
    telemetryStatus: string;
  };
  proofStrip: {
    title: string;
  };
  pillars: {
    tag: string;
    title: string;
    subtitle: string;
    verifiedPattern: string;
    keyTechnologies: string;
    implementationSample: string;
    liveDemo: string;
  };
  flagship: {
    badge: string;
    liveMapBadge: string;
    title: string;
    subtitle: string;
    summary: string;
    activeRegion: string;
    runAi: string;
    aiLoading: string;
    population: string;
    area: string;
    connectivity: string;
    infrastructure: string;
    sectors: string;
    comparisonTitle: string;
    relevanceTitle: string;
    proofTitle: string;
    scopeLabel: string;
    layerLabel: string;
    sourceAttribution: string;
    scopeNacional: string;
    scopeSantaCruz: string;
    scopeCochabamba: string;
    scopeLaPaz: string;
    scopeOtherDepartments: string;
    layerDensity: string;
    layerTechConn: string;
    layerHousingServices: string;
    layerEconomicHubs: string;
    densityBadge: string;
    connectivityBadge: string;
    servicesBadge: string;
    sectorBadge: string;
    aiPromptLabel: string;
    aiHeaderTitle: string;
    activeZone: string;
    legendTitle: string;
    legendCurrentView: string;
    geoBoliviaTitle: string;
    geoBoliviaProvider: string;
    geoBoliviaDesc: string;
    datasetBannerTitle: string;
    datasetBannerDesc: string;
    scopeSelectorLabel: string;
    atlasLinkLabel: string;
    legendLayerTitle: string;
    blocksInViewSuffix: string;
    metricMin: string;
    metricMedian: string;
    metricTop10: string;
    metricMax: string;
    zonesSuffix: string;
    centerOnMe: string;
    thresholdActive: string;
    thresholdClear: string;
    provenanceNote: string;
    zoomNoticeTitle: string;
    zoomNoticeBody: string;
    zoomNoticeAction: string;
    thresholdMinLabel: string;
    thresholdMaxLabel: string;
    thresholdApply: string;
    blockInspectorTitle: string;
    blockInspectorSubtitle: string;
    blockIndexNote: string;
    blockPopulationLabel: string;
    blockDensityLabel: string;
    blockInternetLabel: string;
    blockWaterLabel: string;
    blockEducationLabel: string;
    blockHealthInsuranceLabel: string;
    blockInfoLabel: string;
    blockClose: string;
    aiNoBlockSelected: string;
    aiTriggerLabel: string;
    aiTriggerExpanded: string;
    aiTriggerTooltip: string;
  };
  caseStudies: {
    tag: string;
    title: string;
    subtitle: string;
    problemTitle: string;
    solutionTitle: string;
    stackTitle: string;
    proofTitle: string;
    relevanceTitle: string;
    codeSampleTitle: string;
  };
  techStack: {
    tag: string;
    title: string;
    subtitle: string;
  };
  workflow: {
    tag: string;
    title: string;
    subtitle: string;
    qaVerified: string;
    qaDescription: string;
  };
  cv: {
    tag: string;
    title: string;
    subtitle: string;
    previewPdf: string;
    downloadPdf: string;
    copyEmail: string;
    emailCopied: string;
    tabProfile: string;
    tabExperience: string;
    tabSkills: string;
    tabEducation: string;
    summaryEsTitle: string;
    summaryEnTitle: string;
    academicTitle: string;
    certsTitle: string;
    languagesTitle: string;
    officialDoc: string;
  };
  contact: {
    tag: string;
    title: string;
    subtitle: string;
    directTitle: string;
    emailLabel: string;
    phoneLabel: string;
    locationLabel: string;
    githubLabel: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendButton: string;
    sentSuccess: string;
    sentSuccessDesc: string;
    formNote: string;
    reopenMailClient: string;
    revealPhone: string;
  };
  footer: {
    tagline: string;
    builtWith: string;
    location: string;
  };
  copilot: {
    title: string;
    trigger: string;
    focusedTitle: string;
    exitFocused: string;
    providerLabel: string;
    noProvider: string;
    reset: string;
    send: string;
    placeholder: string;
    thinking: string;
    intro: string;
    introTools: string;
  };
  geo: {
    title: string;
    body: string;
    privacy: string;
    allow: string;
    approximate: string;
    dismiss: string;
    errorFallback: string;
    sourceGps: string;
    sourceIp: string;
    unknownPlace: string;
  };
  micro: {
    telemetryTitle: string;
    telemetryLive: string;
    telemetryFps: string;
    telemetrySession: string;
    telemetryClicks: string;
    telemetryLatency: string;
    telemetryNote: string;
    apiTitle: string;
    apiEndpoint: string;
    apiSend: string;
    apiHint: string;
    spatialTitle: string;
    spatialDepartment: string;
    spatialSource: string;
    spatialCoords: string;
    spatialAccuracy: string;
    spatialCityLevel: string;
    spatialNote: string;
    terminalTitle: string;
    terminalRun: string;
    terminalRunning: string;
    terminalIdle: string;
    terminalNote: string;
  };
  runner: {
    title: string;
    run: string;
    running: string;
    passed: string;
    note: string;
  };
}

export type TranslationKey = keyof TranslationDictionary;

export const TRANSLATIONS: Record<'es' | 'en', TranslationDictionary> = {
  es: {
    nav: {
      overview: "Visión General",
      flagship: "GeoInsights Bolivia",
      flagshipBadge: "Destacado",
      projects: "Casos de Estudio",
      stack: "Herramientas",
      cv: "CV & Resume",
      contact: "Contacto",
      downloadCv: "Descargar CV (PDF)",
      operationalStatus: "DISPONIBLE / OPERATIVO"
    },
    hero: {
      titleStart: "Desarrollador Full-Stack enfocado en ",
      titleAccent: "Interfaces, APIs, Datos Espaciales y Automatización",
      headlineEs: "“Construyo sistemas web que convierten datos, APIs, información espacial y procesos en herramientas operativas simples de usar.”",
      headlineEn: "“I build web systems that turn complex data, APIs, spatial information, and workflows into simple, operational tools.”",
      launchGeo: "Ver GeoInsights: Mapa + IA",
      launchGeoMicrocopy: "Mapa interactivo con datos reales del Censo 2024 y un copiloto de IA que responde en lenguaje natural.",
      viewProjects: "Ver Casos de Estudio",
      cvPdf: "Descargar CV",
      badgeNext: "Next.js & TypeScript",
      badgePhp: "PHP 8 & cURL REST",
      badgeGis: "MapLibre GL & PMTiles",
      badgeLinux: "CLI Linux & Cron Jobs",
      telemetryTitle: "RESUMEN PROFESIONAL",
      telemetryDegree: "Ingeniero de Sistemas (UMSS 2024)",
      telemetryDegreeLabel: "TITULACIÓN PROFESIONAL",
      telemetryWork: "Awtu Commerce (BCP QR, Gemini API, Next.js)",
      telemetryWorkLabel: "EXPERIENCIA COMERCIAL REAL",
      telemetrySpecialty: "Interfaces Web, APIs REST, Mapas Espaciales e IA",
      telemetrySpecialtyLabel: "ESPECIALIDAD TÉCNICA",
      telemetryQaLabel: "PRUEBAS AUTOMATIZADAS",
      telemetryQaValue: "Playwright E2E",
      telemetryDeployLabel: "DESPLIEGUE",
      telemetryDeployValue: "Vercel & Docker",
      telemetryStatus: "DISPONIBLE PARA ENTREVISTAS"
    },
    proofStrip: {
      title: "PRUEBAS TÉCNICAS CLAVE:"
    },
    pillars: {
      tag: "ARQUITECTURA DE SISTEMAS",
      title: "Lo Que Construyo: Sistemas Web Operativos",
      subtitle: "Desarrollo de interfaces responsivas, servicios backend REST, visualizadores de datos espaciales y automatización de procesos.",
      verifiedPattern: "PATRÓN VERIFICADO",
      keyTechnologies: "TECNOLOGÍAS CLAVE:",
      implementationSample: "EJEMPLO DE IMPLEMENTACIÓN:",
      liveDemo: "MICRO-APP EN VIVO:"
    },
    flagship: {
      badge: "PROYECTO DESTACADO GIS Y DATOS",
      liveMapBadge: "Mapa interactivo en vivo",
      title: "GeoInsights Bolivia",
      subtitle: "Plataforma de Exploración de Datos Públicos y Mapeo Espacial Interactivo",
      summary: "Panel de mapas interactivos que transforma datos socio-demográficos y urbanos de Bolivia en una consola de análisis visual.",
      activeRegion: "REGIÓN ACTIVA:",
      runAi: "Ejecutar Análisis IA Gemini",
      aiLoading: "Consultando API Gemini...",
      population: "POBLACIÓN ESTIMADA",
      area: "SUPERFICIE TERRITORIAL",
      connectivity: "ÍNDICE DE CONECTIVIDAD",
      infrastructure: "INFRAESTRUCTURA URBANA",
      sectors: "SECTORES CLAVE:",
      comparisonTitle: "COMPARATIVA DE ZONAS URBANAS",
      relevanceTitle: "Relevancia para el Rol Full-Stack",
      proofTitle: "Puntos de Prueba Técnica",
      scopeLabel: "NIVEL DE COBERTURA ESPACIAL:",
      layerLabel: "CAPA CENSAL 2024 / URBANA:",
      sourceAttribution: "Inspirado en datos abiertos de Mauricio Foronda (@mauforonda — Censo 2024, Atlas Urbano & Geodatos)",
      scopeNacional: "Bolivia",
      scopeSantaCruz: "Santa Cruz",
      scopeCochabamba: "Cochabamba",
      scopeLaPaz: "La Paz",
      scopeOtherDepartments: "Otros departamentos",
      layerDensity: "Densidad Censo 2024",
      layerTechConn: "Conectividad Digital & Fibra",
      layerHousingServices: "Servicios Básicos & Vivienda",
      layerEconomicHubs: "Nodos Económicos e Industriales",
      densityBadge: "DENSIDAD POBLACIONAL",
      connectivityBadge: "COBERTURA INTERNET/FIBRA",
      servicesBadge: "ÍNDICE SERVICIOS BÁSICOS",
      sectorBadge: "SECTOR PREDOMINANTE",
      aiPromptLabel: "Analizar zona urbana con Gemini API",
      aiHeaderTitle: "RESUMEN ESPACIAL GEMINI AI (CENSO 2024)",
      activeZone: "ZONA URBANA SELECCIONADA:",
      legendTitle: "ESCALA DE INTENSIDAD",
      legendCurrentView: "Vista actual — máx.",
      geoBoliviaTitle: "Límite Referencial Departamentos del Estado Plurinacional de Bolivia 2015",
      geoBoliviaProvider: "GeoBolivia / Viceministerio de Autonomías (339 Municipios)",
      geoBoliviaDesc: "Muestra la división política-administrativa de los 9 departamentos de Bolivia, entidades subnacionales mayores en las que se subdivide el territorio del Estado Plurinacional, que cuentan con autonomía reconocida a nivel ejecutivo y legislativo. Dato referencial de GeoBolivia y Censo 2024 de Mauricio Foronda (@mauforonda).",
      datasetBannerTitle: "Manzanos Reales INE — Censo 2024 (Flujo Vectorial PMTiles)",
      datasetBannerDesc: "Consume directamente los archivos vectoriales PMTiles publicados por Mauricio Foronda (@mauforonda) a partir del Censo de Población y Vivienda 2024 del INE Bolivia. El archivo contiene 247.346 manzanos urbanos con su geometría irregular real y 28 indicadores censales por manzano.",
      scopeSelectorLabel: "ALCANCE ESPACIAL (MANZANOS REALES PMTILES):",
      atlasLinkLabel: "Atlas Urbano Censo 2024 (@mauforonda)",
      legendLayerTitle: "MANZANOS REALES INE (PMTILES)",
      blocksInViewSuffix: "MANZANOS",
      metricMin: "Mínimo",
      metricMedian: "Mediana",
      metricTop10: "Top 10%",
      metricMax: "Máximo",
      zonesSuffix: "ZONAS",
      centerOnMe: "Centrar en mi ubicación",
      thresholdActive: "Filtro activo:",
      thresholdClear: "Quitar filtro",
      provenanceNote: "Los polígonos y los indicadores por manzano provienen del archivo PMTiles del Censo 2024 (haz clic en un manzano para verlos). Las cifras agregadas de esta tarjeta son referencias ilustrativas de zona, no lecturas oficiales del INE.",
      zoomNoticeTitle: "SIN COBERTURA DE MANZANOS EN ESTE NIVEL DE ZOOM",
      zoomNoticeBody: "El archivo PMTiles del Censo 2024 se genera desde el nivel de zoom 8. En la vista nacional solo se muestra el mapa base.",
      zoomNoticeAction: "Acercar a los manzanos",
      thresholdMinLabel: "Mín",
      thresholdMaxLabel: "Máx (opcional)",
      thresholdApply: "Aplicar filtro",
      blockInspectorTitle: "MANZANO SELECCIONADO",
      blockInspectorSubtitle: "MANZANO REAL — CENSO 2024 INE",
      blockIndexNote: "Valores leídos directamente del archivo PMTiles del Censo 2024: población y densidad son conteos absolutos por manzano; los porcentajes son proporciones de vivienda del propio archivo.",
      blockPopulationLabel: "Población",
      blockDensityLabel: "Densidad",
      blockInternetLabel: "Internet/TIC",
      blockWaterLabel: "Agua por cañería",
      blockEducationLabel: "Educación superior",
      blockHealthInsuranceLabel: "Seguro privado",
      blockInfoLabel: "¿De dónde vienen estos datos?",
      blockClose: "Cerrar selección",
      aiNoBlockSelected: "Selecciona un manzano en el mapa para incluir sus indicadores en el análisis.",
      aiTriggerLabel: "IA",
      aiTriggerExpanded: "Modo",
      aiTriggerTooltip: "Modo enfocado: pregunta al copiloto y explora el mapa por conversación."
    },
    caseStudies: {
      tag: "EJECUCIÓN TÉCNICA DEMOSTRADA",
      title: "Casos de Estudio y Proyectos Destacados",
      subtitle: "Plataformas comerciales reales, software operativo universitario, microservicios PHP y laboratorios espaciales.",
      problemTitle: "PROBLEMA Y DESAFÍO",
      solutionTitle: "SOLUCIÓN DESARROLLADA",
      stackTitle: "TECNOLOGÍAS UTILIZADAS:",
      proofTitle: "Puntos Clave de Prueba Técnica",
      relevanceTitle: "RELEVANCIA PARA EL EQUIPO DE INGENIERÍA:",
      codeSampleTitle: "MUESTRA DE CÓDIGO EN PRODUCCIÓN:"
    },
    techStack: {
      tag: "MATRIZ TÉCNICA DE HERRAMIENTAS",
      title: "Experiencia en Herramientas y Stack de Ingeniería",
      subtitle: "Desglose verificado de competencias en frontend, backend, bases de datos, administración Linux y datos espaciales con IA."
    },
    workflow: {
      tag: "RIGOR DE AUTOMATIZACIÓN Y QA",
      title: "Hábitos de Ingeniería y Automatización",
      subtitle: "Escribo código limpio y documentado respaldado por pruebas automatizadas, entornos dockerizados y scripts en segundo plano.",
      qaVerified: "GARANTÍA DE CALIDAD VERIFICADA",
      qaDescription: "Las pruebas de Playwright validan interfaces responsivas y endpoints de API localmente antes de cada despliegue."
    },
    cv: {
      tag: "CURRICULUM VITAE",
      title: "Curriculum Vitae — Sebastian Marin",
      subtitle: "Ingeniero de Sistemas & Desarrollador Fullstack. Explore las pestañas a continuación o descargue el documento PDF oficial.",
      previewPdf: "Previsualizar Documento PDF",
      downloadPdf: "Descargar PDF",
      copyEmail: "Copiar Correo",
      emailCopied: "¡Correo Copiado!",
      tabProfile: "Perfil Profesional",
      tabExperience: "Experiencia Laboral",
      tabSkills: "Competencias Técnicas",
      tabEducation: "Educación & Cursos",
      summaryEsTitle: "Resumen Profesional (Español)",
      summaryEnTitle: "Professional Summary (English)",
      academicTitle: "Formación Académica",
      certsTitle: "Cursos y Certificaciones Relevantes",
      languagesTitle: "Idiomas",
      officialDoc: "DOCUMENTO OFICIAL"
    },
    contact: {
      tag: "CONTACTO DIRECTO",
      title: "Construyamos Sistemas Confiables",
      subtitle: "Disponible para roles de desarrollo full-stack enfocado en interfaces, APIs, datos espaciales y automatización.",
      directTitle: "Telemetría de Contacto Directo",
      emailLabel: "CORREO ELECTRÓNICO",
      phoneLabel: "TELÉFONO / WHATSAPP",
      locationLabel: "UBICACIÓN PRINCIPAL",
      githubLabel: "PERFIL GITHUB",
      formTitle: "Mensaje Directo al Desarrollador",
      nameLabel: "NOMBRE O EMPRESA",
      namePlaceholder: "Ej. Líder de Ingeniería / Reclutador",
      emailPlaceholder: "nombre@empresa.com",
      messageLabel: "DETALLES DE LA CONSULTA O ROL",
      messagePlaceholder: "Describa la oportunidad o consulta técnica...",
      sendButton: "ABRIR EN MI CLIENTE DE CORREO",
      sentSuccess: "BORRADOR ABIERTO EN TU CLIENTE DE CORREO",
      sentSuccessDesc: "Este sitio es estático y no tiene servidor de correo: el formulario prepara el mensaje y lo abre en tu aplicación de correo. Revísalo y pulsa enviar allí. Si no se abrió, escribe directamente a marinsebastian143@gmail.com.",
      formNote: "Este formulario no envía nada por sí solo: arma un borrador y lo abre en tu cliente de correo para que tú lo envíes.",
      reopenMailClient: "Volver a abrir el borrador",
      revealPhone: "Mostrar el número de teléfono"
    },
    footer: {
      tagline: "Consola de Ingeniería Operativa v1.0",
      builtWith: "Construido con Next.js 16, TypeScript, Tailwind CSS, MapLibre GL, Leaflet y Framer Motion",
      location: "Cochabamba, Bolivia"
    },
    copilot: {
      title: "Copiloto del Mapa",
      trigger: "Abrir Copiloto IA del Mapa",
      focusedTitle: "Consola Enfocada — Mapa + Copiloto",
      exitFocused: "Salir",
      providerLabel: "Proveedor de IA",
      noProvider: "SIN PROVEEDOR",
      reset: "Reiniciar conversación",
      send: "Enviar mensaje",
      placeholder: "Pregunta sobre los manzanos del Censo 2024…",
      thinking: "Consultando…",
      intro: "Puedo leer el mapa y también moverlo: cambiar de capa, volar a una zona o filtrar manzanos por umbral. Pregúntame en lenguaje natural.",
      introTools: "Los indicadores por manzano provienen del archivo PMTiles del Censo 2024. Las tarjetas de resumen por zona son referencias ilustrativas.",
    },
    geo: {
      title: "Centrar el visor en tu zona",
      body: "Solicitamos acceso a tu ubicación únicamente para centrar el visor del Censo 2024 en tu departamento y barrio actual.",
      privacy: "Tu ubicación exacta no sale del navegador: sólo se usa para mover la cámara del mapa. No la enviamos a ningún servidor ni la almacenamos.",
      allow: "Permitir Ubicación",
      approximate: "Usar Ubicación Aproximada",
      dismiss: "Cerrar",
      errorFallback: "No pudimos determinar tu ubicación. Puedes seguir eligiendo la ciudad manualmente.",
      sourceGps: "GPS del navegador",
      sourceIp: "aproximada por IP",
      unknownPlace: "Ubicación desconocida",
    },
    micro: {
      telemetryTitle: "Telemetría de esta página",
      telemetryLive: "en vivo",
      telemetryFps: "Cuadros/s",
      telemetrySession: "Sesión",
      telemetryClicks: "Clics",
      telemetryLatency: "Latencia API",
      telemetryNote: "Medido en tu navegador con Navigation Timing y requestAnimationFrame.",
      apiTitle: "Probador de API REST",
      apiEndpoint: "Endpoint",
      apiSend: "Enviar",
      apiHint: "Elige un endpoint y pulsa Enviar: la petición sale de tu navegador hacia las rutas reales de este sitio.",
      spatialTitle: "Tu ubicación en el mapa",
      spatialDepartment: "Departamento",
      spatialSource: "Origen del dato",
      spatialCoords: "Coordenadas",
      spatialAccuracy: "Precisión",
      spatialCityLevel: "nivel ciudad",
      spatialNote: "La ubicación por IP se resuelve en el servidor para que ningún tercero vea tu dirección junto al referente de este sitio.",
      terminalTitle: "Consola de sincronización",
      terminalRun: "Reproducir sesión",
      terminalRunning: "Ejecutando…",
      terminalIdle: "Pulsa «Reproducir sesión» para ver la ejecución del cron y el estado de los contenedores.",
      terminalNote: "Transcripción grabada de una ejecución real de cron_sync.php. No es una shell remota: este panel no ejecuta comandos.",
    },
    runner: {
      title: "Runner de pruebas E2E",
      run: "Ejecutar pruebas",
      running: "Ejecutando…",
      passed: "pasaron",
      note: "Reproduce la suite real de tests/smoke.spec.ts.",
    }
  },
  en: {
    nav: {
      overview: "Overview",
      flagship: "GeoInsights Bolivia",
      flagshipBadge: "Featured",
      projects: "Case Studies",
      stack: "Stack & Tools",
      cv: "CV & Resume",
      contact: "Contact",
      downloadCv: "Download CV (PDF)",
      operationalStatus: "AVAILABLE / OPERATIONAL"
    },
    hero: {
      titleStart: "Full-Stack Developer focused on ",
      titleAccent: "Interfaces, APIs, Spatial Data & Automation",
      headlineEs: "“I build web systems that turn complex data, APIs, spatial information, and workflows into simple, operational tools.”",
      headlineEn: "“I build web systems that turn complex data, APIs, spatial information, and workflows into simple, operational tools.”",
      launchGeo: "View GeoInsights: Map + AI",
      launchGeoMicrocopy: "Interactive map with real 2024 Census data and an AI copilot that answers in plain language.",
      viewProjects: "View Case Studies",
      cvPdf: "Download CV",
      badgeNext: "Next.js & TypeScript",
      badgePhp: "PHP 8 & cURL REST",
      badgeGis: "MapLibre GL & PMTiles",
      badgeLinux: "Linux CLI & Cron Jobs",
      telemetryTitle: "PROFESSIONAL SUMMARY",
      telemetryDegree: "Systems Engineer (UMSS 2024)",
      telemetryDegreeLabel: "PROFESSIONAL DEGREE",
      telemetryWork: "Awtu Commerce (BCP QR, Gemini API, Next.js)",
      telemetryWorkLabel: "REAL COMMERCIAL EXPERIENCE",
      telemetrySpecialty: "Web Interfaces, REST APIs, Spatial Maps & AI",
      telemetrySpecialtyLabel: "TECHNICAL SPECIALTY",
      telemetryQaLabel: "AUTOMATED TESTING",
      telemetryQaValue: "Playwright E2E",
      telemetryDeployLabel: "DEPLOYMENT",
      telemetryDeployValue: "Vercel & Docker",
      telemetryStatus: "AVAILABLE FOR INTERVIEWS"
    },
    proofStrip: {
      title: "CORE TECHNICAL PROOF:"
    },
    pillars: {
      tag: "SYSTEMS ARCHITECTURE",
      title: "What I Build: Operational Web Systems",
      subtitle: "Building responsive frontends, REST backend microservices, spatial data visualizers, and process automation.",
      verifiedPattern: "VERIFIED PATTERN",
      keyTechnologies: "KEY TECHNOLOGIES:",
      implementationSample: "IMPLEMENTATION SAMPLE:",
      liveDemo: "LIVE MICRO-APP:"
    },
    flagship: {
      badge: "FLAGSHIP GIS & DATA EXPLORER",
      liveMapBadge: "Live interactive map",
      title: "GeoInsights Bolivia",
      subtitle: "Public Data Exploration Platform & Interactive Spatial Mapping",
      summary: "Interactive map dashboard transforming Bolivian socio-demographic and urban public datasets into a visual analysis console.",
      activeRegion: "ACTIVE REGION:",
      runAi: "Run Gemini AI Analysis",
      aiLoading: "Querying Gemini API...",
      population: "ESTIMATED POPULATION",
      area: "LAND AREA",
      connectivity: "CONNECTIVITY INDEX",
      infrastructure: "URBAN INFRASTRUCTURE",
      sectors: "KEY SECTORS:",
      comparisonTitle: "URBAN ZONE COMPARISON",
      relevanceTitle: "Relevance for Full-Stack Role",
      proofTitle: "Technical Proof Points",
      scopeLabel: "SPATIAL SCOPE LEVEL:",
      layerLabel: "2024 CENSUS / URBAN LAYER:",
      sourceAttribution: "Inspired by open datasets from Mauricio Foronda (@mauforonda — 2024 Census, Atlas Urbano & Geodatos)",
      scopeNacional: "Bolivia",
      scopeSantaCruz: "Santa Cruz",
      scopeCochabamba: "Cochabamba",
      scopeLaPaz: "La Paz",
      scopeOtherDepartments: "Other departments",
      layerDensity: "2024 Density Layer",
      layerTechConn: "Digital & Fiber Connectivity",
      layerHousingServices: "Basic Services & Housing",
      layerEconomicHubs: "Economic & Industrial Hubs",
      densityBadge: "POPULATION DENSITY",
      connectivityBadge: "INTERNET/FIBER COVERAGE",
      servicesBadge: "BASIC SERVICES INDEX",
      sectorBadge: "PRIMARY ECONOMIC SECTOR",
      aiPromptLabel: "Analyze urban zone with Gemini API",
      aiHeaderTitle: "GEMINI AI SPATIAL SUMMARY (2024 CENSUS)",
      activeZone: "SELECTED URBAN ZONE:",
      legendTitle: "METRIC INTENSITY SCALE",
      legendCurrentView: "Current view — max",
      geoBoliviaTitle: "Referential Boundary of Departments of the Plurinational State of Bolivia 2015",
      geoBoliviaProvider: "GeoBolivia / Viceministerio de Autonomías (339 Municipalities)",
      geoBoliviaDesc: "Displays the political-administrative division of the 9 departments of Bolivia, major subnational entities with executive and legislative autonomy. Sourced from GeoBolivia referential datasets & Mauricio Foronda (@mauforonda) 2024 Census open data.",
      datasetBannerTitle: "Real INE City Blocks — 2024 Census (PMTiles Vector Stream)",
      datasetBannerDesc: "Streams the PMTiles vector archive published by Mauricio Foronda (@mauforonda) from Bolivia's INE 2024 Population and Housing Census. The archive holds 247,346 urban blocks with their real irregular geometry and 28 census indicators per block.",
      scopeSelectorLabel: "SPATIAL SCOPE (REAL PMTILES BLOCKS):",
      atlasLinkLabel: "Atlas Urbano 2024 Census (@mauforonda)",
      legendLayerTitle: "REAL INE BLOCKS (PMTILES)",
      blocksInViewSuffix: "BLOCKS",
      metricMin: "Minimum",
      metricMedian: "Median",
      metricTop10: "Top 10%",
      metricMax: "Maximum",
      zonesSuffix: "ZONES",
      centerOnMe: "Center on my location",
      thresholdActive: "Active filter:",
      thresholdClear: "Clear filter",
      provenanceNote: "Polygons and per-block indicators come from the 2024 Census PMTiles archive (click a block to see them). The aggregate figures on this card are illustrative zone references, not official INE readings.",
      zoomNoticeTitle: "NO BLOCK COVERAGE AT THIS ZOOM LEVEL",
      zoomNoticeBody: "The 2024 Census PMTiles archive is generated from zoom level 8 upward. The national view shows the base map only.",
      zoomNoticeAction: "Zoom in to the blocks",
      thresholdMinLabel: "Min",
      thresholdMaxLabel: "Max (optional)",
      thresholdApply: "Apply filter",
      blockInspectorTitle: "SELECTED BLOCK",
      blockInspectorSubtitle: "REAL CITY BLOCK — 2024 INE CENSUS",
      blockIndexNote: "Read straight from the 2024 Census PMTiles archive: population and density are absolute per-block counts; the percentages are household proportions carried in the archive itself.",
      blockPopulationLabel: "Population",
      blockDensityLabel: "Density",
      blockInternetLabel: "Internet/ICT",
      blockWaterLabel: "Piped water",
      blockEducationLabel: "Higher education",
      blockHealthInsuranceLabel: "Private insurance",
      blockInfoLabel: "Where does this data come from?",
      blockClose: "Close selection",
      aiNoBlockSelected: "Select a block on the map to include its indicators in the analysis.",
      aiTriggerLabel: "AI",
      aiTriggerExpanded: "Cockpit",
      aiTriggerTooltip: "Focused Mode: ask the copilot and explore the map by conversation."
    },
    caseStudies: {
      tag: "PROVEN TECHNICAL EXECUTION",
      title: "Featured Case Studies & Projects",
      subtitle: "Real commercial platforms, university operational software, PHP microservices, and interactive spatial labs.",
      problemTitle: "PROBLEM & CHALLENGE",
      solutionTitle: "ENGINEERED SOLUTION",
      stackTitle: "TECHNOLOGY STACK:",
      proofTitle: "Key Technical Proof Points",
      relevanceTitle: "RELEVANCE FOR ENGINEERING ROLE:",
      codeSampleTitle: "PRODUCTION CODE SAMPLE:"
    },
    techStack: {
      tag: "TECHNICAL MATRIX",
      title: "Engineering Tooling & Stack Experience",
      subtitle: "Honest, verified breakdown of tech proficiency across frontend, backend, databases, Linux administration, and spatial AI."
    },
    workflow: {
      tag: "AUTOMATION & QA RIGOR",
      title: "Engineering Habits & Automation",
      subtitle: "I write clean, documented code backed by automated testing, containerized setups, and cron-driven background scripts.",
      qaVerified: "QUALITY ASSURANCE VERIFIED",
      qaDescription: "Playwright tests validate responsive layouts and API endpoints locally before deployment."
    },
    cv: {
      tag: "CURRICULUM VITAE",
      title: "Curriculum Vitae — Sebastian Marin",
      subtitle: "Systems Engineer & Full-Stack Developer. Explore resume tabs below or inspect/download the official PDF document.",
      previewPdf: "Preview PDF Document",
      downloadPdf: "Download PDF",
      copyEmail: "Copy Email",
      emailCopied: "Email Copied!",
      tabProfile: "Professional Profile",
      tabExperience: "Work Experience",
      tabSkills: "Technical Skills",
      tabEducation: "Education & Courses",
      summaryEsTitle: "Professional Summary (Spanish)",
      summaryEnTitle: "Professional Summary (English)",
      academicTitle: "Academic Education",
      certsTitle: "Relevant Courses & Certifications",
      languagesTitle: "Languages",
      officialDoc: "OFFICIAL DOCUMENT"
    },
    contact: {
      tag: "DIRECT CONTACT",
      title: "Let's Build Reliable Systems Together",
      subtitle: "Available for full-stack engineering roles focused on interfaces, APIs, spatial data, and process automation.",
      directTitle: "Direct Contact Telemetry",
      emailLabel: "EMAIL ADDRESS",
      phoneLabel: "PHONE / WHATSAPP",
      locationLabel: "PRIMARY LOCATION",
      githubLabel: "GITHUB PROFILE",
      formTitle: "Direct Console Message",
      nameLabel: "YOUR NAME OR COMPANY",
      namePlaceholder: "e.g. Engineering Lead / Recruiter",
      emailPlaceholder: "name@company.com",
      messageLabel: "INQUIRY OR ROLE DETAILS",
      messagePlaceholder: "Describe role opportunities or technical inquiry...",
      sendButton: "OPEN IN MY EMAIL CLIENT",
      sentSuccess: "DRAFT OPENED IN YOUR EMAIL CLIENT",
      sentSuccessDesc: "This is a static site with no mail server: the form composes the message and opens it in your email application. Review it and hit send there. If nothing opened, write directly to marinsebastian143@gmail.com.",
      formNote: "This form does not send anything on its own — it composes a draft and opens it in your email client so you can send it.",
      reopenMailClient: "Reopen the draft",
      revealPhone: "Reveal the phone number"
    },
    footer: {
      tagline: "Operational Engineering Console v1.0",
      builtWith: "Built with Next.js 16, TypeScript, Tailwind CSS, MapLibre GL, Leaflet & Framer Motion",
      location: "Cochabamba, Bolivia"
    },
    copilot: {
      title: "Map Copilot",
      trigger: "Open AI Map Copilot",
      focusedTitle: "Focused Console — Map + Copilot",
      exitFocused: "Exit",
      providerLabel: "AI provider",
      noProvider: "NO PROVIDER",
      reset: "Reset conversation",
      send: "Send message",
      placeholder: "Ask about the 2024 Census blocks…",
      thinking: "Thinking…",
      intro: "I can read the map and drive it too: switch layers, fly to an area, or filter blocks by threshold. Just ask in plain language.",
      introTools: "Per-block indicators come from the 2024 Census PMTiles archive. The zone summary cards are illustrative references.",
    },
    geo: {
      title: "Centre the viewer on your area",
      body: "We ask for your location only to centre the 2024 Census viewer on your department and neighbourhood.",
      privacy: "Your precise location never leaves the browser: it is used to move the map camera and nothing else. We do not send or store it.",
      allow: "Allow Location",
      approximate: "Use Approximate Location",
      dismiss: "Close",
      errorFallback: "We could not determine your location. You can still pick a city manually.",
      sourceGps: "browser GPS",
      sourceIp: "approximate, by IP",
      unknownPlace: "Unknown location",
    },
    micro: {
      telemetryTitle: "Telemetry for this page",
      telemetryLive: "live",
      telemetryFps: "Frames/s",
      telemetrySession: "Session",
      telemetryClicks: "Clicks",
      telemetryLatency: "API latency",
      telemetryNote: "Measured in your browser via Navigation Timing and requestAnimationFrame.",
      apiTitle: "REST API tester",
      apiEndpoint: "Endpoint",
      apiSend: "Send",
      apiHint: "Pick an endpoint and hit Send: the request goes from your browser to this site's real routes.",
      spatialTitle: "Your location on the map",
      spatialDepartment: "Department",
      spatialSource: "Data source",
      spatialCoords: "Coordinates",
      spatialAccuracy: "Accuracy",
      spatialCityLevel: "city level",
      spatialNote: "IP lookup is proxied server-side so no third party sees your address alongside this site's referrer.",
      terminalTitle: "Sync console",
      terminalRun: "Replay session",
      terminalRunning: "Running…",
      terminalIdle: "Press \u00abReplay session\u00bb to watch the cron run and container health.",
      terminalNote: "Recorded transcript of a real cron_sync.php run. Not a remote shell: this panel executes nothing.",
    },
    runner: {
      title: "E2E test runner",
      run: "Run tests",
      running: "Running…",
      passed: "passed",
      note: "Replays the real suite in tests/smoke.spec.ts.",
    }
  }
};
