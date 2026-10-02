import { useState, type FormEvent } from 'react';

import { VIBE_MAX_LENGTH, VIBE_MIN_LENGTH } from '@/api/recommendations';

interface VibeFormProps {
  isSubmitting: boolean;
  onSubmit: (text: string) => void;
}

export function VibeForm({ isSubmitting, onSubmit }: VibeFormProps) {
  const [text, setText] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = text.trim();
    if (trimmed.length < VIBE_MIN_LENGTH) {
      setFieldError('Descreva seu mood para receber recomendações.');
      return;
    }

    setFieldError(null);
    onSubmit(trimmed);
    setText('');
  }

  function handleChange(value: string) {
    setText(value);
    if (fieldError !== null) {
      setFieldError(null);
    }
  }

  return (
    <div className="shrink-0 border-t border-line bg-base">
      <div className="mx-auto w-full max-w-2xl px-4 py-4">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-2">
          <label htmlFor="vibe" className="sr-only">
            Como você está se sentindo?
          </label>

          <div className="flex items-stretch border border-line bg-surface transition-colors focus-within:border-accent">
            <input
              id="vibe"
              type="text"
              value={text}
              maxLength={VIBE_MAX_LENGTH}
              onChange={(event) => handleChange(event.target.value)}
              placeholder="Descreva seu mood… ex.: “algo fofo”"
              aria-invalid={fieldError !== null}
              aria-describedby={
                fieldError !== null ? 'vibe-hint vibe-error' : 'vibe-hint'
              }
              className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base leading-relaxed text-gray-100 outline-none placeholder:text-muted"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="shrink-0 bg-accent px-5 font-mono text-xs font-bold tracking-widest text-white uppercase transition-colors hover:bg-white hover:text-base disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Buscando…' : 'SEND'}
            </button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <p id="vibe-hint" className="sr-only">
              Uma frase basta: sentimento, clima, vibe. Ex.: “quero chorar”,
              “só diversão”, “algo fofo”.
            </p>

            <p
              aria-hidden="true"
              className="ml-auto shrink-0 font-mono text-xs tracking-widest text-muted tabular-nums"
            >
              {text.length}/{VIBE_MAX_LENGTH}
            </p>
          </div>

          {fieldError !== null && (
            <p
              id="vibe-error"
              role="alert"
              className="border-l-4 border-accent bg-surface px-3 py-2 font-mono text-xs tracking-widest text-accent uppercase"
            >
              {fieldError}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
