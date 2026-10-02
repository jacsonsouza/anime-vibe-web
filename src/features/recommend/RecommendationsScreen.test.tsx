import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { getRecommendations, type Anime } from '@/api/recommendations';
import { RecommendationsScreen } from '@/features/recommend/RecommendationsScreen';

vi.mock('@/api/recommendations', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/recommendations')>();
  return { ...actual, getRecommendations: vi.fn() };
});

const mockedGetRecommendations = vi.mocked(getRecommendations);

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

beforeEach(() => {
  mockedGetRecommendations.mockReset();
});

async function submitVibe(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.type(screen.getByLabelText(/como você está se sentindo/i), text);
  await user.click(screen.getByRole('button', { name: /send/i }));
}

describe('RecommendationsScreen', () => {
  it('renderiza o formulário no estado inicial', () => {
    render(<RecommendationsScreen />);

    expect(
      screen.getByLabelText(/como você está se sentindo/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('mostra erro de validação e não chama a API com texto vazio', async () => {
    const user = userEvent.setup();
    render(<RecommendationsScreen />);

    await user.click(screen.getByRole('button', { name: /send/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      /descreva seu mood/i,
    );
    expect(mockedGetRecommendations).not.toHaveBeenCalled();
  });

  it('exibe loading e depois os cards de anime', async () => {
    mockedGetRecommendations.mockResolvedValue(SAMPLE);
    const user = userEvent.setup();
    render(<RecommendationsScreen />);

    await submitVibe(user, 'algo aconchegante');

    expect(
      await screen.findByRole('heading', { name: 'Yuru Camp△' }),
    ).toBeInTheDocument();
    expect(mockedGetRecommendations).toHaveBeenCalledWith(
      'algo aconchegante',
      expect.any(AbortSignal),
    );
    expect(screen.getByText(/★ 8\.3/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /ver no myanimelist/i }),
    ).toHaveAttribute('href', 'https://myanimelist.net/anime/31964');
    expect(screen.getByRole('button', { name: /send/i })).toBeEnabled();
  });

  it('desabilita o botão enquanto a busca está em andamento', async () => {
    let resolveRequest: (value: Anime[]) => void = () => undefined;
    mockedGetRecommendations.mockReturnValue(
      new Promise<Anime[]>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<RecommendationsScreen />);

    await submitVibe(user, 'ação');

    expect(screen.getByRole('button', { name: /buscando/i })).toBeDisabled();
    expect(screen.getByRole('status')).toBeInTheDocument();

    resolveRequest(SAMPLE);
    expect(
      await screen.findByRole('heading', { name: 'Yuru Camp△' }),
    ).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando a API falha', async () => {
    mockedGetRecommendations.mockRejectedValue(
      new ApiError('rate limit', 429),
    );
    const user = userEvent.setup();
    render(<RecommendationsScreen />);

    await submitVibe(user, 'ação');

    expect(await screen.findByRole('alert')).toHaveTextContent('rate limit');
    expect(
      screen.queryByRole('heading', { name: 'Yuru Camp△' }),
    ).not.toBeInTheDocument();
  });

  it('exibe estado vazio quando a API devolve lista vazia', async () => {
    mockedGetRecommendations.mockResolvedValue([]);
    const user = userEvent.setup();
    render(<RecommendationsScreen />);

    await submitVibe(user, 'xyzw inexistente');

    expect(await screen.findByText(/nenhum anime encontrado/i)).toBeInTheDocument();
  });
});
