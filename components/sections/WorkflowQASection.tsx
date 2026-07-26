'use client';
import { useState } from 'react';
import { SectionReveal } from '../motion/SectionReveal';
import { CodeBlock } from '../ui/CodeBlock';
import { Terminal, Shield } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function WorkflowQASection() {
  const { t, language } = useLanguage();

  const WORKFLOW_FILES = [
    {
      id: 'playwright',
      title: 'Playwright Smoke Test',
      subtitle: language === 'es' ? 'QA Automatizado & Pruebas E2E' : 'Automated QA & E2E Validation',
      filename: 'tests/smoke.spec.ts',
      language: 'typescript',
      code: `import { test, expect } from '@playwright/test';

test.describe('Portfolio Engineering Smoke Test Suite', () => {
  test('should load homepage and verify hero telemetry', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Full-Stack');
    await expect(page.getByText('DISPONIBLE / OPERATIVO')).toBeVisible();
  });

  test('should verify CV download link returns HTTP 200', async ({ request }) => {
    const response = await request.get('/CV%20Sebastian%20Marin.pdf');
    expect(response.status()).toBe(200);
  });

  test('should interact with Leaflet map region selector', async ({ page }) => {
    await page.goto('/#flagship');
    await page.click('button:has-text("Cochabamba")');
    await expect(page.getByText('Cochabamba (CBB)')).toBeVisible();
  });
});`
    },
    {
      id: 'php-cron',
      title: 'PHP Background Cron Sync',
      subtitle: language === 'es' ? 'Sincronización cURL API & Registro PDO' : 'cURL API Sync & PDO Storage',
      filename: 'backend/php/cron_sync.php',
      language: 'php',
      code: `<?php
// Linux CLI background cron job script for external dataset synchronization
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

$pdo = new PDO('mysql:host=localhost;dbname=geo_platform;charset=utf8mb4', 'app_user', $_ENV['DB_PASS'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$ch = curl_init("https://api.internal.gov/v1/spatial-records");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => ["Accept: application/json"]
]);

$response = curl_exec($ch);
if (curl_errno($ch)) {
    fwrite(STDERR, "cURL Error: " . curl_error($ch) . "\n");
    exit(1);
}
curl_close($ch);

$records = json_decode($response, true);
$stmt = $pdo->prepare("INSERT INTO region_metrics (dept_code, metric_value, updated_at) VALUES (:dept, :val, NOW())");
foreach ($records['items'] as $item) {
    $stmt->execute([':dept' => $item['dept'], ':val' => $item['val']]);
}

fwrite(STDOUT, "[" . date('Y-m-d H:i:s') . "] Synced " . count($records['items']) . " records successfully.\n");`
    },
    {
      id: 'docker',
      title: 'Docker Compose Stack',
      subtitle: language === 'es' ? 'Despliegue de Entorno Aislado' : 'Isolated Environment Deployment',
      filename: 'docker-compose.yml',
      language: 'yaml',
      code: `version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/spatial"]
      interval: 30s
      timeout: 10s
      retries: 3

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: geo_db
      POSTGRES_USER: geo_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:`
    }
  ];

  const [activeFileId, setActiveFileId] = useState(WORKFLOW_FILES[0].id);
  const activeFile = WORKFLOW_FILES.find((f) => f.id === activeFileId) || WORKFLOW_FILES[0];

  return (
    <section className="py-20 bg-[#070a11] relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <SectionReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 font-mono-tech text-xs text-teal-400">
            <span className="text-slate-600">//</span>
            <span className="uppercase tracking-widest font-semibold">{t('workflow.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            {t('workflow.title')}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            {t('workflow.subtitle')}
          </p>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* File Switcher */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3 h-full">
            <div className="space-y-3">
              {WORKFLOW_FILES.map((file) => {
                const isActive = file.id === activeFileId;
                return (
                  <button
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-slate-900 border-teal-500 text-teal-300 font-bold shadow-lg'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 font-mono-tech text-xs">
                      <Terminal className="w-4 h-4 text-teal-400 shrink-0" />
                      <div>
                        <div className="text-slate-100 font-bold">{file.title}</div>
                        <div className="text-[11px] text-slate-400">{file.subtitle}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono-tech text-xs text-slate-300 space-y-2 mt-auto">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Shield className="w-4 h-4 shrink-0" />
                <span>{t('workflow.qaVerified')}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t('workflow.qaDescription')}
              </p>
            </div>
          </div>

          {/* Active File Viewer */}
          <div className="lg:col-span-8 h-full">
            <CodeBlock
              filename={activeFile.filename}
              language={activeFile.language}
              code={activeFile.code}
            />
          </div>

        </div>

      </div>
    </section>
  );
}
