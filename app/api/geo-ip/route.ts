import { NextResponse } from 'next/server';
import { BOLIVIA_DEPARTMENTS } from '@/data/boliviaGeoJson';

/**
 * Coarse IP geolocation fallback for when the browser location permission is
 * denied or unavailable.
 *
 * Proxied server-side rather than called from the browser so that no third
 * party sees the visitor's IP alongside this site's referrer, and so the
 * upstream can be swapped without touching the client.
 */

interface IpApiResponse {
  status?: string;
  lat?: number;
  lon?: number;
  city?: string;
  regionName?: string;
  country?: string;
  countryCode?: string;
}

/** Bolivia's geographic centre — used when the lookup fails entirely. */
const BOLIVIA_FALLBACK = {
  lat: -17.39,
  lng: -66.16,
  department: 'Cochabamba',
  city: null as string | null,
};

/** Nearest department centroid to a coordinate, by squared degrees. */
function nearestDepartment(lat: number, lng: number): string | null {
  let best: { name: string; dist: number } | null = null;

  for (const dept of BOLIVIA_DEPARTMENTS) {
    const [dLat, dLng] = dept.coordinates;
    const dist = (dLat - lat) ** 2 + (dLng - lng) ** 2;
    if (!best || dist < best.dist) best = { name: dept.name, dist };
  }

  return best?.name ?? null;
}

export async function GET(request: Request) {
  // Vercel and most proxies put the client IP first in x-forwarded-for.
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const clientIp = forwarded.split(',')[0]?.trim();

  // Loopback and private ranges are meaningless upstream; let the API infer
  // from the request origin instead of sending it a useless address.
  const isRoutable =
    clientIp &&
    !clientIp.startsWith('127.') &&
    !clientIp.startsWith('10.') &&
    !clientIp.startsWith('192.168.') &&
    clientIp !== '::1';

  const endpoint = `http://ip-api.com/json/${isRoutable ? clientIp : ''}?fields=status,lat,lon,city,regionName,country,countryCode`;

  try {
    const res = await fetch(endpoint, {
      // Coarse city-level data; a day of caching is plenty and keeps us well
      // inside the free tier's rate limit.
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = (await res.json()) as IpApiResponse;
      if (data.status === 'success' && typeof data.lat === 'number' && typeof data.lon === 'number') {
        const inBolivia = data.countryCode === 'BO';
        return NextResponse.json({
          lat: data.lat,
          lng: data.lon,
          city: data.city ?? null,
          // Outside Bolivia the department is meaningless, so fall back to the
          // default view rather than snapping to a spurious "nearest" one.
          department: inBolivia ? (data.regionName ?? nearestDepartment(data.lat, data.lon)) : null,
          country: data.country ?? null,
          inBolivia,
          source: 'ip' as const,
          resolved: true,
        });
      }
    }
  } catch (err) {
    console.error('[geo-ip] lookup failed:', err);
  }

  return NextResponse.json({
    ...BOLIVIA_FALLBACK,
    country: 'Bolivia',
    inBolivia: true,
    source: 'ip' as const,
    resolved: false,
    note: 'IP lookup unavailable; showing the default Bolivian view.',
  });
}
