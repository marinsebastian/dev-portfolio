import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored MapLibre/PMTiles worker bundles staged by
    // tools/copy-maplibre-worker.mjs — third-party, minified, not ours to lint.
    "public/maplibre/maplibre-gl-*.mjs",
    "public/maplibre/pmtiles.mjs",
    "public/maplibre/fflate.mjs",
  ]),
]);

export default eslintConfig;
