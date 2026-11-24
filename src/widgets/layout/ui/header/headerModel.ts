import type { CSSProperties } from "react";
import type { TooltipProps } from "antd";
import { getEnvVar } from "@shared/config";
import type { LayoutMode } from "../designSettings";

export type TPopupPlacement = TooltipProps["placement"];

export type THeaderGroupId = "communications" | "design" | "session";

/**
 * Названия смысловых групп кнопок управления. Во всех раскладках (шапка, боковое
 * и нижнее меню) группы идут в этом порядке: коммуникации → оформление → сеанс.
 */
export const HEADER_GROUP_LABELS: Record<THeaderGroupId, string> = {
  communications: "Коммуникации",
  design: "Оформление",
  session: "Сеанс",
};

/** Названия меню-групп шапки: каждая свёрнута в одну иконку со списком при наведении. */
export const HEADER_MENU_LABELS = {
  appearance: "Внешний вид",
  page: "Страница",
  session: "Сеанс",
} as const;

export const HEADER_ICON_BUTTON_CLASS =
  "relative flex items-center justify-center w-10 h-10 shrink-0 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

export const HEADER_POPOVER_INNER_STYLE: CSSProperties = {
  borderRadius: "2.5rem",
  padding: 0,
  backgroundColor: "transparent",
};

export interface IProps {
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  layoutMode?: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
}

export const resolvePhotoUrl = (path?: string | null): string => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const apiHost = getEnvVar("VITE_API_URL") || "";
  const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${host}${p}`;
};
