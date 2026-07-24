export interface TranslationDictionary {
  nav: {
    overview: string;
    flagship: string;
    projects: string;
    stack: string;
    cv: string;
    contact: string;
    downloadCv: string;
    operationalStatus: string;
  };
  hero: {
    tag: string;
    titleStart: string;
    titleAccent: string;
    headlineEs: string;
    headlineEn: string;
    launchGeo: string;
    viewProjects: string;
    cvPdf: string;
    badgeNext: string;
    badgePhp: string;
    badgeGis: string;
    badgeLinux: string;
    telemetryTitle: string;
    telemetryDegree: string;
    telemetryWork: string;
    telemetryStatus: string;
  };
  pillars: {
    tag: string;
    title: string;
    subtitle: string;
    item1Title: string;
    item1Subtitle: string;
    item1Desc: string;
    item2Title: string;
    item2Subtitle: string;
    item2Desc: string;
    item3Title: string;
    item3Subtitle: string;
    item3Desc: string;
    item4Title: string;
    item4Subtitle: string;
    item4Desc: string;
  };
  flagship: {
    badge: string;
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
    legendLow: string;
    legendHigh: string;
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
  };
}

export type TranslationKey = keyof TranslationDictionary;

export const TRANSLATIONS: Record<'es' | 'en', TranslationDictionary> = {
  es: {
    nav: {
      overview: "Visión General",
      flagship: "GeoInsights Bolivia",
      projects: "Casos de Estudio",
      stack: "Herramientas",
      cv: "CV & Resume",
      contact: "Contacto",
      downloadCv: "Descargar CV (PDF)",
      operationalStatus: "DISPONIBLE / OPERATIVO"
    },
    hero: {
      tag: "SEBASTIAN MARIN | INGENIERO DE SISTEMAS",
      titleStart: "Desarrollador Full-Stack enfocado en ",
      titleAccent: "Interfaces, APIs, Datos Espaciales y Automatización",
      headlineEs: "“Construyo sistemas web que convierten datos, APIs, información espacial y procesos en herramientas operativas simples de usar.”",
      headlineEn: "“I build web systems that turn complex data, APIs, spatial information, and workflows into simple, operational tools.”",
      launchGeo: "Explorar GeoInsights Bolivia",
      viewProjects: "Ver Casos de Estudio",
      cvPdf: "CV (PDF)",
      badgeNext: "Next.js & TypeScript",
      badgePhp: "PHP 8 & cURL REST",
      badgeGis: "Mapas Espaciales Leaflet",
      badgeLinux: "CLI Linux & Cron Jobs",
      telemetryTitle: "DIAGNÓSTICO TÉCNICO",
      telemetryDegree: "Ingeniero de Sistemas (UMSS 2024)",
      telemetryWork: "Awtu Commerce (BCP QR, Gemini API, Next.js)",
      telemetryStatus: "LISTO PARA DESPLIEGUE"
    },
    pillars: {
      tag: "ARQUITECTURA DE SISTEMAS",
      title: "Lo Que Construyo: Sistemas Web Operativos",
      subtitle: "Desarrollo de interfaces responsivas, servicios backend REST, visualizadores de datos espaciales y automatización de procesos.",
      item1Title: "Interfaces Web Operativas",
      item1Subtitle: "Next.js • React • TypeScript • UI/UX",
      item1Desc: "Paneles de control e interfaces responsivas diseñadas para velocidad, baja latencia y exploración fluida de información.",
      item2Title: "APIs e Integraciones Backend",
      item2Subtitle: "Node.js • PHP • REST • Webhooks • Pagos QR",
      item2Desc: "Endpoints REST robustos, proxys seguros de API, procesamiento de pagos QR (BCP), webhooks y motores de sincronización cURL.",
      item3Title: "Sistemas Espaciales y Mapas",
      item3Subtitle: "Leaflet • GeoJSON • Datos Censales y Urbanos",
      item3Desc: "Mapas interactivos, capas GeoJSON por departamentos y municipios, cálculo de zonas espaciales e indicadores socioeconómicos.",
      item4Title: "Linux y Automatización",
      item4Subtitle: "Bash • PowerShell • Cron Jobs • Docker • Playwright QA",
      item4Desc: "Administración de servidores, scripts automatizados de respaldo en segundo plano, contenedores Docker y pruebas automatizadas."
    },
    flagship: {
      badge: "PROYECTO DESTACADO GIS Y DATOS",
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
      comparisonTitle: "COMPARATIVA DE INDICADORES DEPARTAMENTALES",
      relevanceTitle: "Relevancia para el Rol Full-Stack",
      proofTitle: "Puntos de Prueba Técnica",
      scopeLabel: "NIVEL DE COBERTURA ESPACIAL:",
      layerLabel: "CAPA CENSAL 2024 / URBANA:",
      sourceAttribution: "Inspirado en datos abiertos de Mauricio Foronda (@mauforonda — Censo 2024, Atlas Urbano & Geodatos)",
      scopeNacional: "Bolivia Nacional (9 Dptos)",
      scopeSantaCruz: "ZM Santa Cruz de la Sierra",
      scopeCochabamba: "ZM Cochabamba / Valle",
      scopeLaPaz: "ZM La Paz / El Alto",
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
      legendLow: "Bajo / En Crecimiento",
      legendHigh: "Alto / Consolidado"
    },
    caseStudies: {
      tag: "EJECUCIÓN TÉCNICA DEMOSTRADA",
      title: "Casos de Estudio y Proyectos Destacados",
      subtitle: "Plataformas comerciales reales, software operativo universitario, microservicios PHP y laboratorios espaciales.",
      problemTitle: "PROBLEMA Y DESAFÍO",
      solutionTitle: "SOLUCIÓN DESARROLLADA",
      stackTitle: "TECNOLOGÍAS UTILIZADAS:",
      proofTitle: "Puntos Clave de Prueba Técnica",
      relevanceTitle: "RELEVANCIA PARA EL EQUIPO DE INGENIERÍA:"
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
      languagesTitle: "Idiomas"
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
      formTitle: "Mensaje Directo",
      nameLabel: "NOMBRE O EMPRESA",
      namePlaceholder: "Ej. Líder de Ingeniería / Reclutador",
      emailPlaceholder: "nombre@empresa.com",
      messageLabel: "DETALLES DE LA CONSULTA O ROL",
      messagePlaceholder: "Describa la oportunidad o consulta técnica...",
      sendButton: "ENVIAR MENSAJE",
      sentSuccess: "MENSAJE ENVIADO CORRECTAMENTE"
    }
  },
  en: {
    nav: {
      overview: "Overview",
      flagship: "GeoInsights Bolivia",
      projects: "Case Studies",
      stack: "Stack & Tools",
      cv: "CV & Resume",
      contact: "Contact",
      downloadCv: "Download CV (PDF)",
      operationalStatus: "AVAILABLE / OPERATIONAL"
    },
    hero: {
      tag: "SEBASTIAN MARIN | SYSTEMS ENGINEER",
      titleStart: "Full-Stack Developer focused on ",
      titleAccent: "Interfaces, APIs, Spatial Data & Automation",
      headlineEs: "“I build web systems that turn complex data, APIs, spatial information, and workflows into simple, operational tools.”",
      headlineEn: "“I build web systems that turn complex data, APIs, spatial information, and workflows into simple, operational tools.”",
      launchGeo: "Explore GeoInsights Bolivia",
      viewProjects: "View Case Studies",
      cvPdf: "CV (PDF)",
      badgeNext: "Next.js & TypeScript",
      badgePhp: "PHP 8 & cURL REST",
      badgeGis: "Leaflet Spatial Maps",
      badgeLinux: "Linux CLI & Cron Jobs",
      telemetryTitle: "TECHNICAL DIAGNOSTIC",
      telemetryDegree: "Systems Engineer (UMSS 2024)",
      telemetryWork: "Awtu Commerce (BCP QR, Gemini API, Next.js)",
      telemetryStatus: "READY TO DEPLOY"
    },
    pillars: {
      tag: "SYSTEMS ARCHITECTURE",
      title: "What I Build: Operational Web Systems",
      subtitle: "Building responsive frontends, REST backend microservices, spatial data visualizers, and process automation.",
      item1Title: "Operational Web Interfaces",
      item1Subtitle: "Next.js • React • TypeScript • UI/UX",
      item1Desc: "Responsive dashboards and user interfaces engineered for speed, low latency, and intuitive data exploration.",
      item2Title: "APIs & Integration Backend",
      item2Subtitle: "Node.js • PHP • REST • Webhooks • QR Payments",
      item2Desc: "Robust REST endpoints, secure API proxies, QR payment processing (BCP), webhooks, and cURL sync engines.",
      item3Title: "Spatial & Map Systems",
      item3Subtitle: "Leaflet • GeoJSON • Census & Urban Datasets",
      item3Desc: "Interactive web maps, GeoJSON layers across departments and municipalities, spatial zone calculation, and socio-demographic metrics.",
      item4Title: "Linux & Process Automation",
      item4Subtitle: "Bash • PowerShell • Cron Jobs • Docker • Playwright QA",
      item4Desc: "Server administration, automated background backup scripts, Docker containers, and end-to-end testing."
    },
    flagship: {
      badge: "FLAGSHIP GIS & DATA EXPLORER",
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
      comparisonTitle: "DEPARTMENTAL METRICS COMPARISON",
      relevanceTitle: "Relevance for Full-Stack Role",
      proofTitle: "Technical Proof Points",
      scopeLabel: "SPATIAL SCOPE LEVEL:",
      layerLabel: "2024 CENSUS / URBAN LAYER:",
      sourceAttribution: "Inspired by open datasets from Mauricio Foronda (@mauforonda — 2024 Census, Atlas Urbano & Geodatos)",
      scopeNacional: "National Bolivia (9 Depts)",
      scopeSantaCruz: "Santa Cruz Metro Area",
      scopeCochabamba: "Cochabamba Metro Area",
      scopeLaPaz: "La Paz / El Alto Metro Area",
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
      legendLow: "Low / Developing",
      legendHigh: "High / Consolidated"
    },
    caseStudies: {
      tag: "PROVEN TECHNICAL EXECUTION",
      title: "Featured Case Studies & Projects",
      subtitle: "Real commercial platforms, university operational software, PHP microservices, and interactive spatial labs.",
      problemTitle: "PROBLEM & CHALLENGE",
      solutionTitle: "ENGINEERED SOLUTION",
      stackTitle: "TECHNOLOGY STACK:",
      proofTitle: "Key Technical Proof Points",
      relevanceTitle: "RELEVANCE FOR ENGINEERING ROLE:"
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
      languagesTitle: "Languages"
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
      formTitle: "Direct Message",
      nameLabel: "YOUR NAME OR COMPANY",
      namePlaceholder: "e.g. Engineering Lead / Recruiter",
      emailPlaceholder: "name@company.com",
      messageLabel: "INQUIRY OR ROLE DETAILS",
      messagePlaceholder: "Describe role opportunities or technical inquiry...",
      sendButton: "DISPATCH MESSAGE",
      sentSuccess: "MESSAGE SENT SUCCESSFULLY"
    }
  }
};
