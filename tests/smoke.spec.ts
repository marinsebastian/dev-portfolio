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
    // The right column's static panels were replaced with the AI copilot's
    // teaser, right where a visitor already is.
    await expect(page.locator('#flagship').getByText('Copiloto del Mapa')).toBeVisible();
  });

  test('switches Interactive CV tabs', async ({ page }) => {
    await page.goto('/');

    await page.click('button:has-text("Experiencia Laboral")');
    await expect(page.getByText('Awtu Commerce', { exact: true })).toBeVisible();
    await expect(page.getByText('Facultad de Ciencias y Tecnología')).toBeVisible();
  });

  test('does not steal focus or scroll position on a fresh load', async ({ page }) => {
    await page.goto('/');

    // A mount-time `.focus()` deep in the CV section used to silently scroll
    // the page there on every load — this is the regression that fix targets.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    const active = await page.evaluate(() => document.activeElement?.tagName);
    expect(active).not.toBe('BUTTON');
  });
});

test.describe('Navigation — active section indicator', () => {
  test('marks the current section active in the desktop nav while scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    await expect(page.locator('nav a[aria-current="true"]')).toHaveAttribute('href', '#overview');

    await page.locator('#flagship').scrollIntoViewIfNeeded();
    await expect(page.locator('nav a[aria-current="true"]')).toHaveAttribute('href', '#flagship', {
      timeout: 5000,
    });

    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('nav a[aria-current="true"]')).toHaveAttribute('href', '#contact', {
      timeout: 5000,
    });
  });

  test('scroll progress bar paints above the sticky header once scrolled', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // The bar's width animates via a spring, not instantly — poll until it settles.
    await expect
      .poll(
        () =>
          page.evaluate(
            () => document.querySelector('[data-testid="scroll-progress"]')?.getBoundingClientRect().width ?? 0
          ),
        { timeout: 5000 }
      )
      .toBeGreaterThan(1000);

    const bar = page.getByTestId('scroll-progress');
    const box = await bar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(1000);

    // The bar must be the topmost element at its own strip, not painted over
    // by the header — the exact regression this test guards against.
    const topmost = await page.evaluate(() => document.elementFromPoint(640, 1)?.getAttribute('data-testid'));
    expect(topmost).toBe('scroll-progress');
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
      'Seguro Privado',
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
    const inspector = page.getByText(/MANZANO SELECCIONADO/i).first();

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
      await canvas.click({ position: { x: box!.width / 2 + dx, y: box!.height / 2 + dy }, force: true });
      if (await inspector.isVisible().catch(() => false)) break;
      await page.waitForTimeout(500);
    }

    await expect(inspector).toBeVisible({ timeout: 10000 });
    // Density comes straight from the archive in inhabitants per hectare.
    await expect(page.getByText(/\d+ hab\/ha/).first()).toBeVisible();
  });

  test('explains the empty national view instead of showing a blank map', async ({ page }) => {
    await page.goto('/#flagship');

    // "Bolivia" doubles as the national-view option and a dropdown listing
    // the departments the archive has no block coverage for; the PMTiles
    // archive starts at z8, and the national camera sits below it.
    await page.getByRole('button', { name: 'Bolivia' }).click();
    await page.getByRole('option', { name: 'Bolivia' }).click();
    await expect(page.getByText(/SIN COBERTURA DE MANZANOS/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Acercar a los manzanos/i })).toBeVisible();
  });

  test('hides the zoom notice once a city scope is selected', async ({ page }) => {
    await page.goto('/#flagship');

    await page.getByRole('button', { name: 'Cochabamba', exact: true }).click();
    await expect(page.getByText(/SIN COBERTURA DE MANZANOS/i)).toBeHidden({ timeout: 15000 });
  });

  test('marks the active scope for assistive technology', async ({ page }) => {
    await page.goto('/#flagship');

    const santaCruz = page.getByRole('button', { name: 'Santa Cruz', exact: true });
    await santaCruz.click();
    await expect(santaCruz).toHaveAttribute('aria-pressed', 'true');

    const cochabamba = page.getByRole('button', { name: 'Cochabamba', exact: true });
    await expect(cochabamba).toHaveAttribute('aria-pressed', 'false');
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

  test('keeps the mobile nav menu button fully on screen at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    const menuButton = page.getByRole('button', { name: /Open menu|Close menu/i });
    const box = await menuButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(360);
  });

  test('keeps micro-app action buttons on screen at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto('/');

    // The API Explorer (with its "Enviar/Send" button) only mounts once its
    // capability-pillar tab is active — it is not the default pillar shown on load.
    await page.getByRole('button', { name: /APIs e Integraciones Backend|APIs & Backend Integrations/i }).click();

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
    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();

    const console_ = page.getByTestId('focused-console');
    await expect(console_).toBeVisible();
    // Both halves are present: a live map canvas and the chat composer.
    await expect(console_.locator('canvas.maplibregl-canvas')).toBeVisible();
    await expect(console_.getByRole('button', { name: /Enviar mensaje|Send message/i })).toBeVisible();
    await expect(console_.locator('select, [aria-label*="Proveedor"], span:has-text("API keys"), span:has-text("Sin API")').first()).toBeVisible();

    // Escape closes it and returns to the page.
    await page.keyboard.press('Escape');
    await expect(console_).toBeHidden();
  });

  test('shows the selected-block tooltip in Focused Mode too, not just the main page', async ({ page }) => {
    // Focused Mode is how a mobile visitor primarily uses the map (map on
    // top, chat below) — the block inspector used to be a panel that only
    // existed in the main page's layout, so a mobile visitor had no way to
    // see what they had clicked at all once inside this view.
    await page.goto('/#flagship');
    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();

    const console_ = page.getByTestId('focused-console');
    await expect(console_).toBeVisible();
    const canvas = console_.locator('canvas.maplibregl-canvas').first();
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(12000);

    const box = await canvas.boundingBox();
    const tooltip = page.getByText(/MANZANO SELECCIONADO|SELECTED BLOCK/i).first();
    const offsets = [
      [0, 0],
      [40, 30],
      [-40, -30],
      [70, -50],
      [-70, 50],
      [110, 80],
    ];
    for (const [dx, dy] of offsets) {
      try {
        await canvas.click({ position: { x: box!.width / 2 + dx, y: box!.height / 2 + dy }, timeout: 3000, force: true });
      } catch {
        // The tooltip from an earlier successful click in this loop can
        // itself cover the canvas at the next offset — that's evidence the
        // interaction already worked, in this smaller Focused Mode canvas.
        break;
      }
      if (await tooltip.isVisible().catch(() => false)) break;
      await page.waitForTimeout(500);
    }

    await expect(tooltip).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/\d+ hab\/ha/).first()).toBeVisible();
  });

  test('offers starter suggestion chips', async ({ page }) => {
    await page.goto('/#flagship');
    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();

    const console_ = page.getByTestId('focused-console');
    await expect(console_.getByRole('button', { name: /fibra > 80%|fibre > 80%/i })).toBeVisible();
  });
});

/**
 * The flagship section used to embed a second, fully independent `MapCopilot`
 * beside the map: its own `useCopilotChat`, its own history, its own composer.
 * A visitor could hold an entire conversation inline, open Focused Mode, and
 * find an empty chat — two surfaces both presenting themselves as "the AI"
 * while sharing nothing.
 *
 * There is now exactly one copilot instance. It lives in a host element that
 * is reparented between the inline teaser slot and Focused Mode's chat slot,
 * so these tests are really assertions about instance identity: one composer
 * on the page at any time, and one conversation that outlives the trip.
 */
test.describe('Copilot teaser → cockpit handoff', () => {
  const composer = /Pregunta sobre|Ask about/i;

  test('shows a compact teaser inline, not a second chat surface', async ({ page }) => {
    await page.goto('/#flagship');

    const flagship = page.locator('#flagship');
    await expect(flagship.getByTestId('copilot-surface')).toHaveAttribute('data-mode', 'teaser');
    await expect(flagship.getByPlaceholder(composer)).toBeVisible();

    // The teaser is a greeting and a composer. The message log, the provider
    // selector and the reset control belong to the cockpit.
    await expect(flagship.getByRole('combobox', { name: /Proveedor de IA|AI provider/i })).toHaveCount(0);
    await expect(flagship.getByRole('button', { name: /Reiniciar conversación|Reset conversation/i })).toHaveCount(0);
  });

  test('there is only ever one composer on the page', async ({ page }) => {
    await page.goto('/#flagship');
    await expect(page.getByPlaceholder(composer)).toHaveCount(1);

    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();
    await expect(page.getByTestId('focused-console')).toBeVisible();
    await expect(page.getByPlaceholder(composer)).toHaveCount(1);

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('focused-console')).toBeHidden();
    await expect(page.getByPlaceholder(composer)).toHaveCount(1);
  });

  test('sending from the teaser opens the cockpit and carries the message into it', async ({ page }) => {
    await page.goto('/#flagship');

    // Typing alone must not open anything — the handoff is on send, so that
    // it is a deliberate act rather than something a stray keystroke springs.
    await page.locator('#flagship').getByPlaceholder(composer).fill('cuantos manzanos hay');
    await expect(page.getByTestId('focused-console')).toHaveCount(0);

    await page.locator('#flagship').getByPlaceholder(composer).press('Enter');

    const console_ = page.getByTestId('focused-console');
    await expect(console_).toBeVisible();
    await expect(console_.getByTestId('copilot-surface')).toHaveAttribute('data-mode', 'cockpit');
    // The message went into the cockpit's real conversation, rather than into
    // a parallel one the visitor can no longer see.
    await expect(console_.getByText('cuantos manzanos hay')).toBeVisible();
    await expect(page.getByPlaceholder(composer)).toHaveCount(1);
  });

  test('keeps one conversation across the round trip', async ({ page }) => {
    await page.goto('/#flagship');

    await page.locator('#flagship').getByPlaceholder(composer).fill('hola copiloto');
    await page.locator('#flagship').getByPlaceholder(composer).press('Enter');

    const console_ = page.getByTestId('focused-console');
    await expect(console_.getByText('hola copiloto')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(console_).toBeHidden();

    // Reopening cold, from the map's own trigger, must land in the same
    // conversation — this is the regression the single instance exists for.
    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();
    await expect(console_.getByText('hola copiloto')).toBeVisible();
  });

  test('the teaser keeps showing the conversation after the cockpit closes', async ({ page }) => {
    await page.goto('/#flagship');
    const flagship = page.locator('#flagship');

    await flagship.getByPlaceholder(composer).fill('hola desde el teaser');
    await flagship.getByPlaceholder(composer).press('Enter');
    await expect(page.getByTestId('focused-console')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('focused-console')).toBeHidden();

    // Closing used to drop the teaser back to its generic greeting. The chat
    // was still there — reopening proved it — but nothing on the page said so,
    // so closing read as throwing the conversation away.
    await expect(flagship.getByText('hola desde el teaser')).toBeVisible();
    await expect(flagship.getByText(/Puedo leer el mapa/)).toHaveCount(0);
  });

  test('the teaser column stands level with the map beside it', async ({ page }) => {
    await page.goto('/#flagship');
    await expect(page.locator('#copilot-slot-teaser')).toBeVisible();

    const columns = await page.evaluate(() => {
      const slot = document.getElementById('copilot-slot-teaser')!;
      const grid = slot.parentElement!;
      return [...grid.children].map((c) => Math.round(c.getBoundingClientRect().height));
    });

    // A teaser that sizes to its own content leaves a few hundred pixels of
    // dead space under it while the map towers alongside.
    expect(columns).toHaveLength(2);
    expect(Math.abs(columns[0] - columns[1])).toBeLessThanOrEqual(2);
  });

  test('does not strand focus when the teaser hands off', async ({ page }) => {
    await page.goto('/#flagship');

    const teaserInput = page.locator('#flagship').getByPlaceholder(composer);
    await teaserInput.fill('que capa esta activa');
    await teaserInput.press('Enter');

    await expect(page.getByTestId('focused-console')).toBeVisible();
    // Reparenting the host blurs whatever it contained, and the page behind
    // is marked inert in the same commit; either alone would drop a keyboard
    // visitor onto <body> at the exact moment the cockpit opens.
    await expect(page.getByPlaceholder(composer)).toBeFocused();
  });

  test('a cold open still moves focus into the dialog', async ({ page }) => {
    await page.goto('/#flagship');
    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();

    // Opening from the map's button is not a mid-typing handoff, so the
    // overlay should take focus the way any modal does.
    await expect(page.getByRole('button', { name: /Salir|Exit/i })).toBeFocused();
  });

  /**
   * The copilot flies between the two slots by being pinned back over where it
   * was and released. Closing is the awkward direction: React unmounts the
   * overlay — and the slot the copilot is sitting in — in the commit before
   * the move runs, so measuring the host at that point reports a zero-size box
   * at the origin, and the flight home starts from the top-left corner of the
   * screen. The last resting position is remembered for exactly this reason.
   */
  test('flies between the two slots without collapsing to the origin', async ({ page }) => {
    await page.goto('/#flagship');

    type Frame = { top: number; left: number; width: number; height: number };

    // Sampling is armed first and the interaction driven from the test, so the
    // very first frames of the flight are captured rather than whatever the
    // layout had already settled into.
    const armSampler = () =>
      page.evaluate(() => {
        const frames: Frame[] = [];
        const started = performance.now();

        (window as unknown as { __flight: Promise<Frame[]> }).__flight = new Promise((resolve) => {
          const finish = () => resolve(frames);
          const tick = () => {
            // The copilot is briefly detached while it is reparented between
            // slots; that frame has no geometry to judge, so it is skipped
            // rather than allowed to throw and strand the sampler.
            const node = document.querySelector('[data-testid="copilot-surface"]')?.parentElement;
            if (node?.isConnected) {
              const r = node.getBoundingClientRect();
              frames.push({ top: r.top, left: r.left, width: r.width, height: r.height });
            }
            if (performance.now() - started < 550) requestAnimationFrame(tick);
            else finish();
          };
          requestAnimationFrame(tick);
          // Belt and braces: never let a stalled frame loop hang the test.
          window.setTimeout(finish, 3000);
        });
      });

    const collect = () =>
      page.evaluate(() => (window as unknown as { __flight: Promise<Frame[]> }).__flight);

    const assertNeverCollapsed = (frames: Frame[]) => {
      expect(frames.length).toBeGreaterThan(3);
      for (const frame of frames) {
        // A zero-size box at the origin is the signature of measuring a
        // detached node; a real flight keeps its shape the whole way across.
        expect(frame.width).toBeGreaterThan(120);
        expect(frame.height).toBeGreaterThan(80);
        expect(frame.top).toBeGreaterThanOrEqual(0);
      }
    };

    await armSampler();
    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();
    assertNeverCollapsed(await collect());

    await expect(page.getByTestId('focused-console')).toBeVisible();

    await armSampler();
    await page.keyboard.press('Escape');
    assertNeverCollapsed(await collect());
  });

  test('takes the page behind the cockpit out of the tab order', async ({ page }) => {
    await page.goto('/#flagship');
    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();
    await expect(page.locator('main')).toHaveAttribute('inert', '');

    await page.keyboard.press('Escape');
    await expect(page.locator('main')).not.toHaveAttribute('inert', '');
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

    const trigger = page.locator('#census-layer-select');
    await expect(trigger).toBeVisible();
    await trigger.click();

    const listbox = page.getByRole('listbox').first();
    await expect(listbox).toBeVisible();
    const options = listbox.getByRole('option');
    expect(await options.count()).toBeGreaterThanOrEqual(6);

    // Units belong on the option so density and coverage are not read alike.
    await expect(options.filter({ hasText: 'hab/ha' })).toHaveCount(1);
    await expect(options.filter({ hasText: '%' }).first()).toBeAttached();

    await options.filter({ hasText: /internet/i }).click();

    // The map's own legend reflects the newly active layer -- proof the
    // pick actually changed application state, not just closed a menu.
    await expect(page.getByText(/internet/i).first()).toBeVisible();
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

  /**
   * Gemini's OpenAI-compat layer omits the `index` field on tool-call deltas
   * (unlike OpenAI/NVIDIA, which always send one), so a compound request that
   * makes the model call two tools in the same turn used to be silently
   * merged into one corrupted tool call by the client's stream-accumulation
   * logic (concatenated names like "set_map_layerset_map_scope", concatenated
   * invalid-JSON arguments), which the model then rejected on echo-back with
   * a 400. This drives the real UI end-to-end — it is a client-side bug, not
   * a server one, so a request-level test cannot exercise it.
   */
  test('handles a Gemini turn where two tools are requested at once', async ({ page }) => {
    const providers = await (await page.request.get('/api/ai-copilot')).json();
    const hasGemini = (providers.available ?? []).some((p: { id: string }) => p.id === 'gemini');
    test.skip(!hasGemini, 'GEMINI_API_KEY is not configured in this environment.');

    await page.goto('/#flagship');
    await page.getByRole('button', { name: /IA Modo|AI Cockpit/i }).click();

    const console_ = page.getByTestId('focused-console');
    await console_.getByRole('combobox', { name: /Proveedor de IA|AI provider/i }).selectOption('gemini');

    await console_.getByPlaceholder(/Pregunta sobre|Ask about/i).fill(
      'Cambia a la capa de densidad y centra el mapa en La Paz'
    );
    await console_.getByRole('button', { name: /Enviar mensaje|Send message/i }).click();

    // A partially-signed multi-tool Gemini turn used to surface as this error.
    await expect(console_.getByText(/no pudo responder|could not respond/i)).toHaveCount(0, {
      timeout: 20000,
    });
    await expect(console_.getByText('set_map_layer()')).toBeVisible({ timeout: 20000 });
    await expect(console_.getByText('set_map_scope()')).toBeVisible();

    // Prove the map itself moved — not just that the chat claimed it did.
    // The layer picker is a custom dropdown now (no more native <select>
    // value to read), so this checks the map's own legend instead, which
    // reflects whichever layer is actually active.
    await expect(console_.getByText(/densidad poblacional|population density/i).first()).toBeVisible();
  });
});
