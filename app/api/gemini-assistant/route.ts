import { NextResponse } from "next/server";
import { URBAN_CENSUS_ZONES } from "@/data/mauForondaCensusData";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { metroArea, zoneId, activeLayer, language } = body;

    const targetZone = URBAN_CENSUS_ZONES.find(
      (z) => z.id === zoneId || z.name.toLowerCase().includes((zoneId || "").toLowerCase())
    ) || URBAN_CENSUS_ZONES.find((z) => z.metroArea === metroArea) || URBAN_CENSUS_ZONES[0];

    const isEs = language !== 'en';

    const layerName = activeLayer === 'TECH_CONN'
      ? (isEs ? 'Conectividad Digital y Fibra Óptica' : 'Digital & Fiber Connectivity')
      : activeLayer === 'DENSITY'
      ? (isEs ? 'Densidad Poblacional (Censo 2024)' : 'Population Density (2024 Census)')
      : activeLayer === 'HOUSING_SERVICES'
      ? (isEs ? 'Servicios Básicos y Vivienda' : 'Basic Services & Housing')
      : (isEs ? 'Nodos Económicos e Industriales' : 'Economic & Industrial Hubs');

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    let reply = "";
    let isMock = true;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a spatial analyst explaining urban census indicator datasets from Bolivia. Detail the insights for:
- Zone: ${targetZone.name} (${targetZone.metroArea})
- Metric Layer: ${layerName}
- Population: ${targetZone.metrics.population2024.toLocaleString()} inhabitants
- Density: ${targetZone.metrics.densityHabKm2.toLocaleString()} hab/km²
- Digital Connectivity (Internet/Fiber): ${targetZone.metrics.internetCoveragePct}%
- Basic Services Index (water/power/waste): ${targetZone.metrics.basicServicesIndex}/100
- Core Sector: ${targetZone.metrics.primarySector}
- Narrative Context: ${isEs ? targetZone.narrativeEs : targetZone.narrativeEn}

Provide a concise, professional executive socio-demographic summary of 3-4 sentences in ${isEs ? "Spanish" : "English"}. Do not use markdown bolding, headers, or bulleted lists. Just return the paragraph of text.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.7,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            reply = generatedText.trim();
            isMock = false;
          }
        }
      } catch (err) {
        console.error("Gemini API Error:", err);
      }
    }

    if (!reply) {
      const instructions = isEs
        ? `\n\n[Nota: Para habilitar consultas en tiempo real de la API de Gemini, configura la variable GEMINI_API_KEY en tu archivo .env local].`
        : `\n\n[Note: To enable live Gemini API queries, configure the GEMINI_API_KEY environment variable in your local .env file].`;

      reply = (isEs
        ? `[Simulación de Asistente Espacial Gemini AI — Censo 2024]:
Análisis de Zona: ${targetZone.name} (${targetZone.metroArea})
- Capa Activa: ${layerName}
- Población 2024: ${targetZone.metrics.population2024.toLocaleString()} hab. | Densidad: ${targetZone.metrics.densityHabKm2.toLocaleString()} hab/km²
- Cobertura Internet/Fibra: ${targetZone.metrics.internetCoveragePct}% | Índice de Servicios Básicos: ${targetZone.metrics.basicServicesIndex}/100
- Sector Económico Principal: ${targetZone.metrics.primarySector}
- Dictamen Técnico: ${targetZone.narrativeEs}`
        : `[Simulated Gemini AI Spatial Assistant — 2024 Census]:
Zone Analysis: ${targetZone.name} (${targetZone.metroArea})
- Active Layer: ${layerName}
- 2024 Population: ${targetZone.metrics.population2024.toLocaleString()} hab. | Density: ${targetZone.metrics.densityHabKm2.toLocaleString()} hab/km²
- Internet/Fiber Coverage: ${targetZone.metrics.internetCoveragePct}% | Basic Services Index: ${targetZone.metrics.basicServicesIndex}/100
- Primary Economic Sector: ${targetZone.metrics.primarySector}
- Technical Insights: ${targetZone.narrativeEn}`) + instructions;
    }

    return NextResponse.json({
      success: true,
      zone: targetZone.name,
      reply,
      meta: {
        model: isMock ? "gemini-1.5-pro-mock-proxy" : "gemini-2.5-flash",
        tokensUsed: isMock ? 168 : undefined,
        secureProxy: "Passed through internal Next.js API route (0% key exposure)",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to query spatial assistant" }, { status: 500 });
  }
}
