/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API AnimeVibe. Vazio = usar o proxy do Vite em dev. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
