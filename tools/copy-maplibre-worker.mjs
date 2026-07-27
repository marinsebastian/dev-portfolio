/**
 * Stages the browser assets the MapLibre worker thread needs into
 * public/maplibre/ so they can be served from our own origin.
 *
 * Two separate problems are solved here, both of which silently produced a map
 * that reports `loaded: true` while rendering zero census blocks:
 *
 * 1. WORKER URL. maplibre-gl v6 derives its worker URL from its own module URL
 *    (`new URL('./maplibre-gl-worker.mjs', import.meta.url)`) and starts it as a
 *    module worker. Once the library is bundled by Turbopack that relative path
 *    no longer resolves; the request falls through to the app router, which
 *    answers with HTML, and the worker dies on load. Copying the worker (plus
 *    the shared chunk it imports by relative path, which must sit beside it)
 *    gives us a real, same-origin, version-matched URL for `setWorkerUrl`.
 *
 * 2. WORKER-SIDE PROTOCOL. In maplibre-gl v6 the custom-protocol registry is
 *    per-thread — `addProtocol` lives in the main bundle *and* in the worker
 *    bundle, but not in the shared chunk. A `pmtiles://` protocol registered
 *    only on the main thread therefore resolves the source's TileJSON (main
 *    thread) and nothing else: the worker, which is what actually loads vector
 *    tiles, has never heard of the scheme. `importScriptInWorkers` is the
 *    documented escape hatch, so we also stage a small ESM module that registers
 *    the protocol inside the worker, along with the pmtiles library and its one
 *    dependency (fflate).
 *
 * The pmtiles ESM bundle imports `fflate` as a bare specifier, which a browser
 * cannot resolve, so that single import is rewritten to a relative path as the
 * file is copied.
 *
 * Runs automatically via the `predev` and `prebuild` npm scripts.
 */
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const modules = join(projectRoot, 'node_modules');
const targetDir = join(projectRoot, 'public', 'maplibre');

async function version(pkg) {
  const { version } = JSON.parse(await readFile(join(modules, pkg, 'package.json'), 'utf8'));
  return version;
}

await mkdir(targetDir, { recursive: true });

// 1. MapLibre worker + the shared chunk it imports relatively.
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  await copyFile(join(modules, 'maplibre-gl', 'dist', file), join(targetDir, file));
}

// 2. fflate, then pmtiles with its bare `fflate` specifier rewritten.
await copyFile(join(modules, 'fflate', 'esm', 'browser.js'), join(targetDir, 'fflate.mjs'));

const pmtilesSource = await readFile(join(modules, 'pmtiles', 'dist', 'esm', 'index.js'), 'utf8');
const patched = pmtilesSource.replace(/(from\s*)["']fflate["']/g, '$1"./fflate.mjs"');
if (patched === pmtilesSource) {
  throw new Error('Expected to rewrite the fflate specifier in the pmtiles ESM bundle, but found none.');
}
await writeFile(join(targetDir, 'pmtiles.mjs'), patched, 'utf8');

console.log(
  `[maplibre] staged worker assets -> public/maplibre/ ` +
    `(maplibre-gl v${await version('maplibre-gl')}, pmtiles v${await version('pmtiles')}, fflate v${await version('fflate')})`
);
