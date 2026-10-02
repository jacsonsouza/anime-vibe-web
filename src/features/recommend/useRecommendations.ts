import { useCallback, useEffect, useRef, useState } from 'react';

import { errorMessage, isAbortError } from '@/api/client';
import { getRecommendations, type Anime } from '@/api/recommendations';

export type RecommendationsStatus = 'idle' | 'loading' | 'success' | 'error';

export type ChatMessage =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; kind: 'results'; animes: Anime[] }
  | { id: number; role: 'assistant'; kind: 'empty' }
  | { id: number; role: 'assistant'; kind: 'error'; text: string };

export interface UseRecommendations {
  status: RecommendationsStatus;
  messages: ChatMessage[];
  submit: (text: string) => void;
  reset: () => void;
}

export function useRecommendations(): UseRecommendations {
  const [status, setStatus] = useState<RecommendationsStatus>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const idRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const nextId = () => {
    idRef.current += 1;
    return idRef.current;
  };

  // Cancela requisição pendente ao desmontar (StrictMode/roteamento).
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const submit = useCallback((text: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setStatus('loading');

    getRecommendations(text, controller.signal)
      .then((result) => {
        setMessages((prev) => [
          ...prev,
          result.length > 0
            ? { id: nextId(), role: 'assistant', kind: 'results', animes: result }
            : { id: nextId(), role: 'assistant', kind: 'empty' },
        ]);
        setStatus('success');
      })
      .catch((caught: unknown) => {
        if (isAbortError(caught)) {
          return;
        }
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', kind: 'error', text: errorMessage(caught) },
        ]);
        setStatus('error');
      });
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStatus('idle');
  }, []);

  return { status, messages, submit, reset };
}
