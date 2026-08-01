/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Публичный ключ приложения Reverb. APP_SECRET на фронт не передаётся. */
  readonly VITE_REVERB_APP_KEY?: string;
  readonly VITE_REVERB_HOST?: string;
  readonly VITE_REVERB_PORT?: string;
  readonly VITE_REVERB_SCHEME?: "http" | "https";
  // другие переменные окружения
  readonly VITE_OTHER_VAR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
