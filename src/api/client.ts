/** URL base da API. Vazia em dev → o proxy do Vite encaminha a requisição. */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida.',
  404: 'Endpoint da API não encontrado. O backend está rodando?',
  422: 'O texto enviado é inválido. Revise e tente de novo.',
  429:
    'O MyAnimeList está limitando as requisições agora. Aguarde um instante e tente novamente.',
  500: 'A API falhou ao processar o pedido. Tente novamente em instantes.',
  503: 'Serviço indisponível no momento. Tente novamente em instantes.',
};

const GENERIC_MESSAGE = 'Erro inesperado ao buscar recomendações.';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

/** Mensagem amigável para exibir na UI, sem vazar detalhes internos. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof TypeError) {
    return 'Não foi possível conectar à AnimeVibe API. Confira se o backend está rodando em http://127.0.0.1:8000.';
  }
  return GENERIC_MESSAGE;
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallback =
    STATUS_MESSAGES[response.status] ?? `Falha na requisição (HTTP ${response.status}).`;

  try {
    const payload = (await response.json()) as { detail?: unknown };
    const detail = payload.detail;

    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }
    // Erro de validação do FastAPI (array de { msg, loc }) → usa o texto
    // amigável do status, sem vazar mensagem crua/detalhe interno.
  } catch {
    // Corpo não-JSON (ou vazio): usa a mensagem padrão do status.
  }

  return fallback;
}

export async function postJson<TBody>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<TBody> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as TBody;
}
