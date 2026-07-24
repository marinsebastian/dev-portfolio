export interface CVData {
  personal: {
    name: string;
    title: string;
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
    items: string;
  }[];
  experience: {
    role: string;
    company: string;
    period: string;
    location: string;
    bullets: string[];
  }[];
  featuredProjects: {
    title: string;
    context: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    period: string;
    location: string;
    description?: string;
  }[];
  certifications: string[];
  languages: {
    language: string;
    level: string;
  }[];
}

export const SEBASTIAN_CV_DATA: CVData = {
  personal: {
    name: "Sebastian Marin",
    title: "Ingeniero de Sistemas — Desarrollador Fullstack",
    location: "Cochabamba, Bolivia",
    phone: "+591 72295996",
    email: "marinsebastian143@gmail.com",
    github: "github.com/marinsebastian",
    githubUrl: "https://github.com/marinsebastian",
    pdfPath: "/CV Sebastian Marin.pdf",
    profileSummaryEs: "Soy Ingeniero de Sistemas y desarrollador Full-Stack con experiencia en aplicaciones web, interfaces responsivas, integración de APIs REST, bases de datos relacionales y automatización. Recientemente trabajé con Next.js, TypeScript, MySQL y Firebase en una plataforma de comercio electrónico, participando en la gestión del catálogo, integración de pagos mediante QR y desarrollo de un asistente de soporte con Gemini API. Uso Linux habitualmente como entorno de desarrollo y cuento con experiencia práctica en Git, Docker Compose, SSH, Bash, PowerShell, cron jobs, Playwright y análisis de logs. Actualmente curso un Diplomado en Ciencia de Datos e Inteligencia Artificial, profundizando en preparación de datos, machine learning, evaluación de modelos e IA aplicada.",
    profileSummaryEn: "I am a Systems Engineer and Full-Stack Developer with hands-on experience in web applications, responsive interfaces, REST API integrations, relational databases, and automation. Recently built e-commerce solutions with Next.js, TypeScript, MySQL, and Firebase, integrating BCP QR payments and a Gemini API support assistant via an internal proxy. Linux user with workflow experience in Git, Docker Compose, SSH, Bash, PowerShell, cron background tasks, and Playwright automated testing. Currently completing a Data Science & AI Postgraduate Diploma."
  },
  skills: [
    {
      category: "Desarrollo Web",
      items: "Next.js, React, TypeScript, JavaScript, HTML, CSS, interfaces responsivas, animaciones CSS, SEO básico y mejora de UI/UX."
    },
    {
      category: "Backend y APIs",
      items: "Node.js, Python, Django, APIs REST, JSON, integración de servicios externos, validación y manejo de errores. Experiencia previa con PHP, CRUD e integración segura con MySQLi/PDO."
    },
    {
      category: "Bases de Datos",
      items: "MySQL, PostgreSQL, Supabase y SQL Server; diseño de tablas, consultas SQL, joins, filtros, agregaciones e integración con aplicaciones web y APIs."
    },
    {
      category: "Linux, DevOps y QA",
      items: "Linux CLI, Bash, PowerShell, Git, SSH, Docker, Docker Compose, cron jobs, variables de entorno, revisión de logs, despliegue remoto y pruebas automatizadas con Playwright."
    },
    {
      category: "IA y Datos",
      items: "Gemini API y herramientas de desarrollo asistido por IA como Antigravity, Gemini CLI y Hermes Agent; formación activa en ciencia de datos y machine learning. Familiaridad con Leaflet y visualización de información espacial."
    }
  ],
  experience: [
    {
      role: "Desarrollador Web",
      company: "Awtu Commerce",
      period: "Feb 2026 – Abr 2026",
      location: "Remoto · Modalidad flexible",
      bullets: [
        "Trabajé principalmente en el frontend de una plataforma de comercio electrónico con Next.js, TypeScript, MySQL y Firebase, colaborando con un equipo de desarrollo mediante Git.",
        "Desarrollé funcionalidades para la vista administrativa, incluyendo gestión de categorías, productos y colecciones, además de componentes para carga y administración del catálogo.",
        "Trabajé en la experiencia de la tienda, desarrollando vistas de productos, filtros por categoría, colección y precio, y páginas individuales de producto.",
        "Integré la API de pagos QR del Banco de Crédito BCP, implementando verificación del estado de las transacciones mediante polling y webhooks.",
        "Desarrollé la interfaz frontend de un asistente de atención al cliente basado en Gemini API, con acceso al catálogo de productos a través de una API interna para proteger credenciales.",
        "Realicé pruebas manuales y automatizadas con Playwright en entorno local para validar flujos funcionales antes de integrar cambios al proyecto."
      ]
    },
    {
      role: "Técnico TI",
      company: "Universidad Mayor de San Simón — Facultad de Ciencias y Tecnología",
      period: "Ene 2025 – Presente",
      location: "Cochabamba, Bolivia",
      bullets: [
        "Automatizo tareas operativas con PowerShell y Bash, especialmente instalación y configuración de software de uso frecuente.",
        "Desarrollo scripts para respaldo de archivos y restauración de backups, reduciendo tareas manuales repetitivas y acelerando la recuperación de equipos.",
        "Diagnostico y resuelvo incidencias de hardware, software, sistemas operativos y conectividad para usuarios de la facultad.",
        "Apoyo en configuración y diagnóstico de redes, routers y switches, y documento procedimientos técnicos y soluciones recurrentes."
      ]
    },
    {
      role: "Desarrollador Web Freelance",
      company: "Proyectos propios y clientes",
      period: "2024 – Presente",
      location: "Remoto",
      bullets: [
        "Desarrollo sitios web y portfolios con Next.js y Firebase, priorizando rendimiento, simplicidad, diseño responsivo y facilidad de mantenimiento.",
        "Construí el portfolio web de un fotógrafo profesional y la presencia web de Alba, una agencia de marketing, utilizando animaciones CSS, interfaces responsivas y prácticas básicas de SEO.",
        "Despliego proyectos en Vercel y utilizo Git para control de versiones; según el proyecto, trabajo también con Linux, SSH, Docker y Docker Compose."
      ]
    }
  ],
  featuredProjects: [
    {
      title: "Sistema de Reserva de Ambientes",
      context: "Facultad de Ciencias y Tecnología — Taller de Ingeniería de Software",
      bullets: [
        "Desarrollé una aplicación para la gestión de reservas de aulas y ambientes, permitiendo seleccionar espacios por fecha y horario.",
        "Implementé validaciones de disponibilidad para evitar conflictos de horario y aplicar restricciones asociadas al ambiente o al usuario.",
        "Desarrollé operaciones CRUD y lógica de negocio para la gestión de ambientes, usuarios, horarios y reservas."
      ]
    }
  ],
  education: [
    {
      degree: "Diplomado en Ciencia de Datos e Inteligencia Artificial",
      institution: "Universidad Mayor de San Simón",
      period: "Feb 2026 – Sep 2026",
      location: "Cochabamba, Bolivia",
      description: "Formación en análisis y preparación de datos, machine learning, evaluación de modelos e inteligencia artificial aplicada."
    },
    {
      degree: "Ingeniería de Sistemas",
      institution: "Universidad Mayor de San Simón",
      period: "2018 – 2024",
      location: "Cochabamba, Bolivia",
      description: "Título Profesional de Grado Universitario en Ingeniería de Sistemas."
    }
  ],
  certifications: [
    "Cisco CCNA: Introduction to Networks (2022); Switching, Routing and Wireless Essentials (2023); Enterprise Networking, Security and Automation (2023).",
    "GNU/Linux Intermedio — UNAM, 2023.",
    "Python, Programación Orientada a Objetos e Interfaces Gráficas — UNAM, 2022."
  ],
  languages: [
    { language: "Español", level: "Nativo" },
    { language: "Inglés", level: "Avanzado — Comunicación oral y escrita, lectura y redacción de documentación técnica" }
  ]
};
