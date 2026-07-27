import { test, expect } from '@playwright/test';

/**
 * The location prompt appears 2.5s into a first visit and covers the page.
 * Every suite except the geolocation one pre-seeds a decision so the modal
 * stays out of the way; the geolocation suite clears it to test the real
 * first-visit path.
 */
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    window.localStorage.setItem('portfolio_geo_consent', 'declined');
  });
});

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

  test('marks the active scope for assistive technology', async ({ page }) => {
    await page.goto('/#flagship');

    const santaCruz = page.getByRole('button', { name: /ZM Santa Cruz/i });
    await santaCruz.click();
    await expect(santaCruz).toHaveAttribute('aria-pressed', 'true');

    const nacional = page.getByRole('button', { name: /Bolivia Nacional/i });
    await expect(nacional).toHaveAttribute('aria-pressed', 'false');
  });

  test('credits CARTO, OSM and the dataset author without a canvas watermark', async ({ page }) => {
    await page.goto('/#flagship');

    // The map canvas stays clean; attribution is discrete text in the info card.
    const flagship = page.locator('#flagship');
    await expect(flagship.getByRole('link', { name: /OpenStreetMap/i })).toBeVisible();
    await expect(flagship.getByRole('link', { name: /CARTO/i })).toBeVisible();
    await expect(flagship.getByRole('link', { name: /mauforonda/i }).first()).toBeVisible();

    await expect(page.locator('#flagship .maplibregl-ctrl-attrib')).toHaveCount(0);
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

  test('keeps micro-app action buttons on screen at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    const actionButton = page.getByRole('button', { name: /Enviar|Send|GPS/i }).first();
    await actionButton.scrollIntoViewIfNeeded();
    const box = await actionButton.boundingBox();
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

test.describe('AI copilot', () => {
  test('reports which providers are configured without leaking keys', async ({ request }) => {
    const res = await request.get('/api/ai-copilot');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(Array.isArray(body.available)).toBe(true);
    for (const provider of body.available) {
      expect(['nvidia', 'gemini', 'openai']).toContain(provider.id);
      expect(provider.label).toBeTruthy();
      // The payload must never carry anything key-shaped.
      expect(JSON.stringify(provider)).not.toMatch(/sk-|AIza|nvapi-/);
    }
  });

  test('validates the request before reaching a paid provider', async ({ request }) => {
    const empty = await request.post('/api/ai-copilot', { data: { messages: [] } });
    expect(empty.status()).toBe(400);

    const tooLong = await request.post('/api/ai-copilot', {
      data: { messages: Array.from({ length: 80 }, () => ({ role: 'user', content: 'hi' })) },
    });
    expect(tooLong.status()).toBe(400);
    expect((await tooLong.json()).error).toContain('too long');
  });

  test('opens focused mode with the map and chat side by side', async ({ page }) => {
    await page.goto('/#flagship');
    await page.getByRole('button', { name: /Copiloto|Copilot/i }).click();

    const console_ = page.getByTestId('focused-console');
    await expect(console_).toBeVisible();
    // Both halves are present: a live map canvas and the chat composer.
    await expect(console_.locator('canvas.maplibregl-canvas')).toBeVisible();
    await expect(console_.getByRole('button', { name: /Enviar mensaje|Send message/i })).toBeVisible();
    await expect(console_.getByRole('combobox', { name: /Proveedor de IA|AI provider/i })).toBeVisible();

    // Escape closes it and returns to the page.
    await page.keyboard.press('Escape');
    await expect(console_).toBeHidden();
  });

  test('offers starter suggestion chips', async ({ page }) => {
    await page.goto('/#flagship');
    await page.getByRole('button', { name: /Copiloto|Copilot/i }).click();

    const console_ = page.getByTestId('focused-console');
    await expect(console_.getByRole('button', { name: /fibra > 80%|fibre > 80%/i })).toBeVisible();
  });
});

test.describe('Live micro-apps', () => {
  test('the API tester issues a real request and shows the response', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /APIs e Integraciones|APIs & Integration/i }).click();

    await expect(page.getByText(/Probador de API REST|REST API tester/i)).toBeVisible();
    await page.getByRole('button', { name: /^Enviar$|^Send$/ }).click();

    // A real 200 from /api/spatial, rendered into the response pane.
    await expect(page.getByText('200', { exact: true })).toBeVisible({ timeout: 15000 });

    const responseBody = page.locator('pre').filter({ hasText: '"status": "success"' }).first();
    await expect(responseBody).toBeVisible();
    await expect(responseBody).toContainText('Cochabamba');
  });

  test('the telemetry dashboard measures this page, not a mock', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Telemetría de esta página|Telemetry for this page/i)).toBeVisible();
    // TTFB comes from the Navigation Timing API of the real page load.
    await expect(page.getByText(/TTFB:\s*\d+\s*ms/)).toBeVisible({ timeout: 15000 });
  });

  test('the terminal replays a recorded session and says it is not a shell', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Linux, CLI/i }).click();

    await expect(page.getByText(/Consola de sincronización|Sync console/i)).toBeVisible();
    await expect(page.getByText(/No es una shell remota|Not a remote shell/i)).toBeVisible();

    await page.getByRole('button', { name: /Reproducir sesión|Replay session/i }).click();
    await expect(page.getByText(/crontab -l/)).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Playwright runner panel', () => {
  test('runs through every step and reports them all passing', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('runner-start').scrollIntoViewIfNeeded();
    await page.getByTestId('runner-start').click();

    const progress = page.getByTestId('runner-progress');
    await expect(progress).toContainText('10 / 10', { timeout: 30000 });
  });
});

test.describe('Contact privacy', () => {
  test('keeps the phone number out of the served HTML', async ({ request }) => {
    const res = await request.get('/');
    const html = await res.text();
    expect(html).not.toContain('72295996');
  });

  test('reveals the number only after an explicit click', async ({ page }) => {
    await page.goto('/#contact');

    const trigger = page.getByTestId('reveal-phone');
    await expect(trigger).toBeVisible();

    await trigger.click();
    const link = page.getByTestId('phone-link').first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /^tel:\+\d+$/);
  });
});

test.describe('Geolocation consent', () => {
  // Undo the global seed: this suite tests the first-visit path itself.
  test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => {
      window.localStorage.removeItem('portfolio_geo_consent');
    });
  });

  test('asks before reading location and records a decline', async ({ page }) => {
    await page.goto('/');

    const dialog = page.getByTestId('geo-consent');
    await expect(dialog).toBeVisible({ timeout: 15000 });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    // The copy must state why the permission is wanted.
    await expect(dialog.getByText(/Censo 2024|2024 Census/i)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    const consent = await page.evaluate(() => localStorage.getItem('portfolio_geo_consent'));
    expect(consent).toBe('declined');
  });

  test('/api/geo-ip answers with a usable Bolivian fallback', async ({ request }) => {
    const res = await request.get('/api/geo-ip');
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(typeof body.lat).toBe('number');
    expect(typeof body.lng).toBe('number');
    expect(body.source).toBe('ip');
  });
});

test.describe('Map layer selector', () => {
  test('groups census layers by theme and states their units', async ({ page }) => {
    await page.goto('/#flagship');

    const select = page.locator('#census-layer-select');
    await expect(select).toBeVisible();

    const groups = await select.locator('optgroup').allTextContents();
    expect(groups.length).toBeGreaterThanOrEqual(3);

    // Units belong on the option so density and coverage are not read alike.
    await expect(select.locator('option', { hasText: 'hab/ha' })).toHaveCount(1);
    await expect(select.locator('option', { hasText: '(%)' }).first()).toBeAttached();

    await select.selectOption('TECH_CONN');
    await expect(select).toHaveValue('TECH_CONN');
  });
});

test.describe('Gemini tool-call contract', () => {
  /**
   * Gemini's OpenAI-compat layer attaches `extra_content.google.thought_signature`
   * to every tool call and rejects the following turn with 400 INVALID_ARGUMENT
   * if it is not echoed back verbatim. This guards both directions of that
   * contract. It self-skips when no Gemini key is configured.
   */
  test('requires the thought_signature to be echoed back', async ({ request }) => {
    const providers = await (await request.get('/api/ai-copilot')).json();
    const hasGemini = (providers.available ?? []).some(
      (p: { id: string }) => p.id === 'gemini'
    );
    test.skip(!hasGemini, 'GEMINI_API_KEY is not configured in this environment.');

    const tools = [
      {
        type: 'function',
        function: {
          name: 'set_map_layer',
          description: 'Switch the census metric layer.',
          parameters: {
            type: 'object',
            properties: { layer: { type: 'string', enum: ['DENSITY', 'TECH_CONN'] } },
            required: ['layer'],
          },
        },
      },
    ];
    const base = [
      { role: 'system', content: 'You control a census map. Use tools when asked.' },
      { role: 'user', content: 'Switch the layer to density please' },
    ];

    const first = await request.post('/api/ai-copilot', {
      data: { provider: 'gemini', tools, messages: base },
    });
    expect(first.status()).toBe(200);

    // Reassemble the tool call from the stream, extra_content included.
    let call: Record<string, unknown> | null = null;
    for (const line of (await first.text()).split('\n')) {
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      const fragment = JSON.parse(payload)?.choices?.[0]?.delta?.tool_calls?.[0];
      if (!fragment) continue;
      call = {
        id: fragment.id,
        type: 'function',
        function: { name: fragment.function.name, arguments: fragment.function.arguments },
        extra_content: fragment.extra_content,
      };
    }

    expect(call, 'Gemini should have returned a tool call').not.toBeNull();
    expect(call!.extra_content).toBeTruthy();

    const toolTurn = (assistantCall: Record<string, unknown>) => [
      ...base,
      { role: 'assistant', content: '', tool_calls: [assistantCall] },
      { role: 'tool', tool_call_id: assistantCall.id, content: '{"ok":true}' },
    ];

    const withSignature = await request.post('/api/ai-copilot', {
      data: { provider: 'gemini', messages: toolTurn(call!) },
    });
    expect(withSignature.status()).toBe(200);

    const stripped = { ...call! };
    delete stripped.extra_content;
    const withoutSignature = await request.post('/api/ai-copilot', {
      data: { provider: 'gemini', messages: toolTurn(stripped) },
    });
    expect(withoutSignature.status()).toBe(400);
    // Also proves the array-wrapped Gemini error body is unwrapped correctly.
    expect((await withoutSignature.json()).error).toContain('thought_signature');
  });
});
