import { postJson } from '@/api/client';

/** Contrato espelhado de `AnimeRecommendationResponse` (src/api/schemas.py). */
export interface Anime {
  mal_id: number;
  title: string;
  score: number | null;
  genres: string[];
  synopsis: string | null;
  image_url: string | null;
  url: string | null;
}

/** Mesmo limite do `VibeRequest.text` no back (min 1 / max 500). */
export const VIBE_MIN_LENGTH = 1;
export const VIBE_MAX_LENGTH = 500;

export function getRecommendations(text: string, signal?: AbortSignal): Promise<Anime[]> {
  return postJson<Anime[]>('/recommendations/', { text }, signal);
}
