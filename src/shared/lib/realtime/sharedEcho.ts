import { createEcho, type TEchoClient } from "./echoClient";

// ─── Одно соединение с Reverb на всё приложение ───────────────────────────────
// Уведомления и чат слушают разные каналы, но WebSocket им нужен один: браузер
// ограничивает число соединений, а Reverb считает каждое подключение отдельной
// сессией присутствия. Поэтому клиент создаётся один раз и раздаётся по счётчику
// ссылок: последний отписавшийся закрывает соединение.

let instancePromise: Promise<TEchoClient | null> | null = null;
let instanceToken: string | null = null;
let refCount = 0;

/**
 * Возвращает общий Echo-клиент (или `null`, если Reverb не сконфигурирован).
 * Каждый вызов обязан быть парным к `releaseEcho()` — обычно в cleanup эффекта.
 */
export const acquireEcho = (accessToken: string): Promise<TEchoClient | null> => {
  // Смена токена (перелогин) делает старое соединение непригодным: авторизация
  // приватных каналов уйдёт со старым Bearer и получит 403.
  if (instancePromise && instanceToken !== accessToken) {
    const stale = instancePromise;
    instancePromise = null;
    refCount = 0;
    void stale.then((echo) => echo?.disconnect());
  }

  if (!instancePromise) {
    instanceToken = accessToken;
    instancePromise = createEcho(accessToken);
  }

  refCount += 1;
  return instancePromise;
};

/** Освобождает ссылку на общий клиент; при нуле ссылок соединение закрывается. */
export const releaseEcho = () => {
  refCount = Math.max(0, refCount - 1);
  if (refCount > 0 || !instancePromise) return;

  const closing = instancePromise;
  instancePromise = null;
  instanceToken = null;
  void closing.then((echo) => echo?.disconnect());
};
