export interface CaseStudy {
  id: string;
  title: string;
  titleEs?: string;
  subtitle: string;
  subtitleEs?: string;
  category: 'flagship' | 'commercial' | 'operational' | 'backend' | 'spatial-lab';
  badge: string;
  badgeEs?: string;
  summary: string;
  summaryEs?: string;
  problem: string;
  problemEs?: string;
  solution: string;
  solutionEs?: string;
  proofPoints: string[];
  proofPointsEs?: string[];
  techStack: string[];
  geolabsRelevance: string;
  geolabsRelevanceEs?: string;
  metrics?: { label: string; labelEs?: string; value: string }[];
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  liveDemoUrl?: string;
  githubUrl?: string;
  /** Shown when there is no public link, so the absence is explained rather than silent. */
  availabilityNote?: string;
  availabilityNoteEs?: string;
}

export interface CapabilityPillar {
  id: string;
  title: string;
  titleEs: string;
  subtitle: string;
  subtitleEs: string;
  description: string;
  descriptionEs: string;
  iconName: string;
  techTags: string[];
  highlightSnippet: string;
}

export const CAPABILITY_PILLARS: CapabilityPillar[] = [
  {
    id: "web-interfaces",
    title: "Operational Web Interfaces",
    titleEs: "Interfaces Web Operativas",
    subtitle: "Next.js • React • TypeScript • Tailored UI/UX",
    subtitleEs: "Next.js • React • TypeScript • UI/UX Personalizado",
    description: "Responsive, high-contrast dashboards and customer-facing interfaces engineered for speed, low layout shift, and intuitive data exploration.",
    descriptionEs: "Paneles de control responsivos e interfaces orientadas al usuario, diseñados para alta velocidad, mínima latencia y exploración intuitiva de información.",
    iconName: "Layout",
    techTags: ["Next.js App Router", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion"],
    highlightSnippet: `<DashboardGrid columns={12}>\n  <MetricCard label="Estado del Sistema" value="OPERATIVO" />\n  <DataFilterBar activeRegion={selectedRegion} onChange={setRegion} />\n</DashboardGrid>`
  },
  {
    id: "apis-backend",
    title: "APIs & Integration Backend",
    titleEs: "APIs e Integraciones Backend",
    subtitle: "Node.js • PHP • REST • Webhooks • Payment Gateway",
    subtitleEs: "Node.js • PHP • REST • Webhooks • Pagos QR",
    description: "Robust REST endpoints, secure API proxies, payment processing (BCP QR), webhook handlers, and PHP/cURL sync engines.",
    descriptionEs: "Endpoints REST robustos, proxys seguros para API, procesamiento de pagos QR (BCP), webhooks y motores de sincronización en PHP/cURL.",
    iconName: "Server",
    techTags: ["REST APIs", "PHP 8 (PDO/MySQLi)", "cURL", "Node.js", "BCP QR Webhooks", "Gemini API Proxy"],
    highlightSnippet: `$ch = curl_init("https://api.gateway.internal/v1/sync");\ncurl_setopt_array($ch, [\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_HTTPHEADER => ["Authorization: Bearer " . $token]\n]);`
  },
  {
    id: "spatial-data",
    title: "Geospatial & Map Systems",
    titleEs: "Sistemas Espaciales y Mapas",
    subtitle: "Leaflet • GeoJSON • Spatial Bounds • Voronoi Coverage",
    subtitleEs: "Leaflet • GeoJSON • Cobertura Espacial • Zonas Censales",
    description: "Interactive web maps, GeoJSON region rendering, custom spatial polygon calculation, and GIS visualization for public datasets.",
    descriptionEs: "Mapas interactivos en la web, renderizado de polígonos GeoJSON por departamento/municipio, cálculo espacial y visualización GIS de datos públicos.",
    iconName: "MapPin",
    techTags: ["MapLibre GL", "PMTiles", "Leaflet", "GeoJSON", "Computational Geometry"],
    highlightSnippet: `<MapContainer center={[-16.5, -64.5]} zoom={6}>\n  <GeoJSON data={boliviaDepartments} style={geoStyle} onEachFeature={onFeatureClick} />\n</MapContainer>`
  },
  {
    id: "automation-devops",
    title: "Linux & Automation Workflow",
    titleEs: "Linux, CLI y Automatización",
    subtitle: "Bash • PowerShell • Cron Jobs • Docker • Playwright QA",
    subtitleEs: "Bash • PowerShell • Tareas Cron • Docker • Pruebas QA",
    description: "Server administration, automated background sync cron tasks, container management, SSH deployment, and Playwright E2E testing.",
    descriptionEs: "Administración de servidores, scripts de sincronización en segundo plano con cron, gestión de contenedores Docker y pruebas automatizadas E2E con Playwright.",
    iconName: "Terminal",
    techTags: ["Linux CLI", "Bash & PowerShell", "Cron Jobs", "Docker Compose", "Playwright E2E"],
    highlightSnippet: `# Scheduled background sync cron\n0 */2 * * * /usr/bin/php /var/www/sync_service/cron_sync.php >> /var/log/sync.log 2>&1`
  }
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "geoinsights-bolivia",
    title: "GeoInsights Bolivia",
    titleEs: "GeoInsights Bolivia",
    subtitle: "Public Data Exploration Platform & Interactive Spatial Mapping",
    subtitleEs: "Plataforma de Exploración de Datos Públicos y Mapeo Espacial Interactivo",
    category: "flagship",
    badge: "FLAGSHIP GIS & DATA EXPLORER",
    badgeEs: "PROYECTO DESTACADO GIS Y DATOS",
    summary: "Web map dashboard transforming Bolivian municipal and regional public datasets into an operational, explorable spatial console.",
    summaryEs: "Panel de mapas interactivos que transforma datos socio-demográficos y urbanos de Bolivia en una consola de análisis visual.",
    problem: "Public socio-demographic, infrastructure, and regional economic datasets in Bolivia are often distributed in static PDFs or raw CSVs, making spatial correlation and rapid decision-making difficult.",
    problemEs: "Los datos públicos socio-demográficos, de infraestructura y de economía en Bolivia suelen distribuirse en documentos PDF estáticos o archivos CSV crudos, lo que dificulta la correlación espacial y la toma rápida de decisiones.",
    solution: "Built a responsive Next.js application that streams the atlasurbano PMTiles vector archive with MapLibre GL, decodes its minified census attribute schema, paints four data-driven metric layers, and adds a server-side Gemini proxy for narrative summaries.",
    solutionEs: "Desarrollé una aplicación responsiva en Next.js que transmite el archivo vectorial PMTiles de atlasurbano con MapLibre GL, decodifica su esquema minificado de atributos censales, pinta cuatro capas métricas basadas en datos y añade un proxy de Gemini en el servidor para resúmenes narrativos.",
    proofPoints: [
      "Streams 247,346 real INE census block polygons from a 90 MB PMTiles archive using HTTP byte-range requests — no tile server and no hosted map service.",
      "Decoded the archive's undocumented minified attribute schema (a1, b1, r1, v1, g1) and drives MapLibre GL interpolate expressions directly from it.",
      "Four switchable census layers (density, connectivity, basic services, population) with click-to-inspect on individual blocks.",
      "Server-side Gemini API proxy keeps the key off the client and caps output tokens per request."
    ],
    proofPointsEs: [
      "Transmite 247.346 polígonos reales de manzanos del INE desde un archivo PMTiles de 90 MB mediante peticiones HTTP por rango de bytes — sin servidor de teselas ni servicio de mapas alojado.",
      "Decodifiqué el esquema minificado de atributos del archivo (a1, b1, r1, v1, g1) y alimento con él las expresiones interpolate de MapLibre GL.",
      "Cuatro capas censales conmutables (densidad, conectividad, servicios básicos, población) con inspección por clic sobre cada manzano.",
      "Proxy de la API de Gemini en el servidor: la clave nunca llega al navegador y el consumo de tokens está acotado por petición."
    ],
    techStack: ["Next.js 16", "TypeScript", "MapLibre GL", "PMTiles", "Recharts", "Tailwind CSS", "Gemini API Proxy"],
    geolabsRelevance: "Directly proves vector-tile handling, spatial data pipelines, client/server key isolation, interactive dashboard engineering, and reading an undocumented dataset schema end to end.",
    geolabsRelevanceEs: "Demuestra de forma directa el manejo de teselas vectoriales, pipelines de datos espaciales, aislamiento de claves cliente/servidor, desarrollo de paneles interactivos y la lectura completa de un esquema de datos no documentado.",
    metrics: [
      { label: "Census Blocks Streamed", labelEs: "Manzanos Transmitidos", value: "247,346" },
      { label: "Archive Size", labelEs: "Tamaño del Archivo", value: "~90 MB PMTiles" },
      { label: "Zoom Coverage", labelEs: "Cobertura de Zoom", value: "z8 – z14" },
      { label: "Metric Layers", labelEs: "Capas Métricas", value: "4" }
    ],
    liveDemoUrl: "#flagship",
    codeSnippet: {
      filename: "components/map/RealBlockMapWidget.client.tsx",
      language: "typescript",
      code: `// The atlas minifies census field names to two-character codes.\n// Every value is normalized 0-1 against the national range.\nexport const ATLAS_FIELDS = {\n  personas_por_hectarea: 'b1', // density\n  tics_internet: 'v1',         // internet / ICT\n  agua_caneria: 'r1',          // piped water\n  educacion_superior: 'g1',    // higher education\n} as const;\n\nmap.setPaintProperty('ine-manzanos-fill', 'fill-color', [\n  'interpolate',\n  ['linear'],\n  ['coalesce', ['get', ATLAS_FIELDS.personas_por_hectarea], 0],\n  0.0, '#0f172a', 0.45, '#059669', 0.9, '#34d399',\n]);`
    }
  },
  {
    id: "awtu-commerce",
    title: "Awtu Commerce Platform",
    titleEs: "Plataforma Awtu Commerce",
    subtitle: "E-Commerce with BCP QR Payments, Gemini Assistant & Admin Console",
    subtitleEs: "E-Commerce con Pagos QR BCP, Asistente Gemini y Panel Administrativo",
    category: "commercial",
    badge: "COMMERCIAL FULL-STACK WORK",
    badgeEs: "PROYECTO COMERCIAL FULL-STACK",
    summary: "Production e-commerce web platform engineered with Next.js, catalog management, automated BCP QR payment reconciliation, and an AI support assistant.",
    summaryEs: "Plataforma web de comercio electrónico en producción desarrollada con Next.js, gestión de catálogo, verificación automatizada de pagos QR BCP y asistente de soporte con IA.",
    problem: "Needed a reliable, fast commercial web store for local customers with automated payment verification for Banco de Crédito BCP QR payments and instant product support.",
    problemEs: "Se requería una tienda web comercial rápida y confiable para clientes locales con verificación automática de transacciones mediante pagos QR del Banco de Crédito BCP y soporte técnico instantáneo.",
    solution: "Designed and developed catalog administrative tools, category/product filters, BCP QR API payment flow with polling and webhooks, and a frontend interface consuming a secure internal API proxy connected to Gemini API.",
    solutionEs: "Diseñé y desarrollé las herramientas administrativas del catálogo, filtros de productos/categorías, el flujo de pagos QR BCP con polling y webhooks, y un asistente de atención al cliente consumiendo la API de Gemini mediante un proxy interno.",
    proofPoints: [
      "Integrated BCP QR payment gateway with real-time transaction status polling and webhook callbacks.",
      "Engineered frontend customer support assistant powered by Gemini API with internal backend proxy to protect API keys.",
      "Built admin views for category, product, and collection CRUD administration.",
      "Validated end-to-end purchasing and admin workflows using Playwright automated functional tests."
    ],
    proofPointsEs: [
      "Integración de pasarela de pagos QR BCP con verificación del estado de la transacción mediante polling en tiempo real y webhooks.",
      "Asistente de soporte al cliente impulsado por Gemini API con proxy interno en el backend para proteger credenciales.",
      "Desarrollo de vistas administrativas completas para operaciones CRUD de categorías, productos y colecciones.",
      "Validación de los flujos de compra y administración mediante pruebas funcionales automatizadas con Playwright."
    ],
    techStack: ["Next.js", "TypeScript", "MySQL", "Firebase", "BCP QR Payment API", "Gemini API", "Playwright"],
    geolabsRelevance: "Proves real production experience with Next.js/TypeScript, API integration, payment status polling/webhooks, security best practices for AI keys, and automated QA.",
    geolabsRelevanceEs: "Demuestra experiencia real en producción con Next.js/TypeScript, integración de APIs, estado de pagos con polling/webhooks, buenas prácticas de seguridad para llaves de IA y QA automatizado.",
    metrics: [
      { label: "Payment Verification", labelEs: "Verificación de Pago", value: "Polling + Webhooks" },
      { label: "API Key Handling", labelEs: "Manejo de Claves API", value: "Proxy en Backend" },
      { label: "Engagement", labelEs: "Tipo de Trabajo", value: "Comercial (en producción)" }
    ],
    availabilityNote: "Client-owned private codebase — I can walk through the implementation on a call.",
    availabilityNoteEs: "Código privado del cliente — puedo mostrar la implementación en una llamada.",
    codeSnippet: {
      filename: "lib/payments/bcpQrPoll.ts",
      language: "typescript",
      code: `export async function pollBcpTransactionStatus(transactionId: string, maxAttempts = 12) {\n  for (let attempt = 1; attempt <= maxAttempts; attempt++) {\n    const response = await fetch(\`/api/payments/bcp-status?id=\${transactionId}\`);\n    const data = await response.json();\n    \n    if (data.status === 'COMPLETED') return { success: true, transaction: data };\n    if (data.status === 'FAILED') return { success: false, reason: data.errorMessage };\n    \n    await new Promise(res => setTimeout(res, 2500)); // 2.5s poll interval\n  }\n  return { success: false, reason: 'POLL_TIMEOUT' };\n}`
    }
  },
  {
    id: "reserva-ambientes",
    title: "Facility Reservation System",
    titleEs: "Sistema de Reserva de Ambientes",
    subtitle: "Classroom Scheduling, Time Slots & Conflict Validation",
    subtitleEs: "Gestión de Aulas, Horarios y Validación de Conflictos",
    category: "operational",
    badge: "OPERATIONAL CRUD ENGINE",
    badgeEs: "MOTOR OPERATIVO CRUD",
    summary: "University facility management software for scheduling rooms, validating availability constraints, and preventing double-booking.",
    summaryEs: "Sistema de gestión universitaria para la reserva de aulas y ambientes, validando restricciones de horario y evitando cruces de reservaciones.",
    problem: "Manual classroom assignment caused frequent schedule overlaps, unverified capacity limits, and conflicting room requests in academic faculties.",
    problemEs: "La asignación manual de aulas ocasionaba sobreposición frecuente de horarios, superación de capacidades máximas y cruces de solicitudes en las facultades académicas.",
    solution: "Architected a relational database application with strict schedule conflict detection algorithms, room restriction rules, and user role CRUD controls.",
    solutionEs: "Arquitecturé una aplicación basada en base de datos relacional con algoritmos de detección de conflictos de horario, reglas de capacidad por espacio y control de acceso basado en roles.",
    proofPoints: [
      "Designed SQL database schema with normalized tables for spaces, schedules, users, and reservations.",
      "Engineered server-side availability validator preventing overlapping time slots and capacity overflows.",
      "Implemented role-based administrative approval flows."
    ],
    proofPointsEs: [
      "Diseño de esquema relacional SQL con tablas normalizadas para espacios, horarios, usuarios y reservas.",
      "Validador de disponibilidad en el servidor que evita la superposición de rangos de horas y excesos de capacidad.",
      "Implementación de flujos de aprobación administrativa y gestión de permisos según el rol de usuario."
    ],
    techStack: ["React", "Node.js", "PostgreSQL / MySQL", "SQL Queries & Joins", "Tailwind CSS"],
    geolabsRelevance: "Demonstrates practical backend database logic, relational query design, business constraint enforcement, and operational web tool creation.",
    geolabsRelevanceEs: "Demuestra lógica práctica de base de datos backend, diseño de consultas SQL avanzadas, cumplimiento de reglas de negocio y construcción de herramientas operativas.",
    metrics: [
      { label: "Overlap Rule", labelEs: "Regla de Cruces", value: "Validada en servidor" },
      { label: "Context", labelEs: "Contexto", value: "Proyecto académico UMSS" }
    ],
    availabilityNote: "University coursework project — the reservation logic below is the core of it.",
    availabilityNoteEs: "Proyecto académico universitario — la lógica de reservas mostrada abajo es su núcleo.",
    codeSnippet: {
      filename: "lib/db/reservationLogic.sql",
      language: "sql",
      code: `-- Check for overlapping reservation times before insert\nSELECT id FROM reservations\nWHERE space_id = p_space_id\n  AND reservation_date = p_reservation_date\n  AND status != 'CANCELLED'\n  AND (\n    (start_time < p_end_time AND end_time > p_start_time)\n  );`
    }
  },
  {
    id: "php-data-sync",
    title: "PHP Data Sync API Service",
    titleEs: "Servicio API de Sincronización PHP",
    subtitle: "PHP 8 Microservice with cURL, PDO MySQL & Cron Execution",
    subtitleEs: "Microservicio PHP con cURL, PDO MySQL y Ejecución Cron",
    category: "backend",
    badge: "PHP / cURL / LINUX CRON",
    badgeEs: "PHP / cURL / CRON LINUX",
    summary: "Lightweight, reliable PHP microservice that syncs external REST datasets via cURL, stores records using PDO MySQL, and exposes clean RESTful endpoints.",
    summaryEs: "Microservicio liviano y confiable en PHP 8 que sincroniza conjuntos de datos externos vía cURL, almacena registros con PDO MySQL y expone endpoints REST.",
    problem: "Legacy operational systems need background synchronization of external datasets without heavy framework dependencies.",
    problemEs: "Sistemas operacionales existentes requerían sincronización en segundo plano de datos externos sin depender de frameworks pesados e innecesarios.",
    solution: "Developed a standalone PHP 8 service with custom cURL handler, PDO MySQL database integration, structured error logging, environment variable support, and a automated Linux CLI cron script.",
    solutionEs: "Desarrollé un servicio independiente en PHP 8 con manejador cURL personalizado, integración a MySQL mediante PDO, registro estructurado de errores y script para cron en Linux.",
    proofPoints: [
      "Built cURL request pipeline with timeout management, retry strategy, and HTTP status verification.",
      "Secured database interaction using PDO prepared statements to protect against SQL injection.",
      "Packaged CLI sync script executed automatically via Linux crontab.",
      "Included complete technical documentation, .env.example, and REST API contract."
    ],
    proofPointsEs: [
      "Pipeline de peticiones cURL con gestión de tiempos de espera, estrategia de reintentos y verificación de estado HTTP.",
      "Interacción segura con base de datos mediante sentencias preparadas PDO para prevenir inyección SQL.",
      "Script CLI empaquetado para ejecución automática según programación crontab en Linux.",
      "Documentación técnica completa, archivo .env.example de muestra y contrato de API REST."
    ],
    techStack: ["PHP 8", "MySQL (PDO)", "cURL", "Linux CLI", "Cron Jobs", "Bash"],
    geolabsRelevance: "Directly matches backend requirements (PHP intermediate/advanced, cURL, REST APIs, MySQL, Linux CLI, cron jobs, process debugging).",
    geolabsRelevanceEs: "Cumple directamente con requerimientos backend avanzados (PHP 8, cURL, APIs REST, MySQL, CLI Linux, tareas cron y depuración de procesos).",
    metrics: [
      { label: "Runtime", labelEs: "Entorno de Ejecución", value: "PHP 8 CLI + cron" },
      { label: "Persistence", labelEs: "Persistencia", value: "MySQL vía PDO" }
    ],
    liveDemoUrl: "/api/php-sync",
    availabilityNote: "The /api/php-sync endpoint publishes this service's response contract — it is an example payload, not a live PHP process.",
    availabilityNoteEs: "El endpoint /api/php-sync publica el contrato de respuesta de este servicio — es un ejemplo, no un proceso PHP en ejecución.",
    codeSnippet: {
      filename: "backend/php/sync_service.php",
      language: "php",
      code: `<?php\n// PHP Data Sync API with cURL & PDO\nrequire_once __DIR__ . '/config.php';\n\n$ch = curl_init();\ncurl_setopt_array($ch, [\n    CURLOPT_URL => "https://api.publicdata.gov/v1/records",\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_TIMEOUT => 15,\n    CURLOPT_HTTPHEADER => ["Accept: application/json"]\n]);\n\n$response = curl_exec($ch);\nif (curl_errno($ch)) {\n    error_log("cURL Error: " . curl_error($ch));\n    exit(1);\n}\ncurl_close($ch);\n\n$data = json_decode($response, true);\n$stmt = $pdo->prepare("INSERT INTO synchronized_data (external_id, payload, synced_at) VALUES (:id, :payload, NOW()) ON DUPLICATE KEY UPDATE payload = :payload, synced_at = NOW()");\nforeach ($data['items'] as $item) {\n    $stmt->execute([':id' => $item['id'], ':payload' => json_encode($item)]);\n}`
    }
  },
  {
    id: "voronoi-coverage-lab",
    title: "Voronoi Spatial Coverage Lab",
    titleEs: "Laboratorio de Zonas Voronoi",
    subtitle: "Interactive Spatial Coverage Tool & GeoJSON Export",
    subtitleEs: "Herramienta Interactiva de Zonas Espaciales y Exportación GeoJSON",
    category: "spatial-lab",
    badge: "INTERACTIVE GIS LAB",
    badgeEs: "LABORATORIO INTERACTIVO GIS",
    summary: "Interactive spatial lab where users click on a map to drop service points, compute geometric Voronoi coverage zones, and export standardized GeoJSON.",
    summaryEs: "Laboratorio espacial interactivo donde el usuario coloca puntos de servicio sobre el mapa, calcula celdas de cobertura geométrica Voronoi y exporta archivos GeoJSON estándar.",
    problem: "Planning coverage areas for service points or sensors requires fast interactive spatial polygon generation.",
    problemEs: "Planificar áreas de cobertura para puntos de atención o sensores requiere la generación rápida e interactiva de polígonos espaciales.",
    solution: "Built a client-side Leaflet tool that computes each site's exact Voronoi cell by half-plane intersection — clipping a working rectangle against the perpendicular bisector of every site pair — with no geometry library.",
    solutionEs: "Construí una herramienta cliente en Leaflet que calcula la celda Voronoi exacta de cada punto por intersección de semiplanos — recortando un rectángulo de trabajo con la bisectriz perpendicular de cada par de puntos — sin librerías de geometría.",
    proofPoints: [
      "Voronoi cells computed by successive Sutherland–Hodgman clipping against perpendicular bisectors — the cells tessellate the working area with no gaps or overlaps.",
      "Interactive point placement: every click recomputes the full tessellation in the browser.",
      "Exports the computed coverage polygons (not just the input points) as standard GeoJSON for QGIS or ArcGIS."
    ],
    proofPointsEs: [
      "Celdas Voronoi calculadas por recortes sucesivos de Sutherland–Hodgman contra bisectrices perpendiculares — teselan el área de trabajo sin huecos ni solapamientos.",
      "Ubicación interactiva de puntos: cada clic recalcula la teselación completa en el navegador.",
      "Exporta los polígonos de cobertura calculados (no solo los puntos de entrada) como GeoJSON estándar para QGIS o ArcGIS."
    ],
    techStack: ["TypeScript", "Leaflet", "GeoJSON", "Computational Geometry", "Tailwind CSS"],
    geolabsRelevance: "Shows comfort implementing a spatial algorithm from first principles rather than reaching for a library, plus standardized GIS interchange formats.",
    geolabsRelevanceEs: "Muestra soltura para implementar un algoritmo espacial desde cero en lugar de recurrir a una librería, además del intercambio en formatos GIS estándar.",
    metrics: [
      { label: "Algorithm", labelEs: "Algoritmo", value: "Half-plane intersection" },
      { label: "Export Format", labelEs: "Formato de Salida", value: "GeoJSON Polygon" }
    ],
    availabilityNote: "Runs live in this page — click the map below to add service points.",
    availabilityNoteEs: "Funciona en vivo en esta página — haz clic en el mapa de abajo para agregar puntos de servicio."
  }
];

export const TECH_STACK_GROUPS = [
  {
    category: "Frontend & Web UI",
    categoryEs: "Frontend y Desarrollo Web UI",
    items: [
      { name: "Next.js (App Router)", level: "Advanced", levelEs: "Avanzado", desc: "SSR, SSG, Route Handlers, Optimization", descEs: "Renderizado SSR/SSG, Route Handlers y optimización de componentes" },
      { name: "React 19 & TypeScript", level: "Advanced", levelEs: "Avanzado", desc: "Custom hooks, state management, strict types", descEs: "Hooks personalizados, gestión de estado y tipado estricto" },
      { name: "Tailwind CSS & CSS Modules", level: "Advanced", levelEs: "Avanzado", desc: "Design systems, responsive layout, dark themes", descEs: "Sistemas de diseño, maquetación responsiva y temas oscuros" },
      { name: "Framer Motion / Motion", level: "Intermediate+", levelEs: "Intermedio+", desc: "GPU animations, scroll reveals, spring physics", descEs: "Animaciones por GPU, revelado en scroll y física fluida" }
    ]
  },
  {
    category: "Backend & Databases",
    categoryEs: "Backend y Bases de Datos",
    items: [
      { name: "PHP 8 (PDO / MySQLi)", level: "Intermediate+", levelEs: "Intermedio+", desc: "CRUD, REST APIs, cURL integration, secure queries", descEs: "Operaciones CRUD, APIs REST, integración cURL y PDO seguro" },
      { name: "Node.js & Express", level: "Intermediate+", levelEs: "Intermedio+", desc: "REST microservices, middleware, async pipelines", descEs: "Microservicios REST, middlewares y pipelines asíncronos" },
      { name: "Python & Django", level: "Intermediate", levelEs: "Intermedio", desc: "APIs, data processing, backend logic", descEs: "APIs REST, procesamiento de datos y lógica backend" },
      { name: "MySQL & PostgreSQL", level: "Advanced", levelEs: "Avanzado", desc: "Schema design, complex joins, aggregations, Supabase", descEs: "Diseño de tablas relacionales, consultas complejas y Supabase" }
    ]
  },
  {
    category: "Linux, DevOps & QA",
    categoryEs: "Linux, CLI, DevOps y QA",
    items: [
      { name: "Linux CLI & Bash", level: "Advanced", levelEs: "Avanzado", desc: "Cron jobs, process debugging, shell scripting", descEs: "Tareas programadas cron, depuración de procesos y automatización Bash" },
      { name: "PowerShell Scripting", level: "Advanced", levelEs: "Avanzado", desc: "IT task automation, system configuration", descEs: "Automatización de tareas del sistema y configuración de equipos" },
      { name: "Docker & Docker Compose", level: "Intermediate+", levelEs: "Intermedio+", desc: "Containerized dev environments & deployment", descEs: "Contenedores para desarrollo y despliegue de microservicios" },
      { name: "Git, SSH & Vercel", level: "Advanced", levelEs: "Avanzado", desc: "Version control, remote deployment, keys", descEs: "Control de versiones Git, administración por SSH y despliegue continuo" },
      { name: "Playwright E2E", level: "Intermediate+", levelEs: "Intermedio+", desc: "Automated smoke tests & functional validation", descEs: "Pruebas funcionales automatizadas y validación de flujos de usuario" }
    ]
  },
  {
    category: "Geospatial & AI Tooling",
    categoryEs: "Datos Espaciales e Herramientas de IA",
    items: [
      { name: "Leaflet & Spatial Viz", level: "Intermediate+", levelEs: "Intermedio+", desc: "Interactive web maps, GeoJSON, spatial layers", descEs: "Mapas interactivos, capas GeoJSON y visualización de polígonos" },
      { name: "Gemini API Integration", level: "Intermediate+", levelEs: "Intermedio+", desc: "Customer support assistants, API proxies, prompts", descEs: "Asistentes de soporte, proxy backend seguro e ingeniería de prompts" },
      { name: "AI Dev Workflows", level: "Daily Workflow", levelEs: "Uso Diario", desc: "Antigravity, Gemini CLI, Hermes Agent", descEs: "Flujo de trabajo asistido por IA con Antigravity, Gemini CLI y Hermes" }
    ]
  }
];
