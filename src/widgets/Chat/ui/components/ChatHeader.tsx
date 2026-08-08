import { motion } from "framer-motion";
import {
  Edit3,
  UserPlus,
  Maximize2,
  Minimize2,
  X,
} from "lucide-react";
import { Can } from "@shared/ui";
import type { LayoutPosition } from "../../model";
import { CHAT_PERMISSIONS } from "../../model/constants";
import { Lang } from "../../lib/translations";
import { LayoutSwitcher } from "./LayoutSwitcher";

// Верхняя панель окна чата: счётчик непрочитанного, раскладка, язык и создание
// бесед. Кнопки создания скрыты без права chat.create.

interface IProps {
  isDark: boolean;
  lang?: Lang;
  langLabels?: Record<Lang, string>;
  onCycleLang?: () => void;
  layout: LayoutPosition;
  onLayoutChange: (layout: LayoutPosition) => void;
  /** Непрочитанные сообщения по всем беседам (GET /chat/counters). */
  totalUnread: number;
  onComposeOpen: () => void;
  onGroupOpen: () => void;
  isExpanded: boolean;
  onToggleExpand?: () => void;
  onRequestClose?: () => void;
}

// Блок управления едет вместе с панелью бесед, поэтому при макете «снизу» он
// оказывается под ней — граница и тень в этом случае смотрят вверх.
const getEdgeStyle = (layout: LayoutPosition, isDark: boolean) => {
  const edge = isDark
    ? "1px solid rgba(167,139,250,0.25)"
    : "1px solid rgba(124,58,237,0.3)";
  const isBelowPanel = layout === "bottom";

  return {
    borderBottom: isBelowPanel ? undefined : edge,
    borderTop: isBelowPanel ? edge : undefined,
    boxShadow: isBelowPanel
      ? "0 -4px 15px rgba(0,0,0,0.15)"
      : "0 4px 15px rgba(0,0,0,0.15)",
  };
};

export const ChatHeader = ({
  isDark,
  layout,
  onLayoutChange,
  totalUnread,
  onComposeOpen,
  onGroupOpen,
  isExpanded,
  onToggleExpand,
  onRequestClose,
}: IProps) => {
  // В макетах слева/справа блок ограничен шириной панели бесед — там группа кнопок
  // центрируется, чтобы отступы слева и справа были одинаковыми. В макетах
  // сверху/снизу блок во всю ширину экрана, и группа остаётся прижатой вправо.
  const isCentered = layout === "left" || layout === "right";

  // При центрировании счётчик едет внутрь группы кнопок: тогда группа — единственный
  // элемент строки и justify-center ставит её ровно по центру блока. Иначе счётчик
  // остаётся отдельным элементом слева, а группа прижата вправо.
  const unreadBadge =
    totalUnread > 0 ? (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="min-w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
        style={{ background: "linear-gradient(135deg,#ef4444,#f97316)" }}
      >
        {totalUnread > 99 ? "99+" : totalUnread}
      </motion.span>
    ) : null;

  return (
    <header
      className="flex-shrink-0 relative"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #2e1065, #5b21b6, #0e7490)"
          : "linear-gradient(135deg, #6d28d9, #8b5cf6, #06b6d4)",
        ...getEdgeStyle(layout, isDark),
      }}
    >
      {/* flex-wrap оставлен страховкой на нештатно узкие раскладки: перенос
          некрасив, но лучше обрезанных кнопок. */}
      <div
        className={`flex items-center flex-wrap gap-2 px-5 py-3 ${
          isCentered ? "justify-center" : "justify-between"
        }`}
      >
        {!isCentered && (
          <div className="flex items-center gap-3">{unreadBadge}</div>
        )}
        <div
          className={`flex items-center flex-wrap gap-2 ${
            isCentered ? "justify-center" : "justify-end"
          }`}
        >
          {isCentered && unreadBadge}
          <LayoutSwitcher
            layout={layout}
            onChange={onLayoutChange}
            isDark={isDark}
          />

          <Can permission={CHAT_PERMISSIONS.CREATE}>
            <button
              onClick={onComposeOpen}
              aria-label="Новый личный чат"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:bg-white/25 hover:scale-110"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>
          </Can>
          <Can permission={CHAT_PERMISSIONS.GROUP_MANAGE}>
            <button
              onClick={onGroupOpen}
              aria-label="Создать группу"
              className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-white/15 hover:scale-110 flex items-center justify-center text-white/70"
            >
              <UserPlus className="w-4.5 h-4.5" />
            </button>
          </Can>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              aria-label={
                isExpanded
                  ? "Свернуть чат в окно"
                  : "Развернуть чат на весь экран"
              }
              className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-white/15 hover:scale-110 flex items-center justify-center text-white/70"
            >
              {isExpanded ? (
                <Minimize2 className="w-4.5 h-4.5" />
              ) : (
                <Maximize2 className="w-4.5 h-4.5" />
              )}
            </button>
          )}
          {onRequestClose && (
            <button
              onClick={onRequestClose}
              aria-label="Закрыть чат"
              className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-white/20 hover:scale-110 flex items-center justify-center text-white/70"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
