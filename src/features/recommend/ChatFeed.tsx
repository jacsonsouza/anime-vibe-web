import { useEffect, useRef, type ReactNode } from 'react';

import { AnimeCard } from '@/features/recommend/AnimeCard';
import type {
  ChatMessage,
  RecommendationsStatus,
} from '@/features/recommend/useRecommendations';

const SKELETON_KEYS = ['s1', 's2', 's3'] as const;

interface ChatFeedProps {
  messages: ChatMessage[];
  status: RecommendationsStatus;
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] border-r-4 border-accent bg-surface px-4 py-3 text-base leading-relaxed text-gray-100">
        {text}
      </div>
    </div>
  );
}

function AssistantBubble({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex justify-start">
      <div className="w-full bg-surface px-4 py-4">
        <p className="mb-3 text-xs font-mono tracking-widest text-muted uppercase">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex justify-start">
      <div
        role="status"
        aria-busy="true"
        aria-live="polite"
        className="w-full bg-surface px-4 py-4"
      >
        <span className="sr-only">Buscando recomendações…</span>
        <p className="mb-3 text-xs font-mono tracking-widest text-muted uppercase">
          Buscando…
        </p>
        <div aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="animate-pulse border border-line bg-base"
            >
              <div className="aspect-2/3 bg-line/60" />
              <div className="flex flex-col gap-2 p-3">
                <div className="h-3 w-3/4 bg-line" />
                <div className="h-3 w-1/2 bg-line" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyBubble() {
  return (
    <AssistantBubble label="Sem resultados">
      <p className="text-base font-normal leading-relaxed text-gray-100">
        Nenhum anime encontrado
      </p>
      <p className="mt-1 text-xs font-mono tracking-widest text-muted uppercase">
        Tente outras palavras — ex.: “fofo”, “ação”, “melancólico”.
      </p>
    </AssistantBubble>
  );
}

function ErrorBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start">
      <div
        role="alert"
        className="w-full border-l-4 border-accent bg-surface px-4 py-4"
      >
        <p className="text-xs font-mono tracking-widest text-accent uppercase">
          Falha na busca
        </p>
        <p className="mt-1 text-base font-normal leading-relaxed text-gray-100">
          {text}
        </p>
      </div>
    </div>
  );
}

function GreetingBubble() {
  return (
    <AssistantBubble label="AnimeVibe">
      <p className="text-base font-normal leading-relaxed text-gray-100">
        Descreva seu mood com palavras simples e receba animes combinando com
        seu momento.
      </p>
      <p className="mt-2 text-xs font-mono tracking-widest text-muted uppercase">
        Ex.: “quero chorar” • “só diversão” • “algo fofo”
      </p>
    </AssistantBubble>
  );
}

function MessageView({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return <UserBubble text={message.text} />;
  }

  switch (message.kind) {
    case 'results':
      return (
        <AssistantBubble label={`Recomendações • ${message.animes.length} títulos`}>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {message.animes.map((anime) => (
              <li key={anime.mal_id}>
                <AnimeCard anime={anime} />
              </li>
            ))}
          </ul>
        </AssistantBubble>
      );
    case 'empty':
      return <EmptyBubble />;
    case 'error':
      return <ErrorBubble text={message.text} />;
  }
}

export function ChatFeed({ messages, status }: ChatFeedProps) {
  const feedRef = useRef<HTMLDivElement | null>(null);

  // Sempre acompanha a última mensagem (chat estilo desktop app).
  useEffect(() => {
    const feed = feedRef.current;
    if (feed === null) {
      return;
    }
    feed.scrollTop = feed.scrollHeight;
  }, [messages.length, status]);

  const showGreeting = messages.length === 0 && status === 'idle';

  return (
    <div ref={feedRef} className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        <h2 className="sr-only">Conversa</h2>

        {showGreeting && <GreetingBubble />}

        {messages.map((message) => (
          <MessageView key={message.id} message={message} />
        ))}

        {status === 'loading' && <LoadingBubble />}
      </div>
    </div>
  );
}
