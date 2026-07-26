import { test, expect } from '@playwright/test';

test.describe('Sebastian Marin Engineering Portfolio Smoke Tests', () => {
  test('should display hero section and correct positioning statements', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Switch to English to check the English headline
    await page.click('button:has-text("EN")');
    await expect(page.locator('h1')).toContainText('Full-Stack Developer focused on');
    
    // Switch to Spanish to check the Spanish headline
    await page.click('button:has-text("ES")');
    await expect(page.getByText('Construyo sistemas web que convierten datos')).toBeVisible();
    
    // Check telemetry tag (case-insensitive and not exact)
    await expect(page.getByText('SEBASTIAN MARIN', { exact: false }).first()).toBeVisible();
  });

  test('should verify CV PDF download link is present and accessible', async ({ page, request }) => {
    await page.goto('http://localhost:3000');

    // Verify PDF file request
    const response = await request.get('http://localhost:3000/CV%20Sebastian%20Marin.pdf');
    expect(response.status()).toBe(200);

    // Verify direct cv.pdf alias
    const aliasResponse = await request.get('http://localhost:3000/cv.pdf');
    expect(aliasResponse.status()).toBe(200);
  });

  test('should verify Flagship GeoInsights Bolivia section renders', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page.locator('#flagship')).toBeVisible();
    await expect(page.getByText('ZONA URBANA SELECCIONADA:')).toBeVisible();
  });

  test('should verify Interactive CV tab switching works', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('button:has-text("Experiencia Laboral")');
    await expect(page.locator('#cv').getByText('Awtu Commerce').first()).toBeVisible();
    await expect(page.getByText('Facultad de Ciencias y Tecnología')).toBeVisible();
  });

  test('should verify site-wide language switching across all sections', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Default Spanish checks
    await expect(page.getByText('Lo Que Construyo: Sistemas Web Operativos')).toBeVisible();
    await expect(page.getByText('Casos de Estudio y Proyectos Destacados')).toBeVisible();
    await expect(page.getByText('Experiencia en Herramientas y Stack de Ingeniería')).toBeVisible();
    await expect(page.getByText('Construyamos Sistemas Confiables')).toBeVisible();

    // Toggle to EN
    await page.click('button:has-text("EN")');
    await expect(page.getByText('What I Build: Operational Web Systems')).toBeVisible();
    await expect(page.getByText('Featured Case Studies & Projects')).toBeVisible();
    await expect(page.getByText('Engineering Tooling & Stack Experience')).toBeVisible();
    await expect(page.getByText("Let's Build Reliable Systems Together")).toBeVisible();

    // Toggle back to ES
    await page.click('button:has-text("ES")');
    await expect(page.getByText('Lo Que Construyo: Sistemas Web Operativos')).toBeVisible();
  });
});
