/**
 * Multi-provider LLM configuration.
 *
 * All three providers expose an OpenAI-shaped `/chat/completions` endpoint —
 * same request body (`model`, `messages`, `tools`, `stream`), same SSE chunk
 * format — so a single adapter serves all of them. Adding a provider means
 * adding a row here, not a new code path.
 *
 * Keys are read from the server environment only and are never sent to, or
 * inferrable by, the browser.
 */

export const PROVIDER_IDS = ['nvidia', 'gemini', 'openai'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export interface ProviderConfig {
  id: ProviderId;
  /** Shown in the client provider selector. */
  label: string;
  baseUrl: string;
  /** Environment variable holding the API key. Server-side only. */
  keyEnv: string;
  /** Environment variable that can override the model, if set. */
  modelEnv: string;
  defaultModel: string;
  /** Alternatives surfaced in docs/UI; not all are guaranteed available on a given key. */
  knownModels: string[];
}

export const PROVIDERS: Record<ProviderId, ProviderConfig> = {
  nvidia: {
    id: 'nvidia',
    label: 'NVIDIA NIM',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    keyEnv: 'NVIDIA_API_KEY',
    modelEnv: 'NVIDIA_MODEL',
    defaultModel: 'z-ai/glm-5.2',
    knownModels: ['z-ai/glm-5.2', 'meta/llama-3.3-70b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct'],
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    keyEnv: 'GEMINI_API_KEY',
    modelEnv: 'GEMINI_MODEL',
    defaultModel: 'gemini-3.1-flash-lite',
    knownModels: ['gemini-3.1-flash-lite', 'gemini-2.0-flash'],
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    keyEnv: 'OPENAI_API_KEY',
    modelEnv: 'OPENAI_MODEL',
    defaultModel: 'gpt-4o-mini',
    knownModels: ['gpt-4o-mini', 'gpt-4o'],
  },
};

export function isProviderId(value: unknown): value is ProviderId {
  return typeof value === 'string' && (PROVIDER_IDS as readonly string[]).includes(value);
}

export function getApiKey(provider: ProviderId): string | undefined {
  const key = process.env[PROVIDERS[provider].keyEnv];
  return key && key.trim() ? key.trim() : undefined;
}

export function hasKey(provider: ProviderId): boolean {
  return getApiKey(provider) !== undefined;
}

/** Providers that are actually usable right now, in selector order. */
export function configuredProviders(): ProviderId[] {
  return PROVIDER_IDS.filter(hasKey);
}

/**
 * Honour a client's provider preference only when that provider's key exists
 * server-side; otherwise fall through silently. A client must never be able to
 * probe which providers are configured by triggering different error messages.
 */
export function resolveProvider(requested?: unknown): ProviderId | null {
  if (isProviderId(requested) && hasKey(requested)) return requested;

  const envDefault = process.env.AI_PROVIDER;
  if (isProviderId(envDefault) && hasKey(envDefault)) return envDefault;

  return configuredProviders()[0] ?? null;
}

export function resolveModel(provider: ProviderId, requested?: unknown): string {
  if (typeof requested === 'string' && requested.trim()) return requested.trim();
  const fromEnv = process.env[PROVIDERS[provider].modelEnv];
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  return PROVIDERS[provider].defaultModel;
}

/**
 * Gemini wraps error bodies in an array; OpenAI and NVIDIA do not. Reading
 * `.error` off the array yields undefined and hides the real cause (quota,
 * bad model name) behind a generic failure message.
 */
export function extractUpstreamError(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    const err = Array.isArray(parsed) ? parsed[0]?.error : parsed?.error;
    if (typeof err === 'string') return err;
    if (err?.message) return String(err.message);
  } catch {
    // Non-JSON body — fall through to the raw text.
  }
  return raw.slice(0, 300) || 'Upstream provider returned an error with no body.';
}
