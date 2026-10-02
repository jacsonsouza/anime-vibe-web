import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError, errorMessage } from '@/api/client';
import { getRecommendations, type Anime } from '@/api/recommendations';

const SAMPLE: Anime[] = [
  {
    mal_id: 31964,
    title: 'Yuru Camp△',
    score: 8.31,
    genres: ['Slice of Life'],
    synopsis: 'Girls camping near Mount Fuji...',
    image_url: 'https://cdn.myanimelist.net/images/anime/1390/92444l.jpg',
    url: 'https://myanimelist.net/anime/31964',
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('getRecommendations', () => {
  it('faz POST /recommendations/ com o corpo correto e mapeia a resposta', async () => {
    const fetchMock = stubFetch(
      new Response(JSON.stringify(SAMPLE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await getRecommendations('algo aconchegante');

    expect(fetchMock).toHaveBeenCalledWith(
      '/recommendations/',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'algo aconchegante' }),
      }),
    );
    expect(result).toEqual(SAMPLE);
  });

  it('lança ApiError com a mensagem de rate limit no 429', async () => {
    stubFetch(new Response(null, { status: 429 }));

    const promise = getRecommendations('x');

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(getRecommendations('x')).rejects.toThrow(
      /limitando as requisições/,
    );
  });

  it('traduz erro de validação 422 para mensagem amigável', async () => {
    stubFetch(
      new Response(
        JSON.stringify({
          detail: [{ msg: 'String should have at least 1 character', loc: ['body', 'text'] }],
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await expect(getRecommendations('')).rejects.toThrow(
      /texto enviado é inválido/,
    );
  });
});

describe('errorMessage', () => {
  it('sugere subir o backend quando a rede falha', () => {
    expect(errorMessage(new TypeError('Failed to fetch'))).toContain(
      '127.0.0.1:8000',
    );
  });

  it('usa mensagem genérica para erros desconhecidos', () => {
    expect(errorMessage(new Error('boom'))).toBe(
      'Erro inesperado ao buscar recomendações.',
    );
  });
});
