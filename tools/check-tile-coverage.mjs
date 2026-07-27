/**
 * Checks whether the atlasurbano PMTiles archive actually has tiles at the zoom
 * levels the map flies to. The archive is built with `tippecanoe -Z8 -z14`, so
 * anything below z8 renders as basemap only — this script is how that was
 * confirmed rather than guessed, and it backs the zoom notice in the map widget.
 *
 * Usage: node tools/check-tile-coverage.mjs
 */
import { PMTiles } from 'pmtiles';

const ARCHIVE = 'https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles';

/** Web-Mercator tile containing (lon, lat) at zoom z. */
function lonLatToTile(lon, lat, z) {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  return [z, x, y];
}

// Camera positions used by SCOPE_CONFIG in data/mauForondaCensusData.ts.
const PROBES = [
  { name: 'Nacional (z5)', lon: -64.5, lat: -16.5, zoom: 5 },
  { name: 'Nacional (z6)', lon: -64.5, lat: -16.5, zoom: 6 },
  { name: 'Santa Cruz (z12)', lon: -63.18, lat: -17.78, zoom: 12 },
  { name: 'Cochabamba (z12)', lon: -66.16, lat: -17.39, zoom: 12 },
  { name: 'La Paz / El Alto (z12)', lon: -68.13, lat: -16.51, zoom: 12 },
];

const archive = new PMTiles(ARCHIVE);
const header = await archive.getHeader();

console.log(`Archive zoom range: z${header.minZoom} - z${header.maxZoom}\n`);

for (const probe of PROBES) {
  const [z, x, y] = lonLatToTile(probe.lon, probe.lat, probe.zoom);
  const tile = await archive.getZxy(z, x, y);
  const status = tile ? `${(tile.data.byteLength / 1024).toFixed(0)} KB` : 'NO TILE - basemap only';
  console.log(`${probe.name.padEnd(24)} z${z}/${x}/${y}  ${status}`);
}
