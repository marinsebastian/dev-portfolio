'use client';

import { useCallback, useRef, useState } from 'react';
import {
  buildSystemPrompt,
  COPILOT_TOOLS,
  extractSuggestions,
  ONE_SHOT_EXAMPLE,
  type ChatMessage,
  type ToolCall,
} from '@/lib/copilotTools';
import type { ProviderId } from '@/lib/aiProviders';

export interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Which provider/model produced this answer, for the response badge. */
  provider?: string;
  model?: string;
  /** Names of tools invoked while producing this answer, shown as chips. */
  actions?: string[];
  error?: boolean;
}

/** Executes a tool call against local app state and returns a JSON-serialisable result. */
export type ToolExecutor = (name: string, args: Record<string, unknown>) => unknown;

/** Cap the loop so a model that keeps calling tools cannot spin forever. */
const MAX_TOOL_ROUNDS = 4;

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface StreamResult {
  content: string;
  toolCalls: ToolCall[];
  provider: string | null;
  model: string | null;
}

/**
 * Reads one SSE response, accumulating text deltas and fragmented tool-call
 * deltas. Tool calls arrive indexed and split across chunks, so `id`, `name`
 * and `arguments` all have to be concatenated per index as fragments land.
 */
async function readStream(
  response: Response,
  onText: (text: string) => void
): Promise<StreamResult> {
  const provider = response.headers.get('X-AI-Provider');
  const model = response.headers.get('X-AI-Model');
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let content = '';
  const toolCallsByIndex = new Map<number, ToolCall>();

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // The final line may be a partial event; keep it for the next chunk.
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;

      let parsed: {
        choices?: {
          delta?: {
            content?: string;
            tool_calls?: {
              index?: number;
              id?: string;
              function?: { name?: string; arguments?: string };
              extra_content?: unknown;
            }[];
          };
        }[];
      };
      try {
        parsed = JSON.parse(payload);
      } catch {
        // A stray partial line can slip through; skipping it is correct.
        continue;
      }

      const delta = parsed.choices?.[0]?.delta;
      if (!delta) continue;

      if (delta.content) {
        content += delta.content;
        onText(content);
      }

      if (Array.isArray(delta.tool_calls)) {
        for (const fragment of delta.tool_calls) {
          const index = fragment.index ?? 0;
          const existing = toolCallsByIndex.get(index) ?? {
            id: '',
            type: 'function' as const,
            function: { name: '', arguments: '' },
          };

          if (fragment.id) existing.id = fragment.id;
          if (fragment.function?.name) existing.function.name += fragment.function.name;
          if (fragment.function?.arguments) existing.function.arguments += fragment.function.arguments;
          // Gemini's thought_signature rides here and must survive untouched.
          if (fragment.extra_content !== undefined) existing.extra_content = fragment.extra_content;

          toolCallsByIndex.set(index, existing);
        }
      }
    }
  }

  return {
    content,
    toolCalls: [...toolCallsByIndex.values()].filter((c) => c.function.name),
    provider,
    model,
  };
}

export function useCopilotChat(executeTool: ToolExecutor, language: 'es' | 'en') {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);

  // Full protocol history, including tool messages the user never sees.
  const historyRef = useRef<ChatMessage[]>([]);
  // Batches stream updates to one per animation frame: a fast connection
  // delivers far more chunks than the display can usefully repaint.
  const pendingTextRef = useRef('');
  const frameRef = useRef<number | null>(null);

  const scheduleTextUpdate = useCallback((text: string) => {
    pendingTextRef.current = text;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      setStreamingText(pendingTextRef.current);
    });
  }, []);

  const reset = useCallback(() => {
    historyRef.current = [];
    setMessages([]);
    setSuggestions([]);
    setStreamingText('');
  }, []);

  const send = useCallback(
    async (userText: string, provider: ProviderId | null) => {
      const trimmed = userText.trim();
      if (!trimmed || isStreaming) return;

      setMessages((prev) => [...prev, { id: newId(), role: 'user', content: trimmed }]);
      setSuggestions([]);
      setIsStreaming(true);
      setStreamingText('');
      historyRef.current.push({ role: 'user', content: trimmed });

      const actionsTaken: string[] = [];
      let finalProvider: string | null = null;
      let finalModel: string | null = null;

      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const isFinalRound = round === MAX_TOOL_ROUNDS - 1;

          const response = await fetch('/api/ai-copilot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: provider ?? undefined,
              messages: [
                { role: 'system', content: buildSystemPrompt(language) },
                ...ONE_SHOT_EXAMPLE,
                ...historyRef.current,
              ],
              // Drop tools on the last allowed round so the model is forced to
              // produce prose instead of looping on tool calls forever.
              tools: isFinalRound ? undefined : COPILOT_TOOLS,
            }),
          });

          if (!response.ok || !response.body) {
            const detail = await response.json().catch(() => ({}));
            throw new Error(
              detail?.code === 'NO_PROVIDER'
                ? 'NO_PROVIDER'
                : (detail?.error ?? `Request failed (${response.status})`)
            );
          }

          const result = await readStream(response, scheduleTextUpdate);
          finalProvider = result.provider;
          finalModel = result.model;
          if (result.provider) setActiveProvider(result.provider as ProviderId);

          if (result.toolCalls.length === 0) {
            const { text, suggestions: parsed } = extractSuggestions(result.content);
            historyRef.current.push({ role: 'assistant', content: result.content });

            // A model can burn its final round emitting tool syntax as prose,
            // leaving nothing to show. Reporting what actually happened to the
            // map beats an empty bubble.
            const fallback =
              actionsTaken.length > 0
                ? language === 'es'
                  ? `Listo. Apliqué ${actionsTaken.length} ${actionsTaken.length === 1 ? 'acción' : 'acciones'} sobre el mapa.`
                  : `Done. I applied ${actionsTaken.length} ${actionsTaken.length === 1 ? 'change' : 'changes'} to the map.`
                : language === 'es'
                  ? 'No recibí una respuesta legible del modelo. Intenta reformular la pregunta.'
                  : 'The model returned no readable answer. Try rephrasing the question.';

            setMessages((prev) => [
              ...prev,
              {
                id: newId(),
                role: 'assistant',
                content: text || fallback,
                provider: finalProvider ?? undefined,
                model: finalModel ?? undefined,
                actions: actionsTaken.length ? [...actionsTaken] : undefined,
              },
            ]);
            setSuggestions(parsed);
            return;
          }

          // Echo the assistant turn back verbatim — including extra_content,
          // which Gemini requires — then append one tool result per call.
          historyRef.current.push({
            role: 'assistant',
            content: result.content,
            tool_calls: result.toolCalls,
          });

          for (const call of result.toolCalls) {
            let args: Record<string, unknown> = {};
            try {
              args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
            } catch {
              args = {};
            }

            let toolResult: unknown;
            try {
              toolResult = executeTool(call.function.name, args);
              actionsTaken.push(call.function.name);
            } catch (err) {
              toolResult = { error: err instanceof Error ? err.message : 'Tool failed.' };
            }

            historyRef.current.push({
              role: 'tool',
              tool_call_id: call.id,
              content: JSON.stringify(toolResult ?? null),
            });
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: 'assistant',
            content:
              message === 'NO_PROVIDER'
                ? language === 'es'
                  ? 'No hay ningún proveedor de IA configurado en el servidor. Define NVIDIA_API_KEY, GEMINI_API_KEY u OPENAI_API_KEY para activar el copiloto. Mientras tanto, los controles del mapa siguen funcionando con normalidad.'
                  : 'No AI provider is configured on the server. Set NVIDIA_API_KEY, GEMINI_API_KEY or OPENAI_API_KEY to enable the copilot. The map controls keep working normally in the meantime.'
                : language === 'es'
                  ? `El copiloto no pudo responder: ${message}`
                  : `The copilot could not respond: ${message}`,
            error: true,
          },
        ]);
      } finally {
        setIsStreaming(false);
        setStreamingText('');
        pendingTextRef.current = '';
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      }
    },
    [executeTool, isStreaming, language, scheduleTextUpdate]
  );

  return { messages, streamingText, isStreaming, suggestions, activeProvider, send, reset };
}
