import { PMTiles } from 'pmtiles';

async function inspect() {
  const url = 'https://raw.githubusercontent.com/mauforonda/atlasurbano/pmtiles/atlas.pmtiles';
  const p = new PMTiles(url);
  const header = await p.getHeader();
  const metadata = await p.getMetadata();

  console.log("=== PMTILES HEADER ===");
  console.log(JSON.stringify(header, null, 2));

  console.log("=== PMTILES ATTRIBUTES ===");
  const attributes = metadata.tilestats.layers[0].attributes;
  for (const attr of attributes) {
    console.log(`Key: ${attr.attribute} | min: ${attr.min} | max: ${attr.max} | count: ${attr.count}`);
  }
}

inspect().catch(err => console.error("Error inspecting PMTiles:", err));
