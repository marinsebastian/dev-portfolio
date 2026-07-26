import { test, expect } from '@playwright/test';

test.describe('Sebastian Marin Engineering Portfolio Smoke Tests', () => {
  test('should display hero section and correct positioning statements', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check main headline in default Spanish
    await expect(page.locator('h1')).toContainText('Desarrollador Full-Stack enfocado en');
    await expect(page.getByText('Construyo sistemas web que convierten datos')).toBeVisible();
    
    // Test language switcher toggle to English
    await page.click('button:has-text("EN")');
    await expect(page.locator('h1')).toContainText('Full-Stack Developer focused on');
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
    await expect(page.getByText('ZONA URBANA SELECCIONADA')).toBeVisible();
  });

  test('should verify Interactive CV tab switching works', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('button:has-text("Experiencia Laboral")');
    await expect(page.getByText('Awtu Commerce', { exact: true })).toBeVisible();
    await expect(page.getByText('Facultad de Ciencias y Tecnología')).toBeVisible();
  });

  test('should verify site-wide language switching across all sections', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Toggle to EN
    await page.click('button:has-text("EN")');
    await expect(page.getByText('What I Build')).toBeVisible();
    
    // Toggle back to ES
    await page.click('button:has-text("ES")');
    await expect(page.getByText('Lo Que Construyo')).toBeVisible();
  });
});
