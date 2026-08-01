import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { AppRoutes } from "@shared/config";
import { useChat } from "@widgets/Chat";
import { LayoutMode, THEMES } from "./designSettings";
import { useDesignSettings } from "./useDesignSettings";
import {
  useSidebarCollapsed,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_COLLAPSED,
} from "./useSidebarCollapsed";

// ─── Плавающая кнопка быстрого доступа к чату ─────────────────────────────────
// Показывается в правом нижнем углу рабочей области во всех модулях, кроме самого
// раздела «Чат»: открывает чат всплывающим окном поверх текущего экрана, не меняя
// маршрут и активный пункт навигации. Положение считается от раскладки страницы,
// чтобы кнопка не перекрывала боковое и нижнее меню.

/** Горизонтальные отступы рабочей области (px-6 у раскладок). */
const PAGE_PADDING = 24;
/** Зазор между боковой панелью и контентом (gap-6). */
const LAYOUT_GAP = 24;
/** Высота нижнего меню плюс отступ над ним. */
const BOTTOM_NAV_OFFSET = 92;

interface IProps {
  /** Текущая раскладка страницы: от неё зависит положение кнопки. */
  layoutMode: LayoutMode;
}

export const ChatFloatingButton = ({ layoutMode }: IProps) => {
  const { pathname } = useLocation();
  const { isOpen, openChat } = useChat();
  const [collapsed] = useSidebarCollapsed();
  const { currentTheme } = useDesignSettings();

  const isChatModule =
    pathname === AppRoutes.CHAT || pathname.startsWith(`${AppRoutes.CHAT}/`);

  // В самом разделе «Чат» и при уже открытом окне кнопка не нужна.
  if (isChatModule || isOpen) return null;

  const gradient = THEMES[currentTheme]?.gradient || THEMES.emerald.gradient;
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;
  const right =
    layoutMode === "right"
      ? PAGE_PADDING + sidebarWidth + LAYOUT_GAP
      : PAGE_PADDING;
  const bottom = layoutMode === "bottom" ? BOTTOM_NAV_OFFSET : PAGE_PADDING;

  return (
    <Tooltip title="Открыть чат" placement="left">
      <motion.button
        type="button"
        onClick={openChat}
        aria-label="Открыть чат"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        style={{ right, bottom }}
        className={`fixed z-[80] w-14 h-14 rounded-[2.5rem] bg-linear-to-br ${gradient} text-white shadow-xl border border-white/30 dark:border-zinc-700/40 flex items-center justify-center cursor-pointer focus:outline-none transition-shadow duration-300 hover:shadow-2xl`}
      >
        <MessageSquare size={22} strokeWidth={2.2} />
      </motion.button>
    </Tooltip>
  );
};
