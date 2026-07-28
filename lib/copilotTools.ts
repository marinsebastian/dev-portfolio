import type { LayerCode, ScopeType } from '@/data/mauForondaCensusData';

/**
 * OpenAI-style function-calling definitions for the map copilot.
 *
 * Tools execute **client-side**: the map, its rendered features and the user's
 * inferred location all live in the browser, so round-tripping to the server to
 * read or mutate them would double latency for no benefit. Keep each tool
 * narrow and well named — small single-concern tools get called correctly far
 * more often than one kitchen-sink tool, especially on smaller models.
 */

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
  /**
   * Gemini's OpenAI-compat layer attaches `google.thought_signature` here and
   * rejects the next turn with 400 INVALID_ARGUMENT if it is not echoed back
   * verbatim. Opaque pass-through; other providers never set it.
   */
  extra_content?: unknown;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export const COPILOT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'set_map_layer',
      description:
        'Switch the census metric layer painted on the map. Use when the user asks to see density, connectivity/internet, basic services/water, or population/economic activity.',
      parameters: {
        type: 'object',
        properties: {
          layer: {
            type: 'string',
            enum: ['HEALTH_INSURANCE', 'DENSITY', 'TECH_CONN', 'LANDLINE_PHONE', 'HOUSING_SERVICES', 'ECONOMIC_HUBS'],
            description:
              'HEALTH_INSURANCE = private health insurance (i1). DENSITY = inhabitants per hectare (b1). TECH_CONN = internet/ICT coverage (x1). LANDLINE_PHONE = fixed telephone line (v1). HOUSING_SERVICES = piped water coverage (y1). ECONOMIC_HUBS = inhabitants per block (a1).',
          },
        },
        required: ['layer'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_map_scope',
      description:
        'Move the map to one of the four preset scopes. Prefer this over fly_to_location when the user names a city or asks for the national view.',
      parameters: {
        type: 'object',
        properties: {
          scope: {
            type: 'string',
            enum: ['Santa Cruz', 'La Paz', 'Cochabamba', 'Nacional'],
          },
        },
        required: ['scope'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'fly_to_location',
      description:
        "Move the map camera to an arbitrary coordinate. Use for the user's own neighbourhood or a specific place that is not one of the presets. Census blocks only exist from zoom 8 upward.",
      parameters: {
        type: 'object',
        properties: {
          lat: { type: 'number', description: 'Latitude in decimal degrees.' },
          lng: { type: 'number', description: 'Longitude in decimal degrees.' },
          zoom: { type: 'number', description: 'Target zoom, 8 to 16. Use 13 for a neighbourhood.' },
          label: { type: 'string', description: 'Short human name for the destination.' },
        },
        required: ['lat', 'lng'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_metric_threshold',
      description:
        'Dim every block whose value on the active layer falls outside a range, so only matching blocks stay lit. Use for questions like "show me areas with fibre above 80%". Coverage layers are 0-100 percent; density is inhabitants per hectare.',
      parameters: {
        type: 'object',
        properties: {
          min: { type: 'number', description: 'Lower bound, inclusive.' },
          max: { type: 'number', description: 'Upper bound, inclusive. Omit for no upper bound.' },
        },
        required: ['min'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'clear_metric_threshold',
      description: 'Remove any active threshold filter and show all blocks again.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_map_state',
      description:
        'Read the current map state: active scope, active layer, camera centre and zoom, any active threshold, and how many census blocks are currently rendered. Call this before answering questions about what the user is looking at.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_selected_block',
      description:
        'Read the census indicators of the block the user last clicked: population, density in inhabitants per hectare, and internet, piped-water and higher-education coverage as percentages. Returns null when nothing is selected.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_user_location',
      description:
        "Read the user's inferred location: department, city, coordinates and whether it came from GPS or IP. Returns null when the user has not shared it.",
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_visible_block_stats',
      description:
        'Compute summary statistics (count, median, p90, max) for the active layer across the blocks currently on screen. Use this instead of guessing when the user asks what an area is like.',
      parameters: { type: 'object', properties: {} },
    },
  },
] as const;

export interface MapStateSnapshot {
  scope: ScopeType;
  layer: LayerCode;
  layerDescription: string;
  center: { lat: number; lng: number };
  zoom: number;
  blocksRendered: number;
  threshold: { min: number; max: number | null } | null;
  blocksBelowDataZoom: boolean;
}

export const LAYER_DESCRIPTIONS: Record<LayerCode, string> = {
  HEALTH_INSURANCE: 'Seguro de salud privado — cobertura de seguro de salud privado por manzano (campo i1, proporción 0–1)',
  DENSITY: 'Densidad poblacional — habitantes por hectárea (campo b1, valor absoluto)',
  TECH_CONN: 'Conectividad — cobertura de internet/TIC por manzano (campo x1, proporción 0–1)',
  LANDLINE_PHONE: 'Telefonía fija — cobertura de línea telefónica fija por manzano (campo v1, proporción 0–1)',
  HOUSING_SERVICES: 'Servicios básicos — cobertura de agua por cañería (campo y1, proporción 0–1)',
  ECONOMIC_HUBS: 'Población por manzano — habitantes (campo a1, valor absoluto)',
};

/**
 * Structured sections plus an explicit tool mandate: smaller models follow
 * labelled instruction blocks far more reliably than the same rules written as
 * flowing prose, and will otherwise answer from guesswork even when a perfectly
 * good tool exists.
 */
export function buildSystemPrompt(language: 'es' | 'en'): string {
  const isEs = language === 'es';

  return `## Rol
Eres el copiloto espacial de GeoInsights Bolivia, un visor del Censo de Población y Vivienda 2024 del INE. Ayudas a la persona usuaria a explorar 247.346 manzanos urbanos reales de Bolivia y puedes controlar el mapa directamente.

## Idioma
Responde SIEMPRE en ${isEs ? 'español' : 'English'}. ${isEs ? 'Usa el sistema métrico y el formato de número boliviano.' : 'Use metric units.'}

## Datos disponibles
Los manzanos provienen del archivo PMTiles atlasurbano de Mauricio Foronda (@mauforonda), derivado del Censo 2024 del INE. El esquema es MIXTO:
- Valores absolutos: población por manzano (a1, 0–8.645) y densidad en habitantes por hectárea (b1, 0–8.581).
- Proporciones 0–1 que se muestran como porcentaje: internet/TIC (x1), agua por cañería (y1), educación superior (g1), alcantarillado (z1).
Los manzanos sólo existen desde el nivel de zoom 8. Por debajo de eso el mapa muestra únicamente el mapa base.

## Herramientas
Antes de responder cualquier pregunta sobre lo que se ve en pantalla, llama primero a \`get_map_state\`. Para hablar de un manzano concreto usa \`get_selected_block\`. Para caracterizar una zona usa \`get_visible_block_stats\`. Nunca inventes cifras que una herramienta puede darte.
Puedes actuar sobre el mapa: \`set_map_layer\`, \`set_map_scope\`, \`fly_to_location\`, \`set_metric_threshold\`, \`clear_metric_threshold\`. Cuando la persona pida ver algo, ejecútalo además de explicarlo.

## Honestidad
Las tarjetas de resumen por zona del panel lateral son cifras ilustrativas, no lecturas oficiales del INE. Si te preguntan por ellas, dilo. Los indicadores por manzano sí son reales.

## Formato
Respuestas breves: 2 a 4 frases, sin markdown de encabezados ni listas numeradas largas. Tono profesional y directo, como un analista que conoce el terreno.

## Sugerencias
Termina SIEMPRE tu respuesta final con una línea oculta con 2 o 3 preguntas de seguimiento, exactamente en este formato y sin nada después:
<!--suggestions: primera pregunta? | segunda pregunta? | tercera pregunta?-->`;
}

/**
 * Fixed one-shot exchange injected fresh into every request and never persisted
 * or shown. A concrete demonstration of tone, brevity and the hidden marker
 * closes the quality gap between a frontier model and a cheap one far more
 * effectively than another paragraph of instructions.
 */
export const ONE_SHOT_EXAMPLE: ChatMessage[] = [
  {
    role: 'user',
    content: '¿Cómo está la conectividad por aquí?',
  },
  {
    role: 'assistant',
    content:
      'Cambié la capa a Conectividad y TICs sobre la zona metropolitana de Santa Cruz. De los 4.812 manzanos visibles, la mediana de cobertura de internet es 41% y el percentil 90 llega a 78%, así que hay una diferencia fuerte entre el centro y la periferia. Los manzanos más oscuros son los de menor cobertura declarada en el Censo 2024.\n<!--suggestions: ¿Qué manzanos superan el 80% de fibra? | ¿Cómo se compara con La Paz? | ¿Y la densidad en esta misma zona?-->',
  },
];

/**
 * Strips tool-call markup that leaked into the visible answer.
 *
 * On the final round we withhold `tools` to force prose, but GLM- and
 * Qwen-family models will sometimes emit their internal call syntax as plain
 * content anyway. Rendering `<tool_call>…</tool_call>` to the user is worse
 * than rendering nothing, so it is removed before display. Harmless for models
 * that never do this.
 */
function stripToolMarkup(content: string): string {
  return content
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/gi, '')
    .replace(/<\|?tool_calls?_?(begin|start|end|sep)\|?>/gi, '')
    .replace(/<arg_(key|value)>[\s\S]*?<\/arg_(key|value)>/gi, '')
    .replace(/<\/?function(_call)?[^>]*>/gi, '')
    .trim();
}

/** Parses and strips the trailing hidden suggestions marker. */
export function extractSuggestions(content: string): { text: string; suggestions: string[] } {
  const match = content.match(/<!--\s*suggestions:\s*([\s\S]*?)-->/i);

  if (!match || match.index === undefined) {
    return { text: stripToolMarkup(content), suggestions: [] };
  }

  const suggestions = match[1]
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  // Weaker models sometimes emit a stray `-->` just before the real marker, as
  // if they started the comment, stopped, and restarted it.
  const text = stripToolMarkup(content.slice(0, match.index).replace(/(<!--)?\s*-->\s*$/, ''));

  return { text, suggestions };
}
