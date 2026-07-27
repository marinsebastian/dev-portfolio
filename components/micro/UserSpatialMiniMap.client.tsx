'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole } from '@/context/GeoConsoleContext';
import { lookupIpLocation, locationFromIp } from '@/lib/geolocation';

/**
 * Small map centred on wherever the visitor is inferred to be, alongside a
 * plain-language explanation of how that was worked out.
 *
 * Deliberately raster-only: this is a locator, not an analysis surface, so it
 * skips the PMTiles vector source and its worker entirely.
 */
export default function UserSpatialMiniMap() {
  const { t } = useLanguage();
  const { userLocation, setUserLocation } = useGeoConsole();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [lookupFailed, setLookupFailed] = useState(false);

  // Derived rather than stored: a lookup is in flight exactly when there is no
  // location yet and the last attempt has not failed.
  const resolving = !userLocation && !lookupFailed;

  // Fall back to a coarse IP lookup when the visitor has not shared a position,
  // so this pillar always has something real to show.
  useEffect(() => {
    if (userLocation || lookupFailed) return;
    let cancelled = false;

    void lookupIpLocation().then((result) => {
      if (cancelled) return;
      if (!result) {
        setLookupFailed(true);
        return;
      }
      setUserLocation(locationFromIp(result));
    });

    return () => {
      cancelled = true;
    };
  }, [userLocation, lookupFailed, setUserLocation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'],
            tileSize: 256,
          },
        },
        layers: [{ id: 'carto-dark-bg', type: 'raster', source: 'carto-dark' }],
      },
      center: [-64.5, -16.5],
      zoom: 4.2,
      attributionControl: false,
      interactive: true,
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;

    const el = document.createElement('div');
    el.className = 'h-3.5 w-3.5 rounded-full bg-teal-400 ring-4 ring-teal-400/25';

    markerRef.current?.remove();
    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    map.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: userLocation.source === 'gps' ? 12 : 9,
      duration: 1600,
    });
  }, [userLocation]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#070a11] p-4">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2 font-mono-tech text-[11px] font-bold uppercase text-slate-300">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-400" />
          {t('micro.spatialTitle')}
        </span>
        {resolving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />}
      </div>

      <div className="h-48 w-full overflow-hidden rounded-lg border border-slate-800">
        <div ref={containerRef} className="h-full w-full bg-slate-950" />
      </div>

      <dl className="grid grid-cols-2 gap-2 font-mono-tech text-[10px]">
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <dt className="text-slate-500">{t('micro.spatialDepartment')}</dt>
          <dd className="font-bold text-teal-300">{userLocation?.department ?? '—'}</dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <dt className="text-slate-500">{t('micro.spatialSource')}</dt>
          <dd className="font-bold text-cyan-300">
            {userLocation
              ? userLocation.source === 'gps'
                ? t('geo.sourceGps')
                : t('geo.sourceIp')
              : '—'}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <dt className="text-slate-500">{t('micro.spatialCoords')}</dt>
          <dd className="font-bold text-slate-200">
            {userLocation ? `${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}` : '—'}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2">
          <dt className="text-slate-500">{t('micro.spatialAccuracy')}</dt>
          <dd className="font-bold text-slate-200">
            {userLocation?.accuracyM ? `±${userLocation.accuracyM} m` : t('micro.spatialCityLevel')}
          </dd>
        </div>
      </dl>

      <p className="font-mono-tech text-[10px] leading-relaxed text-slate-600">
        {t('micro.spatialNote')}
      </p>
    </div>
  );
}
