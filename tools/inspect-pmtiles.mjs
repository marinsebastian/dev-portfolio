import { PMTiles } from 'pmtiles';

async function inspect() {
  const url = 'https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles';
  const p = new PMTiles(url);
  const header = await p.getHeader();
  const metadata = await p.getMetadata();

  console.log("=== PMTILES HEADER ===");
  console.log(JSON.stringify(header, null, 2));

  console.log("\n=== PMTILES METADATA ===");
  console.log(JSON.stringify(metadata, null, 2));
}

inspect().catch(err => console.error("Error inspecting PMTiles:", err));
