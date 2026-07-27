'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useGeoConsole } from '@/context/GeoConsoleContext';
import { lookupIpLocation, locationFromIp, locationFromPosition } from '@/lib/geolocation';

/**
 * Small map centred on wherever the visitor is inferred to be, alongside a
 * plain-language explanation of how that was worked out.
 */
export default function UserSpatialMiniMap() {
  const { t } = useLanguage();
  const { userLocation, setUserLocation } = useGeoConsole();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [lookupFailed, setLookupFailed] = useState(false);
  const [gpsRequesting, setGpsRequesting] = useState(false);

  const resolving = (!userLocation && !lookupFailed) || gpsRequesting;

  // Fall back to a coarse IP lookup when the visitor has not shared a position
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
    el.className = 'h-4 w-4 rounded-full bg-teal-400 ring-4 ring-teal-400/30 animate-pulse';

    markerRef.current?.remove();
    markerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    map.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: userLocation.source === 'gps' ? 13.5 : 10.5,
      duration: 1600,
    });
  }, [userLocation]);

  const requestGpsLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    setGpsRequesting(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsRequesting(false);
        setUserLocation(locationFromPosition(pos));
      },
      () => {
        setGpsRequesting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-[#070a11] p-4">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <span className="flex items-center gap-2 font-mono-tech text-[11px] font-bold uppercase text-slate-300">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-teal-400" />
          {t('micro.spatialTitle')}
        </span>
        <div className="flex items-center gap-2">
          {resolving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />}
          <button
            type="button"
            onClick={requestGpsLocation}
            disabled={gpsRequesting}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-[10px] font-mono-tech font-bold transition-all border border-teal-500/40"
          >
            <Navigation className="w-3 h-3 text-teal-400 shrink-0" />
            <span>GPS</span>
          </button>
        </div>
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
