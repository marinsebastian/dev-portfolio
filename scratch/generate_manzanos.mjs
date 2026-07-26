import fs from 'fs';

// Helper to generate a grid of realistic city blocks (manzanos) within a bounding box
function generateBlockGrid(prefix, centerLat, centerLng, latRows = 4, lngCols = 4, blockSize = 0.003, streetGap = 0.0006, baseMetrics = {}) {
  const blocks = [];
  const startLat = centerLat - (latRows * (blockSize + streetGap)) / 2;
  const startLng = centerLng - (lngCols * (blockSize + streetGap)) / 2;

  let count = 1;
  for (let r = 0; r < latRows; r++) {
    for (let c = 0; c < lngCols; c++) {
      const minLat = startLat + r * (blockSize + streetGap);
      const maxLat = minLat + blockSize;
      const minLng = startLng + c * (blockSize + streetGap);
      const maxLng = minLng + blockSize;

      // Create closed block polygon coordinates [lat, lng]
      const polygon = [
        [minLat, minLng],
        [maxLat, minLng],
        [maxLat, maxLng],
        [minLat, maxLng],
      ];

      // Introduce realistic local block variance to metrics
      const popVariance = Math.floor((Math.random() - 0.5) * 1500);
      const connVariance = Math.floor((Math.random() - 0.5) * 8);
      const servVariance = Math.floor((Math.random() - 0.5) * 5);

      const blockPop = Math.max(120, (baseMetrics.population2024 || 2500) / (latRows * lngCols) + popVariance);
      const blockConn = Math.min(99, Math.max(45, (baseMetrics.internetCoveragePct || 80) + connVariance));
      const blockServ = Math.min(100, Math.max(50, (baseMetrics.basicServicesIndex || 85) + servVariance));
      const blockDensity = Math.round((blockPop / (blockSize * 111 * blockSize * 111)) * 10) / 10;

      blocks.push({
        id: `${prefix}-M${String(count).padStart(3, '0')}`,
        code: `MZ-${prefix.toUpperCase()}-${String(count).padStart(3, '0')}`,
        polygon,
        metrics: {
          population2024: Math.round(blockPop),
          densityHabKm2: Math.round(blockDensity),
          internetCoveragePct: Math.round(blockConn * 10) / 10,
          basicServicesIndex: Math.round(blockServ * 10) / 10,
        }
      });
      count++;
    }
  }
  return blocks;
}

console.log("Manzano Generator Ready");
