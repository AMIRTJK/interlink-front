import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ConfigProvider, type ThemeConfig } from "antd";
import ruRU from "antd/locale/ru_RU";
import {
  DESIGN_CHANGE_EVENT,
  getThemeAccentColor,
  readThemeKey,
} from "@shared/config";
import { useIsDarkMode } from "@shared/lib";

interface IProps {
  children: ReactNode;
}

/**
 * Глобальный ConfigProvider antd с основным цветом из «Выберите тему».
 *
 * antd не читает CSS-переменные `--th-*`: оттенки hover/active он вычисляет
 * сам из `colorPrimary`, поэтому цвет темы передаём ему значением. Тёмный
 * алгоритм здесь не включаем — модули подключают его локально, и глобальное
 * переключение изменило бы вид экранов, которые на это не рассчитаны.
 */
export const AntdThemeProvider = ({ children }: IProps) => {
  const [themeKey, setThemeKey] = useState(readThemeKey);
  const isDark = useIsDarkMode();

  useEffect(() => {
    const sync = () => setThemeKey(readThemeKey());
    window.addEventListener(DESIGN_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DESIGN_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const theme = useMemo<ThemeConfig>(
    () => ({ token: { colorPrimary: getThemeAccentColor(themeKey, isDark) } }),
    [themeKey, isDark],
  );

  return (
    <ConfigProvider locale={ruRU} theme={theme}>
      {children}
    </ConfigProvider>
  );
};
