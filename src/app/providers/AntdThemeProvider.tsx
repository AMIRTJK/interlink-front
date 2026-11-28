import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ConfigProvider, theme as antdTheme, type ThemeConfig } from "antd";
import ruRU from "antd/locale/ru_RU";
import {
  DESIGN_CHANGE_EVENT,
  getDarkSurfaceColors,
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
 * сам из `colorPrimary`, поэтому цвет темы передаём ему значением.
 *
 * В тёмном режиме фоны antd — те же уровни поверхности, что `--th-dark-*` в
 * разметке: без этого dark-алгоритм даёт нейтрально-серые #141414/#1f1f1f, и
 * меню, таблицы и модалки выбиваются из остального интерфейса. Локальные
 * ConfigProvider модулей наследуют эти токены.
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

  const theme = useMemo<ThemeConfig>(() => {
    const colorPrimary = getThemeAccentColor(themeKey, isDark);
    // Активная страница — заливка цветом темы, как активные пункты в разметке.
    // По умолчанию antd рисует её контуром, и в тёмной теме она теряется.
    const components: ThemeConfig["components"] = {
      Pagination: {
        itemActiveBg: colorPrimary,
        itemActiveColor: "#fff",
        itemActiveColorHover: "#fff",
      },
    };
    if (!isDark) return { token: { colorPrimary }, components };

    const surface = getDarkSurfaceColors(themeKey);
    return {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorPrimary,
        colorBgLayout: surface.base,
        colorBgContainer: surface.raised,
        colorBgElevated: surface.raised,
        colorBorder: surface.high,
        colorBorderSecondary: surface.high,
      },
      components,
    };
  }, [themeKey, isDark]);

  return (
    <ConfigProvider locale={ruRU} theme={theme}>
      {children}
    </ConfigProvider>
  );
};
