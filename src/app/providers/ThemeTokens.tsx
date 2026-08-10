import { useEffect } from "react";
import {
  DESIGN_CHANGE_EVENT,
  applyThemeTokens,
  readThemeKey,
} from "@shared/config";

/**
 * Держит CSS-переменные темы в актуальном состоянии.
 *
 * Тема хранится в localStorage и меняется из попапа «Выберите тему», режим —
 * классом `dark` на <html>. Провайдер слушает и то и другое и переписывает
 * токены в корне документа, поэтому перекрашивание не требует ререндера
 * разметки: цвета берутся из переменных.
 */
export const ThemeTokens = () => {
  useEffect(() => {
    const sync = () => {
      applyThemeTokens(
        readThemeKey(),
        document.documentElement.classList.contains("dark"),
      );
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener(DESIGN_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener(DESIGN_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return null;
};
