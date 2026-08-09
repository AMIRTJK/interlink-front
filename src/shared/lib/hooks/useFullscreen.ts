import { useCallback, useEffect, useState } from "react";

/**
 * Полноэкранный режим страницы — тот же результат, что даёт F11.
 *
 * Состояние читаем из `document.fullscreenElement`, а не храним своё: выйти из
 * полноэкранного режима можно и мимо кнопки — клавишей Esc или тем же F11, и
 * собственный флаг разъехался бы с реальностью. По этой же причине кнопка не
 * меняет вид сама: её переключает событие `fullscreenchange`.
 *
 * Браузер вправе отклонить запрос (жест пользователя не дошёл до вызова,
 * режим запрещён политикой окна) — тогда состояние просто остаётся прежним.
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(
    () =>
      typeof document !== "undefined" && Boolean(document.fullscreenElement),
  );

  useEffect(() => {
    const syncState = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));

    document.addEventListener("fullscreenchange", syncState);
    return () => document.removeEventListener("fullscreenchange", syncState);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const request = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();

    request.catch((error) => console.error("Полноэкранный режим:", error));
  }, []);

  return { isFullscreen, toggleFullscreen };
};
