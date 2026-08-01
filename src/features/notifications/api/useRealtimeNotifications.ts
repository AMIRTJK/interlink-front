import { useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  createEcho,
  getUserChannelName,
  toast,
  tokenControl,
  useCurrentUser,
  type TEchoClient,
} from "@shared/lib";
import { REVERB_CONFIG } from "@shared/config";
import { getRealtimeInvalidateKeys } from "../lib/realtimeKeys";
import type { IRealtimeNotification } from "../model";

/** Имя события Laravel; ведущая точка означает broadcastAs без namespace. */
const EVENT_NAME = ".user.notification";

/**
 * Подписка на приватный канал `user.{id}` в Reverb.
 *
 * Событие — только сигнал об изменении: данные догружаются существующими
 * REST-запросами через инвалидацию кэша. Монтируется один раз на приложение.
 */
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const token = tokenControl.get();

  // Основной источник id в проекте — localStorage (кладётся при логине и
  // используется в useNavbar, useMenuLogic, useProfileUser и др.). auth/me
  // отдаёт пользователя вложенным и до `id` в useCurrentUser не доходит,
  // поэтому он остаётся запасным вариантом.
  const storedUserId = Number(tokenControl.getUserId());
  const userId =
    storedUserId > 0 ? storedUserId : typeof user?.id === "number" ? user.id : null;

  const handleNotification = useCallback(
    (event: IRealtimeNotification) => {
      if (event?.title) toast.info(event.title);

      for (const key of getRealtimeInvalidateKeys(event?.type ?? "")) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
    [queryClient],
  );

  useEffect(() => {
    // В деве отчитываемся о каждом решении подключаться: без этого «не хватило
    // ключа», «нет пользователя» и «сокет упал» выглядят одинаково — тишиной.
    if (import.meta.env.DEV) {
      console.info("[realtime] проверка подписки:", {
        сконфигурирован: REVERB_CONFIG.isEnabled,
        хост: REVERB_CONFIG.host || "—",
        ключ: REVERB_CONFIG.key ? "есть" : "нет",
        пользователь: userId ?? "—",
        токен: token ? "есть" : "нет",
      });
    }

    if (!REVERB_CONFIG.isEnabled || !userId || !token) return;

    const channelName = getUserChannelName(userId);
    let echo: TEchoClient | null = null;
    let isCancelled = false;

    createEcho(token)
      .then((instance) => {
        if (!instance) return;

        // Пользователь успел разлогиниться или сменить токен, пока грузился чанк.
        if (isCancelled) {
          instance.disconnect();
          return;
        }

        echo = instance;
        instance
          .private(channelName)
          .listen(EVENT_NAME, handleNotification)
          .subscribed(() => {
            if (import.meta.env.DEV) {
              console.info("[realtime] подписка активна:", channelName);
            }
          })
          .error((error: unknown) => {
            console.error("Reverb: ошибка подписки на канал", channelName, error);
          });
      })
      .catch((error: unknown) => {
        console.error("Reverb: не удалось установить соединение", error);
      });

    return () => {
      isCancelled = true;
      if (!echo) return;
      echo.leave(channelName);
      echo.disconnect();
      echo = null;
    };
  }, [userId, token, handleNotification]);
};
