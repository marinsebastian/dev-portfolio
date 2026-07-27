/**
 * Registers the `pmtiles://` protocol inside the MapLibre GL worker thread.
 *
 * maplibre-gl v6 keeps a separate protocol registry per thread: `addProtocol`
 * is defined in the main bundle and, independently, on the worker's global
 * scope. Registering only on the main thread is enough to resolve a source's
 * TileJSON — but vector tiles are fetched and parsed in the worker, and there
 * the scheme is unknown, so no tile is ever requested and the layer renders
 * empty without raising an error.
 *
 * This module is loaded into the worker via `importScriptInWorkers()` from
 * components/map/RealBlockMapWidget.client.tsx. Its sibling files are staged
 * into public/maplibre/ by tools/copy-maplibre-worker.mjs.
 */
import { Protocol } from './pmtiles.mjs';

const protocol = new Protocol();

// `self.addProtocol` is installed by the maplibre worker before it evaluates
// imported scripts; the guard keeps a stale copy of this file from throwing.
if (typeof self.addProtocol === 'function') {
  self.addProtocol('pmtiles', protocol.tile);
}
