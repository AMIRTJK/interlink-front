import type { ReactNode } from "react";
import type { MenuItem } from "./lib";

export interface IProps {
  variant: "horizontal" | "compact" | "modern" | "full" | "ios" | "header";
  hideTopLevel?: boolean;
  /**
   * Раскладка навигации для варианта "header":
   * - "top"     — горизонтальный ряд, только иконки + tooltip (верхнее меню);
   * - "sidebar" — вертикальный список, иконка + подпись (боковое меню);
   * - "bottom"  — горизонтальный ряд, иконка над подписью (нижнее меню).
   */
  navLayout?: "top" | "sidebar" | "bottom";
  /** Свёрнутая боковая панель (navLayout="sidebar"): показывать только иконки. */
  collapsed?: boolean;
}

export type TSubMenuItem = {
  key: string;
  label: ReactNode;
  children?: MenuItem[];
  requiredRole?: string[];
  icon?: ReactNode;
};

export const SHARED_ROUTES = ["archive", "pinned", "trashed"];
export const STORAGE_KEY = "correspondence_active_tab";

export const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

export const ITEM_VARIANTS = {
  hidden: { y: -10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const CONTENT_VARIANTS = {
  hidden: { y: 5, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};
