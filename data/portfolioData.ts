export interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  category: 'flagship' | 'commercial' | 'operational' | 'backend' | 'spatial-lab';
  badge: string;
  summary: string;
  problem: string;
  solution: string;
  proofPoints: string[];
  techStack: string[];
  geolabsRelevance: string;
  metrics?: { label: string; value: string }[];
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  liveDemoUrl?: string;
  githubUrl?: string;
}

export interface CapabilityPillar {
  id: string;
  title: string;
  titleEs: string;
  subtitle: string;
  description: string;
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
    description: "Responsive, high-contrast dashboards and customer-facing interfaces engineered for speed, low layout shift, and intuitive data exploration.",
    iconName: "Layout",
    techTags: ["Next.js App Router", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion"],
    highlightSnippet: `<DashboardGrid columns={12}>\n  <MetricCard label="System Status" value="OPERATIONAL" />\n  <DataFilterBar activeRegion={selectedRegion} onChange={setRegion} />\n</DashboardGrid>`
  },
  {
    id: "apis-backend",
    title: "APIs & Integration Backend",
    titleEs: "APIs e Integraciones Backend",
    subtitle: "Node.js • PHP • REST • Webhooks • Payment Gateway",
    description: "Robust REST endpoints, secure API proxies, payment processing (BCP QR), webhook handlers, and PHP/cURL sync engines.",
    iconName: "Server",
    techTags: ["REST APIs", "PHP 8 (PDO/MySQLi)", "cURL", "Node.js", "BCP QR Webhooks", "Gemini API Proxy"],
    highlightSnippet: `$ch = curl_init("https://api.gateway.internal/v1/sync");\ncurl_setopt_array($ch, [\n  CURLOPT_RETURNTRANSFER => true,\n  CURLOPT_HTTPHEADER => ["Authorization: Bearer " . $token]\n]);`
  },
  {
    id: "spatial-data",
    title: "Geospatial & Map Systems",
    titleEs: "Sistemas Espaciales y Mapas",
    subtitle: "Leaflet • GeoJSON • Spatial Bounds • Voronoi Coverage",
    description: "Interactive web maps, GeoJSON region rendering, custom spatial polygon calculation, and GIS visualization for public datasets.",
    iconName: "MapPin",
    techTags: ["Leaflet", "GeoJSON", "Spatial Queries", "Turf.js", "Spatial Analytics"],
    highlightSnippet: `<MapContainer center={[-16.5, -64.5]} zoom={6}>\n  <GeoJSON data={boliviaDepartments} style={geoStyle} onEachFeature={onFeatureClick} />\n</MapContainer>`
  },
  {
    id: "automation-devops",
    title: "Linux & Automation Workflow",
    titleEs: "Linux, CLI y Automatización",
    subtitle: "Bash • PowerShell • Cron Jobs • Docker • Playwright QA",
    description: "Server administration, automated background sync cron tasks, container management, SSH deployment, and Playwright E2E testing.",
    iconName: "Terminal",
    techTags: ["Linux CLI", "Bash & PowerShell", "Cron Jobs", "Docker Compose", "Playwright E2E"],
    highlightSnippet: `# Scheduled background sync cron\n0 */2 * * * /usr/bin/php /var/www/sync_service/cron_sync.php >> /var/log/sync.log 2>&1`
  }
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "geoinsights-bolivia",
    title: "GeoInsights Bolivia",
    subtitle: "Plataforma de Exploración de Datos Públicos y Mapeo Espacial Interactivo",
    category: "flagship",
    badge: "FLAGSHIP GIS & DATA EXPLORER",
    summary: "Web map dashboard transforming Bolivian municipal and regional public datasets into an operational, explorable spatial console.",
    problem: "Public socio-demographic, infrastructure, and regional economic datasets in Bolivia are often distributed in static PDFs or raw CSVs, making spatial correlation and rapid decision-making difficult.",
    solution: "Built a responsive Next.js application featuring an interactive Leaflet map, custom GeoJSON department polygon layers, dynamic data filters, demographic aggregation charts, and an AI-assisted spatial summary engine powered by Gemini API.",
    proofPoints: [
      "Dynamic GeoJSON layer loading for 9 departments of Bolivia with instant spatial metric calculation.",
      "Filter datasets by region, population density, connectivity index, and infrastructure coverage.",
      "Integrated Gemini AI API proxy to generate automated narrative summaries of selected regional metrics.",
      "Optimized client-side rendering with dynamic imports to achieve 60 FPS map pan and zoom interactions."
    ],
    techStack: ["Next.js 14", "TypeScript", "Leaflet", "GeoJSON", "Recharts", "Tailwind CSS", "Gemini API Proxy"],
    geolabsRelevance: "Directly proves spatial data handling, Leaflet UI integration, client/server data isolation, interactive dashboard engineering, and modern REST/AI data pipelines.",
    metrics: [
      { label: "Departments Mapped", value: "9 / 9" },
      { label: "Data Metrics", value: "24+ Indicators" },
      { label: "Map Render Target", value: "60 FPS" },
      { label: "AI Summary Latency", value: "< 800ms" }
    ],
    codeSnippet: {
      filename: "components/map/GeoInsightsExplorer.tsx",
      language: "typescript",
      code: `export function processDepartmentMetrics(deptCode: string, rawMetrics: RegionMetric[]) {\n  const filtered = rawMetrics.filter(m => m.deptId === deptCode);\n  const totalPopulation = filtered.reduce((acc, curr) => acc + curr.population, 0);\n  const avgConnectivity = filtered.reduce((acc, curr) => acc + curr.connectivity, 0) / (filtered.length || 1);\n  \n  return {\n    deptCode,\n    totalPopulation,\n    avgConnectivity: Math.round(avgConnectivity * 10) / 10,\n    densityRating: totalPopulation > 2000000 ? 'High' : 'Moderate'\n  };\n}`
    }
  },
  {
    id: "awtu-commerce",
    title: "Awtu Commerce Platform",
    subtitle: "E-Commerce con Pagos QR BCP, Asistente Gemini y Panel Administrativo",
    category: "commercial",
    badge: "COMMERCIAL FULL-STACK WORK",
    summary: "Production e-commerce web platform engineered with Next.js, catalog management, automated BCP QR payment reconciliation, and an AI support assistant.",
    problem: "Needed a reliable, fast commercial web store for local customers with automated payment verification for Banco de Crédito BCP QR payments and instant product support.",
    solution: "Designed and developed catalog administrative tools, category/product filters, BCP QR API payment flow with polling and webhooks, and a frontend interface consuming a secure internal API proxy connected to Gemini API.",
    proofPoints: [
      "Integrated BCP QR payment gateway with real-time transaction status polling and webhook callbacks.",
      "Engineered frontend customer support assistant powered by Gemini API with internal backend proxy to protect API keys.",
      "Built admin views for category, product, and collection CRUD administration.",
      "Validated end-to-end purchasing and admin workflows using Playwright automated functional tests."
    ],
    techStack: ["Next.js", "TypeScript", "MySQL", "Firebase", "BCP QR Payment API", "Gemini API", "Playwright"],
    geolabsRelevance: "Proves real production experience with Next.js/TypeScript, API integration, payment status polling/webhooks, security best practices for AI keys, and automated QA.",
    metrics: [
      { label: "Payment Verification", value: "Real-time Polling" },
      { label: "API Key Exposure", value: "0% (Backend Proxy)" },
      { label: "QA Automated Coverage", value: "Playwright Suites" }
    ],
    codeSnippet: {
      filename: "lib/payments/bcpQrPoll.ts",
      language: "typescript",
      code: `export async function pollBcpTransactionStatus(transactionId: string, maxAttempts = 12) {\n  for (let attempt = 1; attempt <= maxAttempts; attempt++) {\n    const response = await fetch(\`/api/payments/bcp-status?id=\${transactionId}\`);\n    const data = await response.json();\n    \n    if (data.status === 'COMPLETED') return { success: true, transaction: data };\n    if (data.status === 'FAILED') return { success: false, reason: data.errorMessage };\n    \n    await new Promise(res => setTimeout(res, 2500)); // 2.5s poll interval\n  }\n  return { success: false, reason: 'POLL_TIMEOUT' };\n}`
    }
  },
  {
    id: "reserva-ambientes",
    title: "Sistema de Reserva de Ambientes",
    subtitle: "Gestión de Aulas, Horarios y Validación de Conflictos",
    category: "operational",
    badge: "OPERATIONAL CRUD ENGINE",
    summary: "University facility management software for scheduling rooms, validating availability constraints, and preventing double-booking.",
    problem: "Manual classroom assignment caused frequent schedule overlaps, unverified capacity limits, and conflicting room requests in academic faculties.",
    solution: "Architected a relational database application with strict schedule conflict detection algorithms, room restriction rules, and user role CRUD controls.",
    proofPoints: [
      "Designed SQL database schema with normalized tables for spaces, schedules, users, and reservations.",
      "Engineered server-side availability validator preventing overlapping time slots and capacity overflows.",
      "Implemented role-based administrative approval flows."
    ],
    techStack: ["React", "Node.js", "PostgreSQL / MySQL", "SQL Queries & Joins", "Tailwind CSS"],
    geolabsRelevance: "Demonstrates practical backend database logic, relational query design, business constraint enforcement, and operational web tool creation.",
    metrics: [
      { label: "Conflict Overlaps Allowed", value: "0 (Enforced)" },
      { label: "CRUD Operations", value: "100% Validated" }
    ],
    codeSnippet: {
      filename: "lib/db/reservationLogic.sql",
      language: "sql",
      code: `-- Check for overlapping reservation times before insert\nSELECT id FROM reservations\nWHERE space_id = p_space_id\n  AND reservation_date = p_reservation_date\n  AND status != 'CANCELLED'\n  AND (\n    (start_time < p_end_time AND end_time > p_start_time)\n  );`
    }
  },
  {
    id: "php-data-sync",
    title: "PHP Data Sync API Service",
    subtitle: "Microservicio PHP con cURL, PDO MySQL y Ejecución Cron",
    category: "backend",
    badge: "PHP / cURL / LINUX CRON",
    summary: "Lightweight, reliable PHP microservice that syncs external REST datasets via cURL, stores records using PDO MySQL, and exposes clean RESTful endpoints.",
    problem: "Legacy operational systems need background synchronization of external datasets without heavy framework dependencies.",
    solution: "Developed a standalone PHP 8 service with custom cURL handler, PDO MySQL database integration, structured error logging, environment variable support, and a automated Linux CLI cron script.",
    proofPoints: [
      "Built cURL request pipeline with timeout management, retry strategy, and HTTP status verification.",
      "Secured database interaction using PDO prepared statements to protect against SQL injection.",
      "Packaged CLI sync script executed automatically via Linux crontab.",
      "Included complete technical documentation, .env.example, and REST API contract."
    ],
    techStack: ["PHP 8", "MySQL (PDO)", "cURL", "Linux CLI", "Cron Jobs", "Bash"],
    geolabsRelevance: "Directly matches backend requirements (PHP intermediate/advanced, cURL, REST APIs, MySQL, Linux CLI, cron jobs, process debugging).",
    metrics: [
      { label: "Execution Overhead", value: "< 45ms" },
      { label: "Sync Schedule", value: "Configurable Cron" }
    ],
    codeSnippet: {
      filename: "backend/php/sync_service.php",
      language: "php",
      code: `<?php\n// PHP Data Sync API with cURL & PDO\nrequire_once __DIR__ . '/config.php';\n\n$ch = curl_init();\ncurl_setopt_array($ch, [\n    CURLOPT_URL => "https://api.publicdata.gov/v1/records",\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_TIMEOUT => 15,\n    CURLOPT_HTTPHEADER => ["Accept: application/json"]\n]);\n\n$response = curl_exec($ch);\nif (curl_errno($ch)) {\n    error_log("cURL Error: " . curl_error($ch));\n    exit(1);\n}\ncurl_close($ch);\n\n$data = json_decode($response, true);\n$stmt = $pdo->prepare("INSERT INTO synchronized_data (external_id, payload, synced_at) VALUES (:id, :payload, NOW()) ON DUPLICATE KEY UPDATE payload = :payload, synced_at = NOW()");\nforeach ($data['items'] as $item) {\n    $stmt->execute([':id' => $item['id'], ':payload' => json_encode($item)]);\n}`
    }
  },
  {
    id: "voronoi-coverage-lab",
    title: "Voronoi Spatial Coverage Lab",
    subtitle: "Herramienta Interactiva de Zonas Espaciales y Exportación GeoJSON",
    category: "spatial-lab",
    badge: "INTERACTIVE GIS LAB",
    summary: "Interactive spatial lab where users click on a map to drop service points, compute geometric Voronoi coverage zones, and export standardized GeoJSON.",
    problem: "Planning coverage areas for service points or sensors requires fast interactive spatial polygon generation.",
    solution: "Engineered a client-side Leaflet tool that dynamically calculates nearest-neighbor Delaunay/Voronoi cells and renders interactive polygon features.",
    proofPoints: [
      "Interactive point placement on map canvas.",
      "Dynamic client-side spatial polygon generation.",
      "GeoJSON export for downstream GIS tools (QGIS, ArcGIS)."
    ],
    techStack: ["TypeScript", "Leaflet", "GeoJSON", "Geometric Algorithms", "Tailwind CSS"],
    geolabsRelevance: "Highlights spatial curiosity, geometric algorithms, client-side map manipulation, and standardized spatial data formats.",
    metrics: [
      { label: "Calculation Speed", value: "< 16ms (Instant)" },
      { label: "Export Format", value: "GeoJSON FeatureCollection" }
    ]
  }
];

export const TECH_STACK_GROUPS = [
  {
    category: "Frontend & Web UI",
    items: [
      { name: "Next.js (App Router)", level: "Advanced", desc: "SSR, SSG, Route Handlers, Optimization" },
      { name: "React 19 & TypeScript", level: "Advanced", desc: "Custom hooks, state management, strict types" },
      { name: "Tailwind CSS & CSS Modules", level: "Advanced", desc: "Design systems, responsive layout, dark themes" },
      { name: "Framer Motion / Motion", level: "Intermediate+", desc: "GPU animations, scroll reveals, spring physics" }
    ]
  },
  {
    category: "Backend & Databases",
    items: [
      { name: "PHP 8 (PDO / MySQLi)", level: "Intermediate+", desc: "CRUD, REST APIs, cURL integration, secure queries" },
      { name: "Node.js & Express", level: "Intermediate+", desc: "REST microservices, middleware, async pipelines" },
      { name: "Python & Django", level: "Intermediate", desc: "APIs, data processing, backend logic" },
      { name: "MySQL & PostgreSQL", level: "Advanced", desc: "Schema design, complex joins, aggregations, Supabase" }
    ]
  },
  {
    category: "Linux, DevOps & QA",
    items: [
      { name: "Linux CLI & Bash", level: "Advanced", desc: "Cron jobs, process debugging, shell scripting" },
      { name: "PowerShell Scripting", level: "Advanced", desc: "IT task automation, system configuration" },
      { name: "Docker & Docker Compose", level: "Intermediate+", desc: "Containerized dev environments & deployment" },
      { name: "Git, SSH & Vercel", level: "Advanced", desc: "Version control, remote deployment, keys" },
      { name: "Playwright E2E", level: "Intermediate+", desc: "Automated smoke tests & functional validation" }
    ]
  },
  {
    category: "Geospatial & AI Tooling",
    items: [
      { name: "Leaflet & Spatial Viz", level: "Intermediate+", desc: "Interactive web maps, GeoJSON, spatial layers" },
      { name: "Gemini API Integration", level: "Intermediate+", desc: "Customer support assistants, API proxies, prompts" },
      { name: "AI Dev Workflows", level: "Daily Workflow", desc: "Antigravity, Gemini CLI, Hermes Agent" }
    ]
  }
];
