'use client';
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Download, RefreshCw, PlusCircle, MapPin } from 'lucide-react';

interface Point {
  id: number;
  lat: number;
  lng: number;
  name: string;
}

function ClickHandler({ onAddPoint }: { onAddPoint: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Generate simple mock Voronoi coverage box around a point
function generateApproximateVoronoiBox(pt: Point, delta = 0.25): [number, number][] {
  return [
    [pt.lat + delta, pt.lng - delta],
    [pt.lat + delta, pt.lng + delta],
    [pt.lat - delta, pt.lng + delta],
    [pt.lat - delta, pt.lng - delta],
  ];
}

export default function VoronoiLabClient() {
  const [points, setPoints] = useState<Point[]>([
    { id: 1, lat: -17.3895, lng: -66.1568, name: 'Cochabamba Node 1' },
    { id: 2, lat: -17.3200, lng: -66.2200, name: 'Quillacollo Station' },
    { id: 3, lat: -17.4300, lng: -66.1000, name: 'Sacaba Hub' },
  ]);

  const handleAddPoint = (lat: number, lng: number) => {
    const newPt: Point = {
      id: Date.now(),
      lat,
      lng,
      name: `Point ${points.length + 1}`,
    };
    setPoints([...points, newPt]);
  };

  const handleReset = () => {
    setPoints([]);
  };

  const handleExportGeoJson = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: points.map((p) => ({
        type: 'Feature',
        properties: { id: p.id, name: p.name },
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat],
        },
      })),
    };
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voronoi_coverage_points.geojson';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-t-xl text-xs font-mono-tech">
        <div className="flex items-center space-x-2 text-slate-300">
          <PlusCircle className="w-4 h-4 text-teal-400" />
          <span>CLICK MAP TO ADD SPATIAL SERVICE POINTS ({points.length} ACTIVE)</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleExportGeoJson}
            disabled={points.length === 0}
            className="flex items-center space-x-1 px-3 py-1 rounded bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GeoJSON</span>
          </button>
        </div>
      </div>

      <div className="h-[360px] w-full rounded-b-xl overflow-hidden border border-slate-800 shadow-xl">
        <MapContainer center={[-17.3895, -66.1568]} zoom={11} className="h-full w-full">
          <TileLayer
            attribution='&copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ClickHandler onAddPoint={handleAddPoint} />

          {/* Render Approximate Voronoi Region Polygons */}
          {points.map((pt, idx) => (
            <Polygon
              key={`poly-${pt.id}`}
              positions={generateApproximateVoronoiBox(pt, 0.08 - idx * 0.005)}
              pathOptions={{
                color: '#14b8a6',
                fillColor: '#06b6d4',
                fillOpacity: 0.15,
                dashArray: '4, 4',
                weight: 1.5,
              }}
            />
          ))}

          {/* Render Points */}
          {points.map((pt) => (
            <Marker key={pt.id} position={[pt.lat, pt.lng]}>
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <strong className="text-teal-300 block">{pt.name}</strong>
                  <span className="font-mono-tech text-[10px] text-slate-400">
                    Lat: {pt.lat.toFixed(4)}, Lng: {pt.lng.toFixed(4)}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
