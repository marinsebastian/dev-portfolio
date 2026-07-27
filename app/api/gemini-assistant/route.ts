import { NextResponse } from "next/server";
import { URBAN_CENSUS_ZONES, UrbanCensusZone } from "@/data/mauForondaCensusData";

const GEMINI_MODEL = "gemini-2.5-flash";

/** Normalized 0-100 indices read straight from the PMTiles feature the user clicked. */
interface BlockIndices {
  lngLat?: string;
  density?: number | null;
  internet?: number | null;
  water?: number | null;
  education?: number | null;
}

interface AssistantRequest {
  metroArea?: string;
  zoneId?: string;
  blockData?: BlockIndices | null;
  activeLayer?: string;
  language?: string;
}

function resolveZone(zoneId?: string, metroArea?: string): UrbanCensusZone {
  // Only match on zoneId when one was actually supplied — `includes("")` is
  // always true and would otherwise pin every request to the first zone.
  if (zoneId) {
    const needle = zoneId.toLowerCase();
    const byId = URBAN_CENSUS_ZONES.find(
      (z) => z.id === zoneId || z.name.toLowerCase().includes(needle)
    );
    if (byId) return byId;
  }

  if (metroArea) {
    const byArea = URBAN_CENSUS_ZONES.find((z) => z.metroArea === metroArea);
    if (byArea) return byArea;
  }

  return URBAN_CENSUS_ZONES[0];
}

function describeLayer(activeLayer: string | undefined, isEs: boolean): string {
  switch (activeLayer) {
    case "TECH_CONN":
      return isEs ? "Conectividad Digital y Fibra Óptica" : "Digital & Fiber Connectivity";
    case "DENSITY":
      return isEs ? "Densidad Poblacional (Censo 2024)" : "Population Density (2024 Census)";
    case "HOUSING_SERVICES":
      return isEs ? "Servicios Básicos y Vivienda" : "Basic Services & Housing";
    default:
      return isEs ? "Nodos Económicos e Industriales" : "Economic & Industrial Hubs";
  }
}

/** Renders the clicked block's indices, or an explicit "nothing selected" note. */
function describeBlock(block: BlockIndices | null | undefined, isEs: boolean): string {
  if (!block) {
    return isEs
      ? "Ningún manzano seleccionado — el usuario está viendo la zona completa."
      : "No individual block selected — the user is viewing the whole zone.";
  }

  const fmt = (v: number | null | undefined) => (typeof v === "number" ? `${v}/100` : "s/d");
  const label = isEs
    ? `Manzano seleccionado (${block.lngLat ?? "coordenada s/d"}) — índices normalizados del Censo 2024`
    : `Selected block (${block.lngLat ?? "coordinates n/a"}) — normalized 2024 Census indices`;

  return [
    label,
    isEs ? `  · Densidad: ${fmt(block.density)}` : `  · Density: ${fmt(block.density)}`,
    isEs ? `  · Internet/TIC: ${fmt(block.internet)}` : `  · Internet/ICT: ${fmt(block.internet)}`,
    isEs ? `  · Agua por cañería: ${fmt(block.water)}` : `  · Piped water: ${fmt(block.water)}`,
    isEs ? `  · Educación superior: ${fmt(block.education)}` : `  · Higher education: ${fmt(block.education)}`,
  ].join("\n");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssistantRequest;
    const { metroArea, zoneId, blockData, activeLayer, language } = body;

    const targetZone = resolveZone(zoneId, metroArea);
    const isEs = language !== "en";
    const layerName = describeLayer(activeLayer, isEs);
    const blockSummary = describeBlock(blockData, isEs);

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY;

    let reply = "";
    let live = false;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are a spatial analyst explaining urban census indicators from Bolivia. Summarise the following:
- Metro area viewed: ${metroArea ?? targetZone.metroArea}
- Reference zone: ${targetZone.name}
- Active metric layer: ${layerName}
- ${blockSummary}
- Zone reference figures (illustrative, not official INE readings): population ${targetZone.metrics.population2024.toLocaleString()}, density ${targetZone.metrics.densityHabKm2.toLocaleString()} hab/km², connectivity ${targetZone.metrics.internetCoveragePct}%, basic services ${targetZone.metrics.basicServicesIndex}/100, core sector ${targetZone.metrics.primarySector}
- Context: ${isEs ? targetZone.narrativeEs : targetZone.narrativeEn}

Write a concise professional summary of 3-4 sentences in ${isEs ? "Spanish" : "English"}. Treat the normalized block indices as 0-100 positions within the national range, not percentages. Do not use markdown bolding, headers, or bullet lists. Return a single paragraph.`,
                    },
                  ],
                },
              ],
              generationConfig: { maxOutputTokens: 250, temperature: 0.7 },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) {
            reply = generatedText.trim();
            live = true;
          }
        }
      } catch (err) {
        console.error("Gemini API Error:", err);
      }
    }

    if (!reply) {
      const heading = isEs
        ? `[Resumen local — sin llamada a Gemini]`
        : `[Local summary — no Gemini call made]`;

      const note = isEs
        ? `\n\n[Configura GEMINI_API_KEY en el entorno para habilitar el resumen generado por Gemini. Sin la clave, esta respuesta se arma en el servidor a partir de los datos ya cargados.]`
        : `\n\n[Set GEMINI_API_KEY in the environment to enable the Gemini-generated summary. Without the key this response is assembled on the server from data already loaded.]`;

      reply =
        [
          heading,
          isEs
            ? `Área metropolitana: ${metroArea ?? targetZone.metroArea} · Zona de referencia: ${targetZone.name}`
            : `Metro area: ${metroArea ?? targetZone.metroArea} · Reference zone: ${targetZone.name}`,
          isEs ? `Capa activa: ${layerName}` : `Active layer: ${layerName}`,
          blockSummary,
          isEs
            ? `Referencias ilustrativas de zona: ${targetZone.metrics.population2024.toLocaleString()} hab. · ${targetZone.metrics.densityHabKm2.toLocaleString()} hab/km² · internet ${targetZone.metrics.internetCoveragePct}% · servicios ${targetZone.metrics.basicServicesIndex}/100`
            : `Illustrative zone references: ${targetZone.metrics.population2024.toLocaleString()} inhabitants · ${targetZone.metrics.densityHabKm2.toLocaleString()} hab/km² · internet ${targetZone.metrics.internetCoveragePct}% · services ${targetZone.metrics.basicServicesIndex}/100`,
          isEs ? targetZone.narrativeEs : targetZone.narrativeEn,
        ].join("\n") + note;
    }

    return NextResponse.json({
      success: true,
      zone: targetZone.name,
      metroArea: metroArea ?? targetZone.metroArea,
      reply,
      meta: {
        source: live ? "gemini-api" : "local-fallback",
        model: live ? GEMINI_MODEL : null,
        blockIndicesUsed: Boolean(blockData),
        keyHandling: "Server-side route handler; the API key is never sent to the browser.",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to query spatial assistant" }, { status: 500 });
  }
}
