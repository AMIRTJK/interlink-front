import type Echo from "laravel-echo";
import { ApiRoutes } from "@shared/api";
import { getEnvVar, REVERB_CONFIG } from "@shared/config";

/** Экземпляр Echo, настроенный на драйвер Reverb. */
export type TEchoClient = Echo<"reverb">;

/** Имя приватного канала пользователя на стороне бэкенда. */
export const getUserChannelName = (userId: number) => `user.${userId}`;

/**
 * Создаёт подключение к Reverb.
 *
 * Связка laravel-echo + pusher-js грузится динамическим import'ом: она нужна
 * только авторизованному пользователю и не должна попадать в стартовый бандл.
 * Pusher-клиент передаём опцией, а не через `window.Pusher`, — Echo принимает
 * оба варианта, но глобал здесь не нужен.
 *
 * Возвращает `null`, если Reverb не сконфигурирован (нет ключа или хоста).
 */
export const createEcho = async (
  accessToken: string,
): Promise<TEchoClient | null> => {
  if (!REVERB_CONFIG.isEnabled) return null;

  const [{ default: EchoClient }, { default: Pusher }] = await Promise.all([
    import("laravel-echo"),
    import("pusher-js"),
  ]);

  // В деве показываем рукопожатие и подписку на каналы в консоли: без этого
  // молчаливый отказ Reverb неотличим от «событие просто не пришло».
  if (import.meta.env.DEV) Pusher.logToConsole = true;

  // baseURL в .env хранится со слэшем на конце — иначе в authEndpoint попадёт `//api`.
  const apiUrl = String(getEnvVar("VITE_API_URL")).replace(/\/+$/, "");

  return new EchoClient<"reverb">({
    broadcaster: "reverb",
    Pusher,
    key: REVERB_CONFIG.key,

    wsHost: REVERB_CONFIG.host,
    wsPort: REVERB_CONFIG.port,
    wssPort: REVERB_CONFIG.wssPort,

    forceTLS: REVERB_CONFIG.isSecure,
    enabledTransports: ["ws", "wss"],

    authEndpoint: `${apiUrl}${ApiRoutes.BROADCASTING_AUTH}`,
    auth: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  });
};
