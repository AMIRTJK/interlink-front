import {
  PanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
  type LucideIcon,
} from "lucide-react";
import { BACKGROUNDS, THEMES, type LayoutMode } from "../designSettings";
import type { IHeaderOption } from "./HeaderOptionGrid";

const SWATCH_CLASS = "block w-9 h-9 rounded-full bg-gradient-to-br shadow-md";
const LAYOUT_PREVIEW_CLASS =
  "flex items-center justify-center w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300";
const LAYOUT_ICON_PROPS = { size: 18, strokeWidth: 2.2 } as const;

export const THEME_OPTIONS: IHeaderOption[] = Object.entries(THEMES).map(
  ([key, theme]) => ({
    key,
    label: key,
    preview: <span className={`${SWATCH_CLASS} ${theme.swatch || theme.gradient}`} />,
  }),
);

const toBgOptions = (isDarkMode: boolean): IHeaderOption[] =>
  Object.entries(BACKGROUNDS).map(([key, bg]) => ({
    key,
    label: bg.name,
    preview: (
      <span
        className={`${SWATCH_CLASS} border border-zinc-200 dark:border-zinc-600 ${
          isDarkMode ? bg.dark : bg.light
        }`}
      />
    ),
  }));

export const BG_OPTIONS_LIGHT = toBgOptions(false);
export const BG_OPTIONS_DARK = toBgOptions(true);

const LAYOUT_SOURCE: { key: LayoutMode; label: string; icon: LucideIcon }[] = [
  { key: "top", label: "Сверху", icon: PanelTop },
  { key: "left", label: "Слева", icon: PanelLeft },
  { key: "bottom", label: "Снизу", icon: PanelBottom },
  { key: "right", label: "Справа", icon: PanelRight },
];

export const LAYOUT_OPTIONS: IHeaderOption[] = LAYOUT_SOURCE.map(({ key, label, icon: Icon }) => ({
  key,
  label,
  preview: (
    <span className={LAYOUT_PREVIEW_CLASS}>
      <Icon {...LAYOUT_ICON_PROPS} />
    </span>
  ),
}));

export const isLayoutMode = (value: string): value is LayoutMode =>
  LAYOUT_SOURCE.some((option) => option.key === value);
