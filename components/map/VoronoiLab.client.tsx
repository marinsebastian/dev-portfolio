'use client';
import { useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import { PlusCircle } from 'lucide-react';
import { DownloadIcon, RefreshCwIcon } from '@animateicons/react/lucide';
import { useIconAnimator } from '@/lib/useIconAnimator';

interface Point {
  id: number;
  lat: number;
  lng: number;
  name: string;
}

/** Working area the tessellation is clipped to, in [lat, lng]. */
const CLIP_BOUNDS = {
  minLat: -17.75,
  maxLat: -17.05,
  minLng: -66.6,
  maxLng: -65.7,
};

const PALETTE = ['#14b8a6', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6'];

function ClickHandler({ onAddPoint }: { onAddPoint: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Voronoi cell for `site`, computed by half-plane intersection: start from the
 * clip rectangle and successively clip it against the perpendicular bisector of
 * `site` and every other site, keeping the half-plane closer to `site`. The
 * result is the exact cell — every location inside it has `site` as its nearest
 * neighbour — and the cells tile the working area with no gaps or overlaps.
 */
function voronoiCell(site: Point, others: Point[]): [number, number][] {
  // Rectangle in [lat, lng], counter-clockwise.
  let cell: [number, number][] = [
    [CLIP_BOUNDS.minLat, CLIP_BOUNDS.minLng],
    [CLIP_BOUNDS.minLat, CLIP_BOUNDS.maxLng],
    [CLIP_BOUNDS.maxLat, CLIP_BOUNDS.maxLng],
    [CLIP_BOUNDS.maxLat, CLIP_BOUNDS.minLng],
  ];

  for (const other of others) {
    if (other.id === site.id) continue;

    // Perpendicular bisector of (site, other) as a half-plane test:
    // keep points p where dot(p - midpoint, other - site) <= 0.
    const dLat = other.lat - site.lat;
    const dLng = other.lng - site.lng;
    const midLat = (site.lat + other.lat) / 2;
    const midLng = (site.lng + other.lng) / 2;
    if (dLat === 0 && dLng === 0) continue;

    const side = (p: [number, number]) => (p[0] - midLat) * dLat + (p[1] - midLng) * dLng;

    cell = clipPolygon(cell, side);
    if (cell.length === 0) break;
  }

  return cell;
}

/** Sutherland–Hodgman clip of `polygon` against the half-plane `side(p) <= 0`. */
function clipPolygon(
  polygon: [number, number][],
  side: (p: [number, number]) => number
): [number, number][] {
  const out: [number, number][] = [];

  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const previous = polygon[(i + polygon.length - 1) % polygon.length];
    const currentInside = side(current) <= 0;
    const previousInside = side(previous) <= 0;

    if (currentInside !== previousInside) {
      // Edge crosses the bisector: add the intersection point.
      const sPrev = side(previous);
      const sCurr = side(current);
      const tRaw = sPrev / (sPrev - sCurr);
      const t = Math.min(1, Math.max(0, tRaw));
      out.push([
        previous[0] + t * (current[0] - previous[0]),
        previous[1] + t * (current[1] - previous[1]),
      ]);
    }

    if (currentInside) out.push(current);
  }

  return out;
}

/** Metres per degree of latitude — close enough at this scale for a coverage ring. */
const M_PER_DEG_LAT = 111_320;

/** Circle of `radiusM` around a point, as a closed ring in [lat, lng]. */
function coverageRing(pt: Point, radiusM: number, segments = 48): [number, number][] {
  const dLat = radiusM / M_PER_DEG_LAT;
  const dLng = radiusM / (M_PER_DEG_LAT * Math.cos((pt.lat * Math.PI) / 180));

  return Array.from({ length: segments }, (_, i) => {
    const angle = (i / segments) * 2 * Math.PI;
    return [pt.lat + dLat * Math.sin(angle), pt.lng + dLng * Math.cos(angle)] as [number, number];
  });
}

export default function VoronoiLabClient() {
  const [points, setPoints] = useState<Point[]>([
    { id: 1, lat: -17.3895, lng: -66.1568, name: 'Cochabamba Node 1' },
    { id: 2, lat: -17.32, lng: -66.22, name: 'Quillacollo Station' },
    { id: 3, lat: -17.43, lng: -66.1, name: 'Sacaba Hub' },
  ]);
  const [radiusM, setRadiusM] = useState(3000);
  const prefersReducedMotion = useReducedMotion();
  const { ref: resetIconRef, handlers: resetIconHandlers } = useIconAnimator(prefersReducedMotion ?? false);
  const { ref: exportIconRef, handlers: exportIconHandlers } = useIconAnimator(prefersReducedMotion ?? false, 300);

  const cells = useMemo(
    () => points.map((p, idx) => ({ point: p, polygon: voronoiCell(p, points), color: PALETTE[idx % PALETTE.length] })),
    [points]
  );

  // A service point covers the intersection of its Voronoi cell (everything it
  // is nearest to) and its physical reach — which is what actually determines
  // whether a location is served.
  const coverageAreaKm2 = useMemo(
    () => (Math.PI * (radiusM / 1000) ** 2 * points.length).toFixed(1),
    [radiusM, points.length]
  );

  const handleAddPoint = (lat: number, lng: number) => {
    setPoints((prev) => [...prev, { id: Date.now(), lat, lng, name: `Point ${prev.length + 1}` }]);
  };

  const handleReset = () => setPoints([]);

  /** Exports the computed coverage cells as polygons, not just the input sites. */
  const handleExportGeoJson = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: cells
        .filter((c) => c.polygon.length >= 3)
        .map((c) => ({
          type: 'Feature',
          properties: { id: c.point.id, name: c.point.name, site: [c.point.lng, c.point.lat] },
          geometry: {
            type: 'Polygon',
            // GeoJSON is [lng, lat] and rings must be explicitly closed.
            coordinates: [[...c.polygon.map(([lat, lng]) => [lng, lat]), [c.polygon[0][1], c.polygon[0][0]]]],
          },
        })),
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voronoi_coverage_cells.geojson';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-t-xl text-xs font-mono-tech">
        <div className="flex items-center space-x-2 text-slate-300 min-w-0">
          <PlusCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span className="truncate">
            CLICK MAP TO ADD SERVICE POINTS ({points.length} ACTIVE · {cells.filter((c) => c.polygon.length >= 3).length} CELLS)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            {...resetIconHandlers}
            className="flex items-center space-x-1 px-3 py-2 min-h-[40px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            <RefreshCwIcon ref={resetIconRef} size={14} className="shrink-0" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={handleExportGeoJson}
            disabled={points.length === 0}
            {...exportIconHandlers}
            className="flex items-center space-x-1 px-3 py-2 min-h-[40px] rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
          >
            <DownloadIcon ref={exportIconRef} size={14} className="shrink-0" />
            <span>Export GeoJSON</span>
          </button>
        </div>
      </div>

      <div className="h-[360px] w-full rounded-b-xl overflow-hidden border border-slate-800 shadow-xl">
        <MapContainer center={[-17.3895, -66.1568]} zoom={10} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ClickHandler onAddPoint={handleAddPoint} />

          {cells.map(
            (c) =>
              c.polygon.length >= 3 && (
                <Polygon
                  key={`cell-${c.point.id}`}
                  positions={c.polygon}
                  pathOptions={{
                    color: c.color,
                    fillColor: c.color,
                    fillOpacity: 0.18,
                    weight: 1.5,
                  }}
                />
              )
          )}

          {/* Physical reach of each service point, dashed so it reads as a
              constraint layered over the nearest-neighbour cells. */}
          {points.map((pt) => (
            <Polygon
              key={`reach-${pt.id}`}
              positions={coverageRing(pt, radiusM)}
              pathOptions={{
                color: '#f8fafc',
                weight: 1,
                opacity: 0.45,
                dashArray: '3, 5',
                fillOpacity: 0.04,
                fillColor: '#f8fafc',
              }}
            />
          ))}

          {/* CircleMarker avoids Leaflet's default icon, which resolves to a CDN
              path that 404s under a bundler. */}
          {cells.map((c) => (
            <CircleMarker
              key={c.point.id}
              center={[c.point.lat, c.point.lng]}
              radius={6}
              pathOptions={{ color: '#0b0f17', fillColor: c.color, fillOpacity: 1, weight: 2 }}
            >
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <strong className="text-teal-700 block">{c.point.name}</strong>
                  <span className="font-mono-tech text-[10px] text-slate-600">
                    Lat: {c.point.lat.toFixed(4)}, Lng: {c.point.lng.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Service coverage radius */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3 font-mono-tech text-xs">
        <label htmlFor="voronoi-radius" className="shrink-0 text-slate-400">
          RADIO DE COBERTURA
        </label>
        <input
          id="voronoi-radius"
          type="range"
          min={500}
          max={12000}
          step={500}
          value={radiusM}
          onChange={(e) => setRadiusM(Number(e.target.value))}
          className="h-2 min-w-[140px] flex-1 cursor-pointer appearance-none rounded-full bg-slate-800 accent-teal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        />
        <span className="shrink-0 font-bold text-teal-300">
          {(radiusM / 1000).toFixed(1)} km
        </span>
        <span className="shrink-0 text-slate-500">
          ≈ {coverageAreaKm2} km² · {points.length} nodos
        </span>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-500">
        Cada celda contiene todos los puntos cuyo punto de servicio más cercano es el marcador que la genera.
        Se calcula por intersección de semiplanos (bisectrices perpendiculares) recortada al área de trabajo, en el navegador.
        El círculo punteado marca el alcance físico configurado: una ubicación queda realmente atendida donde la celda y el radio se solapan.
      </p>
    </div>
  );
}
