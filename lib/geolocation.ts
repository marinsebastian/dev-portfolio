import type { ScopeType } from '@/data/mauForondaCensusData';
import type { UserLocation } from '@/context/GeoConsoleContext';

export const GEO_CONSENT_KEY = 'portfolio_geo_consent';

export type GeoConsent = 'granted' | 'ip-only' | 'declined';

export function readStoredConsent(): GeoConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(GEO_CONSENT_KEY);
    return value === 'granted' || value === 'ip-only' || value === 'declined' ? value : null;
  } catch {
    return null;
  }
}

export function storeConsent(consent: GeoConsent): void {
  try {
    window.localStorage.setItem(GEO_CONSENT_KEY, consent);
  } catch {
    // Private mode or blocked storage: the choice still applies this session.
  }
}

/** Metro areas the census archive actually has block coverage for. */
const METRO_ANCHORS: { scope: Exclude<ScopeType, 'Nacional'>; lat: number; lng: number }[] = [
  { scope: 'Santa Cruz', lat: -17.78, lng: -63.18 },
  { scope: 'Cochabamba', lat: -17.39, lng: -66.16 },
  { scope: 'La Paz', lat: -16.51, lng: -68.13 },
];

/**
 * Picks the preset scope whose metro centre is closest to a coordinate.
 *
 * Deliberately coarse: this only chooses which of three city views to open, so
 * squared degrees are accurate enough and avoid a haversine for no benefit.
 */
export function nearestScope(lat: number, lng: number): Exclude<ScopeType, 'Nacional'> {
  let best = METRO_ANCHORS[0];
  let bestDist = Infinity;

  for (const anchor of METRO_ANCHORS) {
    const dist = (anchor.lat - lat) ** 2 + (anchor.lng - lng) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = anchor;
    }
  }

  return best.scope;
}

/** Maps a department name onto the nearest scope with block coverage. */
export function scopeForDepartment(department: string | null): Exclude<ScopeType, 'Nacional'> | null {
  if (!department) return null;
  const normalized = department.toLowerCase();
  if (normalized.includes('santa cruz')) return 'Santa Cruz';
  if (normalized.includes('cochabamba')) return 'Cochabamba';
  if (normalized.includes('paz') || normalized.includes('alto')) return 'La Paz';
  return null;
}

/** Browser geolocation as a promise, with an explicit timeout and no retries. */
export function requestBrowserLocation(timeoutMs = 10_000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not available in this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: timeoutMs,
      maximumAge: 300_000,
    });
  });
}

export interface IpLookupResult {
  lat: number;
  lng: number;
  city: string | null;
  department: string | null;
  country: string | null;
  inBolivia: boolean;
  resolved: boolean;
}

export async function lookupIpLocation(): Promise<IpLookupResult | null> {
  try {
    const res = await fetch('/api/geo-ip', { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return (await res.json()) as IpLookupResult;
  } catch {
    return null;
  }
}

/**
 * Reverse-geocodes a GPS fix to a department by proximity to the metro anchors.
 * Coarse on purpose — no third-party reverse geocoder is called, so a precise
 * position never leaves the browser.
 */
export function locationFromPosition(position: GeolocationPosition): UserLocation {
  const { latitude, longitude, accuracy } = position.coords;
  const scope = nearestScope(latitude, longitude);
  return {
    lat: latitude,
    lng: longitude,
    department: scope,
    city: null,
    source: 'gps',
    accuracyM: typeof accuracy === 'number' ? Math.round(accuracy) : null,
  };
}

export function locationFromIp(result: IpLookupResult): UserLocation {
  return {
    lat: result.lat,
    lng: result.lng,
    department: result.department,
    city: result.city,
    source: 'ip',
    accuracyM: null,
  };
}
