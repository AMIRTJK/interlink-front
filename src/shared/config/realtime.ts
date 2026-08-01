/** Параметры подключения к Laravel Reverb (WebSocket-шлюз бэкенда). */

// Читаем `import.meta.env.VITE_*` статически: Vite подставляет значения на
// этапе сборки только при прямом обращении к полю, динамический доступ по
// ключу в проде превращается в undefined (см. getEnvVar в ./env).
const SCHEME = import.meta.env.VITE_REVERB_SCHEME || "http";
const KEY = import.meta.env.VITE_REVERB_APP_KEY || "";
const HOST = import.meta.env.VITE_REVERB_HOST || "";

/** Порт защищённого соединения фиксирован на стороне Reverb. */
const WSS_PORT = 443;

export const REVERB_CONFIG = {
  key: KEY,
  host: HOST,
  port: Number(import.meta.env.VITE_REVERB_PORT || 80),
  wssPort: WSS_PORT,
  isSecure: SCHEME === "https",
  /** Без ключа и хоста подключаться некуда — realtime просто не включается. */
  isEnabled: Boolean(KEY && HOST),
} as const;
