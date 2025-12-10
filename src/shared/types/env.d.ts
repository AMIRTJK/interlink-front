/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // другие переменные окружения
  readonly VITE_OTHER_VAR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
