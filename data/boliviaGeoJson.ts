export interface DepartmentData {
  id: string;
  name: string;
  capital: string;
  population: string;
  areaKm2: string;
  density: string;
  connectivityIndex: number; // 0 - 100
  infrastructureScore: number; // 0 - 100
  coordinates: [number, number]; // [lat, lng]
  geojsonPolygon: [number, number][]; // Polygons [lat, lng]
  keySectors: string[];
  summaryEs: string;
}

export const BOLIVIA_DEPARTMENTS: DepartmentData[] = [
  {
    id: "LPZ",
    name: "La Paz",
    capital: "Nuestra Señora de La Paz",
    population: "3,023,000",
    areaKm2: "133,985 km²",
    density: "22.5 hab/km²",
    connectivityIndex: 88,
    infrastructureScore: 84,
    coordinates: [-16.5000, -68.1500],
    keySectors: ["Government & Services", "Commerce", "Tourism", "Mining"],
    summaryEs: "Sede de gobierno y nodo administrativo clave. Alta densidad de servicios digitales, redes de conectividad y actividad económica.",
    geojsonPolygon: [
      [-14.0, -69.0], [-14.5, -67.5], [-16.0, -67.0], [-17.5, -68.0], [-17.2, -69.5], [-15.5, -69.5], [-14.0, -69.0]
    ]
  },
  {
    id: "SCZ",
    name: "Santa Cruz",
    capital: "Santa Cruz de la Sierra",
    population: "3,370,000",
    areaKm2: "370,621 km²",
    density: "9.1 hab/km²",
    connectivityIndex: 92,
    infrastructureScore: 89,
    coordinates: [-17.7833, -63.1833],
    keySectors: ["Agribusiness", "Industrial Manufacturing", "Logistics", "Energy"],
    summaryEs: "Motor económico y agroindustrial de Bolivia. Alta demanda de sistemas de logística, automatización y monitoreo de datos.",
    geojsonPolygon: [
      [-14.0, -64.5], [-13.8, -60.5], [-16.5, -58.0], [-20.0, -62.0], [-19.0, -64.5], [-16.0, -64.5], [-14.0, -64.5]
    ]
  },
  {
    id: "CBB",
    name: "Cochabamba",
    capital: "Cochabamba",
    population: "2,028,000",
    areaKm2: "55,631 km²",
    density: "36.4 hab/km²",
    connectivityIndex: 90,
    infrastructureScore: 86,
    coordinates: [-17.3895, -66.1568],
    keySectors: ["Software & IT Services", "Agriculture", "Energy", "Higher Education"],
    summaryEs: "Hub tecnológico y académico de Bolivia. Concentración estratégica de talento en ingeniería de software y desarrollo de sistemas.",
    geojsonPolygon: [
      [-16.5, -66.8], [-16.2, -64.8], [-17.8, -64.5], [-18.5, -65.8], [-17.8, -67.0], [-16.5, -66.8]
    ]
  },
  {
    id: "ORU",
    name: "Oruro",
    capital: "Oruro",
    population: "551,000",
    areaKm2: "53,588 km²",
    density: "10.3 hab/km²",
    connectivityIndex: 74,
    infrastructureScore: 71,
    coordinates: [-17.9667, -67.1167],
    keySectors: ["Mining", "International Trade Logistics", "Renewables"],
    summaryEs: "Corredor biocéanico estratégico y tradición minera. Punto clave de conexión de transporte transfronterizo.",
    geojsonPolygon: [
      [-17.5, -68.5], [-17.5, -66.8], [-19.2, -66.8], [-19.5, -68.8], [-17.5, -68.5]
    ]
  },
  {
    id: "POT",
    name: "Potosí",
    capital: "Potosí",
    population: "901,000",
    areaKm2: "118,218 km²",
    density: "7.6 hab/km²",
    connectivityIndex: 68,
    infrastructureScore: 65,
    coordinates: [-19.5833, -65.7500],
    keySectors: ["Lithium & Minerals", "Solar Energy", "Tourism (Uyuni)"],
    summaryEs: "Reserva estratégica mundial de litio y energía solar. Alto potencial para monitoreo ambiental y gestión de recursos.",
    geojsonPolygon: [
      [-19.0, -67.5], [-19.0, -65.5], [-22.0, -65.2], [-22.8, -67.8], [-21.0, -68.2], [-19.0, -67.5]
    ]
  },
  {
    id: "TJA",
    name: "Tarija",
    capital: "Tarija",
    population: "591,000",
    areaKm2: "37,623 km²",
    density: "15.7 hab/km²",
    connectivityIndex: 81,
    infrastructureScore: 78,
    coordinates: [-21.5333, -64.7333],
    keySectors: ["Hydrocarbons & Natural Gas", "Viticulture", "Cross-border Trade"],
    summaryEs: "Región productora de hidrocarburos y agroindustria especializada. Conexión de infraestructura fronteriza con Argentina.",
    geojsonPolygon: [
      [-21.0, -65.2], [-21.0, -62.5], [-22.5, -62.2], [-22.8, -64.8], [-21.8, -65.2], [-21.0, -65.2]
    ]
  },
  {
    id: "CHQ",
    name: "Chuquisaca",
    capital: "Sucre",
    population: "637,000",
    areaKm2: "51,524 km²",
    density: "12.3 hab/km²",
    connectivityIndex: 76,
    infrastructureScore: 74,
    coordinates: [-19.0333, -65.2622],
    keySectors: ["Constitutional Capital", "Gas & Energy", "Tourism", "Education"],
    summaryEs: "Capital constitucional de Bolivia. Equilibrado sector de servicios, energía y desarrollo institucional.",
    geojsonPolygon: [
      [-18.5, -65.8], [-18.5, -64.2], [-20.8, -64.2], [-21.0, -65.2], [-19.5, -65.6], [-18.5, -65.8]
    ]
  },
  {
    id: "BEN",
    name: "Beni",
    capital: "Trinidad",
    population: "508,000",
    areaKm2: "213,564 km²",
    density: "2.4 hab/km²",
    connectivityIndex: 62,
    infrastructureScore: 58,
    coordinates: [-14.8333, -64.9000],
    keySectors: ["Cattle Farming", "Forestry", "Eco-tourism", "River Transport"],
    summaryEs: "Extensa cuenca amazónica y ganadería. Oportunidad en telemetría espacial y logística de redes distribuidas.",
    geojsonPolygon: [
      [-10.8, -66.5], [-11.0, -62.5], [-15.5, -62.8], [-16.0, -66.2], [-13.5, -67.2], [-10.8, -66.5]
    ]
  },
  {
    id: "PND",
    name: "Pando",
    capital: "Cobija",
    population: "154,000",
    areaKm2: "63,827 km²",
    density: "2.4 hab/km²",
    connectivityIndex: 59,
    infrastructureScore: 55,
    coordinates: [-11.0333, -68.7667],
    keySectors: ["Amazonian Brazil Nut", "Forestry", "Cross-border Trade (Brazil)"],
    summaryEs: "Frontera septentrional amazónica. Monitoreo forestal, gestión ambiental y comercio transfronterizo.",
    geojsonPolygon: [
      [-9.8, -69.5], [-9.8, -65.2], [-11.5, -66.5], [-12.2, -68.8], [-11.0, -69.5], [-9.8, -69.5]
    ]
  }
];
