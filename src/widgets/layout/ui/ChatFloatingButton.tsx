import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { AppRoutes } from "@shared/config";
import { tokenControl } from "@shared/lib";
import { useChat, useChatCounters } from "@widgets/Chat";
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

  const isAuthenticated = Boolean(tokenControl.get());
  const counters = useChatCounters(!isOpen && isAuthenticated);
  const unreadCount = counters.unread_messages || counters.unread_conversations || 0;

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

  const tooltipTitle =
    unreadCount > 0
      ? `Чат (${unreadCount} непрочитанн${unreadCount === 1 ? "ое сообщение" : "ых сообщений"})`
      : "Открыть чат";

  return (
    <Tooltip title={tooltipTitle} placement="left">
      <motion.div
        style={{ right, bottom }}
        className="fixed z-[80]"
      >
        {/* Анимированный аура-пульс при наличии новых непрочитанных сообщений */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.75, 0.2, 0.75],
              }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-rose-500 via-violet-500 to-cyan-400 blur-md pointer-events-none -z-10"
            />
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={openChat}
          aria-label={tooltipTitle}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: unreadCount > 0 ? [1, 1.06, 1] : 1,
          }}
          transition={
            unreadCount > 0
              ? {
                  scale: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 0.2 },
                }
              : { duration: 0.2, ease: "easeOut" }
          }
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`relative w-14 h-14 rounded-[2.5rem] bg-linear-to-br ${gradient} text-white shadow-xl border border-white/30 dark:border-zinc-700/40 flex items-center justify-center cursor-pointer focus:outline-none transition-shadow duration-300 hover:shadow-2xl`}
        >
          <MessageSquare size={22} strokeWidth={2.2} />

          {/* Яркий бэдж со счётчиком непрочитанных сообщений */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className="absolute -top-1 -right-1 min-w-5.5 h-5.5 px-1.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-500 text-white text-[11px] font-bold flex items-center justify-center shadow-lg border-2 border-white dark:border-white/90 select-none"
                style={{
                  boxShadow: "0 0 12px rgba(225,29,72,0.85)",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </Tooltip>
  );
};
