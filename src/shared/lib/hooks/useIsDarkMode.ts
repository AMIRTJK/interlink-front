import { useEffect, useState } from "react";

/**
 * Отслеживает тёмную тему приложения.
 *
 * Тема переключается классом `.dark` на <html> (см. useDesignSettings /
 * tokenControl), поэтому подписываемся на изменение класса и возвращаем
 * актуальное значение. Нужен, чтобы прокидывать `theme.darkAlgorithm` в antd
 * `ConfigProvider` для модулей, построенных на Tailwind + antd.
 */
export const useIsDarkMode = (): boolean => {
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() =>
      setIsDark(el.classList.contains("dark")),
    );
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
};
