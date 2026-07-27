import { ImageResponse } from 'next/og';

export const alt =
  'Sebastian Marin — Ingeniero de Sistemas. Interfaces, APIs, datos espaciales y automatización.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Social preview card. Mirrors the site's Operational Data Console palette so a
 * shared link reads as the same product before the page loads.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0b0f17',
          backgroundImage:
            'radial-gradient(circle at 22% 18%, rgba(20,184,166,0.20) 0%, rgba(11,15,23,0) 55%)',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 62,
              height: 62,
              borderRadius: 14,
              border: '2px solid rgba(20,184,166,0.55)',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2dd4bf',
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            SM
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#f8fafc', fontSize: 30, fontWeight: 700 }}>Sebastian Marin</div>
            <div style={{ color: '#5eead4', fontSize: 20, letterSpacing: 1 }}>
              Ingeniero de Sistemas · Cochabamba, Bolivia
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            Desarrollador Full-Stack
          </div>
          <div
            style={{
              color: '#2dd4bf',
              fontSize: 42,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            Interfaces · APIs REST · Datos Espaciales · Automatización
          </div>
          <div style={{ color: '#cbd5e1', fontSize: 25, lineHeight: 1.4, maxWidth: 950 }}>
            Convierto datos públicos y procesos manuales en herramientas operativas.
          </div>
        </div>

        {/* Footer chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {['Next.js · TypeScript', 'PHP 8 · cURL · MySQL', 'MapLibre GL · PMTiles', 'Linux · Docker · Playwright'].map(
            (chip) => (
              <div
                key={chip}
                style={{
                  display: 'flex',
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: '1px solid #1e293b',
                  backgroundColor: '#0f172a',
                  color: '#cbd5e1',
                  fontSize: 20,
                }}
              >
                {chip}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
