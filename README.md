# AnimeVibe Web

Front-end web da **AnimeVibe** — descreva seu mood em linguagem natural e receba
recomendações de anime do MyAnimeList.

Projeto **independente** do back-end (`../anime-vibe`): este repo contém apenas o
front React, e a única integração é o contrato HTTP da API
(`POST /recommendations/`). Nenhum código Python é importado ou duplicado.

## Tech Stack

| Concern | Choice |
| --- | --- |
| Framework | **React 19** + **TypeScript** |
| Build | **Vite** |
| Estilo | **Tailwind CSS v4** (tokens em `@theme`) |
| Testes | **Vitest** + **Testing Library** (jsdom) |

## Estrutura

```
anime-vibe-web/
├── src/
│   ├── api/                          # Cliente HTTP tipado (única ponte com o back)
│   │   ├── client.ts                 #   postJson, ApiError, mensagens de erro amigáveis
│   │   └── recommendations.ts        #   contrato Anime + getRecommendations()
│   ├── features/recommend/           # Feature de recomendação
│   │   ├── useRecommendations.ts     #   hook: status (idle|loading|success|error) + abort
│   │   ├── RecommendationsScreen.tsx #   orquestra loading/vazio/erro/sucesso
│   │   ├── VibeForm.tsx              #   formulário controlado (label, validação, anti duplo-envio)
│   │   ├── AnimeCard.tsx             #   card com capa, score, gêneros e link
│   │   └── *.test.tsx                #   testes de comportamento
│   ├── App.tsx                       # layout (header/main/footer)
│   ├── index.css                     # tema Tailwind v4 (@theme tokens)
│   └── main.tsx
├── vite.config.ts                    # proxy /recommendations -> :8000 + config do Vitest
└── package.json
```

## Getting Started

Prerequisito: Node.js LTS (>= 20). Com nvm:

```bash
nvm install --lts   # já instalado nesta máquina: v24
npm install
npm run dev         # http://127.0.0.1:5173
```

O back-end precisa estar rodando em outra aba:

```bash
# em ../anime-vibe
uvicorn src.main:app --reload   # http://127.0.0.1:8000
```

## Como o front fala com o back (sem misturar)

- **Dev:** o Vite faz **proxy** de `/recommendations` para `http://127.0.0.1:8000`
  — o browser nunca cross-origin, **não precisa de CORS** no back.
- **Produção:** defina `VITE_API_BASE_URL` (ver `.env.example`) apontando para a
  API; nesse caso habilite CORS no back (middleware `CORSMiddleware`).

O contrato é espelhado em `src/api/recommendations.ts`
(`VibeRequest`/`AnimeRecommendationResponse` de `src/api/schemas.py`) — se o back
mudar o schema, atualize esse arquivo.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Dev server com proxy para a API |
| `npm run build` | Type-check (`tsc -b`) + build de produção |
| `npm test` | Suite completa (Vitest, uma vez) |
| `npm run test:watch` | Vitest em watch mode |
| `npm run preview` | Serve o `dist/` localmente |

## Estados cobertos

A tela de recomendações cobre os quatro estados obrigatórios:
**idle** (form), **loading** (skeleton + `aria-busy`), **erro**
(`role="alert"` com mensagem amigável por status: 422/429/5xx/rede) e
**sucesso** (grid de cards ou estado vazio).
