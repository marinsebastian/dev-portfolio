import { test, expect } from '@playwright/test';

test.describe('Portfolio — core content', () => {
  test('renders the hero with the Spanish positioning statement by default', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toContainText('Desarrollador Full-Stack enfocado en');
    await expect(page.getByText('Construyo sistemas web que convierten datos')).toBeVisible();
  });

  test('serves the CV PDF at both paths', async ({ request }) => {
    const primary = await request.get('/CV%20Sebastian%20Marin.pdf');
    expect(primary.status()).toBe(200);

    const alias = await request.get('/cv.pdf');
    expect(alias.status()).toBe(200);
  });

  test('renders the flagship GeoInsights section', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#flagship')).toBeVisible();
    await expect(page.getByText('ZONA URBANA SELECCIONADA')).toBeVisible();
  });

  test('switches Interactive CV tabs', async ({ page }) => {
    await page.goto('/');

    await page.click('button:has-text("Experiencia Laboral")');
    await expect(page.getByText('Awtu Commerce', { exact: true })).toBeVisible();
    await expect(page.getByText('Facultad de Ciencias y Tecnología')).toBeVisible();
  });
});

test.describe('Portfolio — bilingual behaviour', () => {
  test('switches section headings between ES and EN', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByText('What I Build')).toBeVisible();

    await page.getByRole('button', { name: 'Español' }).click();
    await expect(page.getByText('Lo Que Construyo')).toBeVisible();
  });

  test('leaves no hardcoded Spanish strings in the English view', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'English' }).click();

    // Strings that used to be hardcoded into components rather than translated.
    const spanishLeftovers = [
      'TITULACIÓN PROFESIONAL',
      'EXPERIENCIA COMERCIAL REAL',
      'ESPECIALIDAD TÉCNICA',
      'ZONA URBANA SELECCIONADA',
      'ALCANCE ESPACIAL',
      'Consume directamente los archivos',
    ];

    const body = await page.locator('body').innerText();
    for (const leftover of spanishLeftovers) {
      expect(body, `"${leftover}" should be translated in EN mode`).not.toContain(leftover);
    }
  });

  test('keeps the document lang attribute in sync with the toggle', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page.getByRole('button', { name: 'Español' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('renders the flagship proof points in Spanish when the site is in Spanish', async ({ page }) => {
    await page.goto('/');

    const flagship = page.locator('#flagship');
    await expect(flagship).toContainText('Transmite 247.346 polígonos reales');
    await expect(flagship).not.toContainText('Streams 247,346 real INE census');
  });
});

test.describe('Flagship map', () => {
  // Regression guard for the coordinate-order bug: SCOPE_CONFIG centres are
  // [lng, lat] for MapLibre. Swapping them puts the camera in the South
  // Atlantic, outside the archive's bounds, and the block layer silently
  // renders nothing while the unbounded basemap keeps loading ocean tiles.
  test('streams census block tiles from the PMTiles archive', async ({ page }) => {
    const rangeRequests: string[] = [];
    page.on('response', (res) => {
      if (res.url().includes('atlas.pmtiles')) {
        rangeRequests.push(res.request().headers()['range'] ?? '');
      }
    });

    await page.goto('/#flagship');
    await expect(page.locator('#flagship canvas.maplibregl-canvas').first()).toBeVisible();

    // Byte-range streaming: header, directory, then tile data at deep offsets.
    // The archive is fetched from GitHub, so allow for a slow cold upstream.
    await expect
      .poll(() => rangeRequests.length, { timeout: 60000, message: 'expected PMTiles tile data requests' })
      .toBeGreaterThan(2);

    // A tile-data read sits far into the ~90 MB archive; a header-only read does not.
    const deepestOffset = Math.max(
      ...rangeRequests.map((r) => Number.parseInt(r.replace('bytes=', '').split('-')[0], 10) || 0)
    );
    expect(deepestOffset).toBeGreaterThan(1_000_000);
  });

  test('shows real per-block census values when a block is clicked', async ({ page }) => {
    await page.goto('/#flagship');
    const canvas = page.locator('#flagship canvas.maplibregl-canvas').first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(12000);

    const box = await canvas.boundingBox();
    const inspector = page.getByText(/MANZANO SELECCIONADO/i);

    // Streets are gaps in the block layer, so probe a few offsets until a
    // polygon is hit rather than assuming the exact centre is built-up.
    const offsets = [
      [0, 0],
      [40, 30],
      [-40, -30],
      [70, -50],
      [-70, 50],
      [110, 80],
    ];
    for (const [dx, dy] of offsets) {
      await canvas.click({ position: { x: box!.width / 2 + dx, y: box!.height / 2 + dy } });
      if (await inspector.isVisible().catch(() => false)) break;
      await page.waitForTimeout(500);
    }

    await expect(inspector).toBeVisible({ timeout: 10000 });
    // Density comes straight from the archive in inhabitants per hectare.
    await expect(page.getByText(/\d+ hab\/ha/)).toBeVisible();
  });

  test('explains the empty national view instead of showing a blank map', async ({ page }) => {
    await page.goto('/#flagship');

    // The PMTiles archive starts at z8; the national camera sits below it.
    await page.getByRole('button', { name: /Bolivia Nacional/i }).click();
    await expect(page.getByText(/SIN COBERTURA DE MANZANOS/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Acercar a los manzanos/i })).toBeVisible();
  });

  test('hides the zoom notice once a city scope is selected', async ({ page }) => {
    await page.goto('/#flagship');

    await page.getByRole('button', { name: /ZM Cochabamba/i }).click();
    await expect(page.getByText(/SIN COBERTURA DE MANZANOS/i)).toBeHidden({ timeout: 15000 });
  });

  test('marks the active scope and layer for assistive technology', async ({ page }) => {
    await page.goto('/#flagship');

    const santaCruz = page.getByRole('button', { name: /ZM Santa Cruz/i });
    await santaCruz.click();
    await expect(santaCruz).toHaveAttribute('aria-pressed', 'true');

    const servicesLayer = page.getByRole('button', { name: /Servicios Básicos y Agua/i });
    await servicesLayer.click();
    await expect(servicesLayer).toHaveAttribute('aria-pressed', 'true');
  });

  test('renders map attribution for CARTO, OSM and the dataset author', async ({ page }) => {
    await page.goto('/#flagship');

    const attribution = page.locator('#flagship .maplibregl-ctrl-attrib').first();
    await expect(attribution).toBeAttached({ timeout: 15000 });
    await expect(attribution).toContainText(/OpenStreetMap/i);
    await expect(attribution).toContainText(/mauforonda/i);
  });
});

test.describe('API routes', () => {
  test('/api/spatial returns a department by id', async ({ request }) => {
    const res = await request.get('/api/spatial?dept=CBB');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('success');
    expect(body.data.name).toBe('Cochabamba');
    expect(body.data.connectivityIndex).toBeGreaterThan(0);
  });

  test('/api/spatial 404s on an unknown department', async ({ request }) => {
    const res = await request.get('/api/spatial?dept=NOPE');
    expect(res.status()).toBe(404);
  });

  test('/api/php-sync presents itself as a contract example, not live telemetry', async ({ request }) => {
    const res = await request.get('/api/php-sync');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.kind).toBe('api-contract-example');
    expect(body.disclaimer).toContain('does not proxy or monitor a running PHP service');
    // The old shape reported a top-level OPERATIONAL status for a service that does not run.
    expect(body.status).toBeUndefined();
  });

  test('/api/gemini-assistant answers about the metro area that was requested', async ({ request }) => {
    const laPaz = await request.post('/api/gemini-assistant', {
      data: { metroArea: 'La Paz', activeLayer: 'TECH_CONN', language: 'en' },
    });
    expect(laPaz.status()).toBe(200);
    const laPazBody = await laPaz.json();
    expect(laPazBody.metroArea).toBe('La Paz');
    expect(laPazBody.zone).toContain('Sopocachi');

    const cochabamba = await request.post('/api/gemini-assistant', {
      data: { metroArea: 'Cochabamba', activeLayer: 'DENSITY', language: 'es' },
    });
    const cochabambaBody = await cochabamba.json();
    expect(cochabambaBody.zone).not.toBe(laPazBody.zone);
  });

  test('/api/gemini-assistant reports its source honestly and uses clicked block data', async ({ request }) => {
    const res = await request.post('/api/gemini-assistant', {
      data: {
        metroArea: 'Santa Cruz',
        blockData: { lngLat: '-17.78, -63.18', density: 72, internet: 64, water: 88, education: 41 },
        activeLayer: 'DENSITY',
        language: 'en',
      },
    });

    const body = await res.json();
    expect(['gemini-api', 'local-fallback']).toContain(body.meta.source);
    expect(body.meta.blockIndicesUsed).toBe(true);
    // No fabricated token counts.
    expect(body.meta.tokensUsed).toBeUndefined();
  });
});

test.describe('Contact', () => {
  test('does not claim a message was sent — it composes a mail draft', async ({ page }) => {
    await page.goto('/#contact');

    await expect(page.getByText(/Este formulario no envía nada por sí solo/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ABRIR EN MI CLIENTE DE CORREO/i })).toBeVisible();
  });
});

test.describe('Responsive layout & accessibility', () => {
  test('has no page-level horizontal scroll at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('keeps the code block Copy button on screen at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    const copyButton = page.getByRole('button', { name: /Copy code to clipboard/i }).first();
    await copyButton.scrollIntoViewIfNeeded();
    const box = await copyButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  });

  test('exposes navigation at tablet widths', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /Open menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.locator('#mobile-nav-drawer')).toBeVisible();
  });

  test('gives the language switcher an accessible name and pressed state', async ({ page }) => {
    await page.goto('/');

    const spanish = page.getByRole('button', { name: 'Español' });
    const english = page.getByRole('button', { name: 'English' });

    await expect(spanish).toHaveAttribute('aria-pressed', 'true');
    await expect(english).toHaveAttribute('aria-pressed', 'false');

    // WCAG 2.5.8 minimum target size.
    const box = await spanish.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(24);
    expect(box!.width).toBeGreaterThanOrEqual(24);
  });
});

test.describe('Social metadata', () => {
  test('exposes a large-image OpenGraph card', async ({ page, request }) => {
    await page.goto('/');

    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

    const ogImageUrl = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImageUrl).toBeTruthy();

    const res = await request.get(new URL(ogImageUrl!).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });
});
