import { NextResponse } from 'next/server';
import {
  configuredProviders,
  extractUpstreamError,
  getApiKey,
  PROVIDERS,
  resolveModel,
  resolveProvider,
} from '@/lib/aiProviders';

/** Cheap abuse/cost protection before anything reaches a paid provider. */
const MAX_MESSAGES = 40;
const MAX_BODY_BYTES = 200_000;

interface ChatRequestBody {
  messages?: unknown;
  tools?: unknown;
  provider?: unknown;
  model?: unknown;
  temperature?: unknown;
}

/**
 * GET reports which providers are usable so the client selector can render only
 * working options. It deliberately exposes ids and labels, never keys.
 */
export async function GET() {
  const available = configuredProviders();
  return NextResponse.json({
    available: available.map((id) => ({
      id,
      label: PROVIDERS[id].label,
      model: resolveModel(id),
    })),
    // With no key configured the copilot still answers, from a local fallback.
    fallback: available.length === 0,
  });
}

export async function POST(request: Request) {
  const raw = await request.text();

  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request body too large.' }, { status: 413 });
  }

  let body: ChatRequestBody;
  try {
    body = JSON.parse(raw) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body.' }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages must be a non-empty array.' }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `Conversation too long (max ${MAX_MESSAGES} messages).` },
      { status: 400 }
    );
  }

  const provider = resolveProvider(body.provider);
  if (!provider) {
    // No key configured anywhere. Signal it explicitly so the client can switch
    // to its local fallback instead of showing a generic failure.
    return NextResponse.json(
      { error: 'No AI provider configured on the server.', code: 'NO_PROVIDER' },
      { status: 503 }
    );
  }

  const model = resolveModel(provider, body.model);
  const config = PROVIDERS[provider];
  const apiKey = getApiKey(provider)!;

  const upstreamBody: Record<string, unknown> = {
    model,
    messages,
    stream: true,
  };
  if (Array.isArray(body.tools) && body.tools.length > 0) {
    upstreamBody.tools = body.tools;
  }
  // Some reasoning-tier models reject any explicit temperature, including 0.7.
  // Only forward it when the caller actually asked for one; `undefined` is
  // dropped by JSON.stringify, so the field is simply absent otherwise.
  if (typeof body.temperature === 'number') {
    upstreamBody.temperature = body.temperature;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(upstreamBody),
    });
  } catch (err) {
    console.error(`[ai-copilot] ${provider} request failed:`, err);
    return NextResponse.json(
      { error: 'Could not reach the AI provider.', code: 'UPSTREAM_UNREACHABLE' },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => '');
    return NextResponse.json(
      { error: extractUpstreamError(text), provider, model },
      { status: upstream.status || 502 }
    );
  }

  // Pipe the SSE stream through byte-for-byte: no buffering, no re-parsing.
  // The two custom headers let the client badge the answer with the provider
  // and model that produced it without inspecting the stream.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-AI-Provider': provider,
      'X-AI-Model': model,
      'X-Accel-Buffering': 'no',
    },
  });
}
