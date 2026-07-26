export interface CVData {
  personal: {
    name: string;
    title: string;
    titleEn: string;
    location: string;
    phone: string;
    email: string;
    github: string;
    githubUrl: string;
    pdfPath: string;
    profileSummaryEs: string;
    profileSummaryEn: string;
  };
  skills: {
    category: string;
    categoryEn: string;
    items: string;
    itemsEn: string;
  }[];
  experience: {
    role: string;
    roleEn: string;
    company: string;
    companyEn?: string;
    period: string;
    periodEn: string;
    location: string;
    locationEn: string;
    bullets: string[];
    bulletsEn: string[];
  }[];
  featuredProjects: {
    title: string;
    titleEn: string;
    context: string;
    contextEn: string;
    bullets: string[];
    bulletsEn: string[];
  }[];
  education: {
    degree: string;
    degreeEn: string;
    institution: string;
    period: string;
    location: string;
    description?: string;
    descriptionEn?: string;
  }[];
  certifications: string[];
  certificationsEn: string[];
  languages: {
    language: string;
    languageEn: string;
    level: string;
    levelEn: string;
  }[];
}

export const SEBASTIAN_CV_DATA: CVData = {
  personal: {
    name: "Sebastian Marin",
    title: "Ingeniero de Sistemas — Desarrollador Fullstack",
    titleEn: "Systems Engineer — Full-Stack Developer",
    location: "Cochabamba, Bolivia",
    phone: "+591 72295996",
    email: "marinsebastian143@gmail.com",
    github: "github.com/marinsebastian",
    githubUrl: "https://github.com/marinsebastian",
    pdfPath: "/CV Sebastian Marin.pdf",
    profileSummaryEs: "Soy Ingeniero de Sistemas y desarrollador Full-Stack con experiencia en aplicaciones web, interfaces responsivas, integración de APIs REST, bases de datos relacionales y automatización. Recientemente trabajé con Next.js, TypeScript, MySQL y Firebase en una plataforma de comercio electrónico, participando en la gestión del catálogo, integración de pagos mediante QR y desarrollo de un asistente de soporte con Gemini API. Uso Linux habitualmente como entorno de desarrollo y cuento con experiencia práctica en Git, Docker Compose, SSH, Bash, PowerShell, cron jobs, Playwright y análisis de logs. Actualmente curso un Diplomado en Ciencia de Datos e Inteligencia Artificial, profundizando en preparación de datos, machine learning, evaluación de modelos e IA aplicada.",
    profileSummaryEn: "I am a Systems Engineer and Full-Stack Developer with hands-on experience in web applications, responsive interfaces, REST API integrations, relational databases, and process automation. Recently built e-commerce solutions with Next.js, TypeScript, MySQL, and Firebase, integrating BCP QR payments and a Gemini API customer support assistant via an internal proxy. Daily Linux user experienced with Git, Docker Compose, SSH, Bash, PowerShell, cron background tasks, and Playwright automated testing. Currently completing a Postgraduate Diploma in Data Science & Artificial Intelligence."
  },
  skills: [
    {
      category: "Desarrollo Web",
      categoryEn: "Web Development",
      items: "Next.js, React, TypeScript, JavaScript, HTML, CSS, interfaces responsivas, animaciones CSS, SEO básico y mejora de UI/UX.",
      itemsEn: "Next.js, React, TypeScript, JavaScript, HTML, CSS, responsive interfaces, CSS animations, basic SEO, and UI/UX optimization."
    },
    {
      category: "Backend y APIs",
      categoryEn: "Backend & APIs",
      items: "Node.js, Python, Django, APIs REST, JSON, integración de servicios externos, validación y manejo de errores. Experiencia previa con PHP, CRUD e integración segura con MySQLi/PDO.",
      itemsEn: "Node.js, Python, Django, REST APIs, JSON, external service integration, error handling. Practical experience with PHP 8, CRUD, and secure MySQLi/PDO statements."
    },
    {
      category: "Bases de Datos",
      categoryEn: "Databases",
      items: "MySQL, PostgreSQL, Supabase y SQL Server; diseño de tablas, consultas SQL, joins, filtros, agregaciones e integración con aplicaciones web y APIs.",
      itemsEn: "MySQL, PostgreSQL, Supabase, and SQL Server; schema design, SQL queries, joins, filtering, aggregation, and web application integration."
    },
    {
      category: "Linux, DevOps y QA",
      categoryEn: "Linux, DevOps & QA",
      items: "Linux CLI, Bash, PowerShell, Git, SSH, Docker, Docker Compose, cron jobs, variables de entorno, revisión de logs, despliegue remoto y pruebas automatizadas con Playwright.",
      itemsEn: "Linux CLI, Bash, PowerShell, Git, SSH, Docker, Docker Compose, cron jobs, environment variables, log inspection, remote deployment, and Playwright automated testing."
    },
    {
      category: "IA y Datos Espaciales",
      categoryEn: "AI & Spatial Data",
      items: "Gemini API y herramientas de desarrollo asistido por IA como Antigravity, Gemini CLI y Hermes Agent; formación activa en ciencia de datos e IA. Leaflet y visualización espacial.",
      itemsEn: "Gemini API integration, AI-assisted development tools (Antigravity, Gemini CLI, Hermes Agent), Data Science & Machine Learning diploma, Leaflet GIS mapping."
    }
  ],
  experience: [
    {
      role: "Desarrollador Web",
      roleEn: "Web Developer",
      company: "Awtu Commerce",
      period: "Feb 2026 – Abr 2026",
      periodEn: "Feb 2026 – Apr 2026",
      location: "Remoto · Modalidad flexible",
      locationEn: "Remote · Flexible Contract",
      bullets: [
        "Trabajé principalmente en el frontend de una plataforma de comercio electrónico con Next.js, TypeScript, MySQL y Firebase, colaborando con un equipo de desarrollo mediante Git.",
        "Desarrollé funcionalidades para la vista administrativa, incluyendo gestión de categorías, productos y colecciones, además de componentes para carga y administración del catálogo.",
        "Trabajé en la experiencia de la tienda, desarrollando vistas de productos, filtros por categoría, colección y precio, y páginas individuales de producto.",
        "Integré la API de pagos QR del Banco de Crédito BCP, implementando verificación del estado de las transacciones mediante polling y webhooks.",
        "Desarrollé la interfaz frontend de un asistente de atención al cliente basado en Gemini API, con acceso al catálogo de productos a través de una API interna para proteger credenciales.",
        "Realicé pruebas manuales y automatizadas con Playwright en entorno local para validar flujos funcionales antes de integrar cambios al proyecto."
      ],
      bulletsEn: [
        "Engineered the frontend for a commercial e-commerce web store built with Next.js, TypeScript, MySQL, and Firebase in a Git team workflow.",
        "Developed administrative CRUD features for category, product, and collection management.",
        "Built responsive customer store interfaces, search filters, category views, and single product detail pages.",
        "Integrated Banco de Crédito BCP QR payment API with real-time status polling and webhook reconciliation.",
        "Created customer support chat assistant powered by Gemini API, routing queries through a secure internal API proxy to protect credentials.",
        "Executed manual and automated Playwright E2E tests to validate critical purchasing flows before release."
      ]
    },
    {
      role: "Técnico TI",
      roleEn: "IT Technician",
      company: "Universidad Mayor de San Simón — Facultad de Ciencias y Tecnología",
      period: "Ene 2025 – Presente",
      periodEn: "Jan 2025 – Present",
      location: "Cochabamba, Bolivia",
      locationEn: "Cochabamba, Bolivia",
      bullets: [
        "Automatizo tareas operativas con PowerShell y Bash, especialmente instalación y configuración de software de uso frecuente.",
        "Desarrollo scripts para respaldo de archivos y restauración de backups, reduciendo tareas manuales repetitivas y acelerando la recuperación de equipos.",
        "Diagnostico y resuelvo incidencias de hardware, software, sistemas operativos y conectividad para usuarios de la facultad.",
        "Apoyo en configuración y diagnóstico de redes, routers y switches, y documento procedimientos técnicos y soluciones recurrentes."
      ],
      bulletsEn: [
        "Automated IT operating tasks using PowerShell and Bash scripts for software provisioning and environment setup.",
        "Built background backup and restore scripts to eliminate manual tasks and accelerate workstation recovery times.",
        "Diagnosed and resolved hardware, software, OS, and network connectivity issues for university staff and labs.",
        "Supported faculty network equipment maintenance (routers, switches) and documented recurring technical procedures."
      ]
    },
    {
      role: "Desarrollador Web Freelance",
      roleEn: "Freelance Web Developer",
      company: "Proyectos propios y clientes",
      companyEn: "Independent Client Work",
      period: "2024 – Presente",
      periodEn: "2024 – Present",
      location: "Remoto",
      locationEn: "Remote",
      bullets: [
        "Desarrollo sitios web y portfolios con Next.js y Firebase, priorizando rendimiento, simplicidad, diseño responsivo y facilidad de mantenimiento.",
        "Construí el portfolio web de un fotógrafo profesional y la presencia web de Alba, una agencia de marketing, utilizando animaciones CSS, interfaces responsivas y prácticas básicas de SEO.",
        "Despliego proyectos en Vercel y utilizo Git para control de versiones; según el proyecto, trabajo también con Linux, SSH, Docker y Docker Compose."
      ],
      bulletsEn: [
        "Engineered custom web applications and portfolios using Next.js and Firebase with emphasis on performance, responsive UI, and maintenance.",
        "Built professional photographer portfolio and marketing agency websites utilizing smooth CSS animations and SEO best practices.",
        "Deployed production projects to Vercel with Git version control, Linux server administration, SSH, and Docker Compose."
      ]
    }
  ],
  featuredProjects: [
    {
      title: "Sistema de Reserva de Ambientes",
      titleEn: "Facility Reservation System",
      context: "Facultad de Ciencias y Tecnología — Taller de Ingeniería de Software",
      contextEn: "School of Engineering — Software Engineering Lab",
      bullets: [
        "Desarrollé una aplicación para la gestión de reservas de aulas y ambientes, permitiendo seleccionar espacios por fecha y horario.",
        "Implementé validaciones de disponibilidad para evitar conflictos de horario y aplicar restricciones asociadas al ambiente o al usuario.",
        "Desarrollé operaciones CRUD y lógica de negocio para la gestión de ambientes, usuarios, horarios y reservas."
      ],
      bulletsEn: [
        "Engineered web application for managing academic classroom reservations by date and time slots.",
        "Implemented schedule conflict detection logic to eliminate double bookings and enforce room capacity rules.",
        "Built full backend CRUD business logic and database queries for spaces, users, schedules, and reservations."
      ]
    }
  ],
  education: [
    {
      degree: "Diplomado en Ciencia de Datos e Inteligencia Artificial",
      degreeEn: "Postgraduate Diploma in Data Science & Artificial Intelligence",
      institution: "Universidad Mayor de San Simón",
      period: "Feb 2026 – Sep 2026",
      location: "Cochabamba, Bolivia",
      description: "Formación en análisis y preparación de datos, machine learning, evaluación de modelos e inteligencia artificial aplicada.",
      descriptionEn: "Advanced training in data preparation, machine learning algorithms, model evaluation, and applied artificial intelligence."
    },
    {
      degree: "Ingeniería de Sistemas",
      degreeEn: "Bachelor of Science in Systems Engineering",
      institution: "Universidad Mayor de San Simón",
      period: "2018 – 2024",
      location: "Cochabamba, Bolivia",
      description: "Título Profesional de Grado Universitario en Ingeniería de Sistemas.",
      descriptionEn: "Official University Engineering Degree in Systems Engineering."
    }
  ],
  certifications: [
    "Cisco CCNA: Introduction to Networks (2022); Switching, Routing and Wireless Essentials (2023); Enterprise Networking, Security and Automation (2023).",
    "GNU/Linux Intermedio — UNAM, 2023.",
    "Python, Programación Orientada a Objetos e Interfaces Gráficas — UNAM, 2022."
  ],
  certificationsEn: [
    "Cisco CCNA: Introduction to Networks (2022); Switching, Routing and Wireless Essentials (2023); Enterprise Networking, Security and Automation (2023).",
    "Intermediate GNU/Linux — UNAM, 2023.",
    "Python, Object Oriented Programming & Graphical Interfaces — UNAM, 2022."
  ],
  languages: [
    { language: "Español", languageEn: "Spanish", level: "Nativo", levelEn: "Native Speaker" },
    { language: "Inglés", languageEn: "English", level: "Avanzado — Comunicación oral y escrita, lectura y redacción de documentación técnica", levelEn: "Advanced — Technical documentation, written & verbal communication" }
  ]
};
