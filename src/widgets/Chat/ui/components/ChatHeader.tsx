import { motion } from "framer-motion";
import {
  Languages,
  Edit3,
  Plus,
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
  lang: Lang;
  langLabels: Record<Lang, string>;
  onCycleLang: () => void;
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

export const ChatHeader = ({
  isDark,
  lang,
  langLabels,
  onCycleLang,
  layout,
  onLayoutChange,
  totalUnread,
  onComposeOpen,
  onGroupOpen,
  isExpanded,
  onToggleExpand,
  onRequestClose,
}: IProps) => (
  <header
    className="flex-shrink-0 relative"
    style={{
      background: isDark
        ? "linear-gradient(135deg, #2e1065, #5b21b6, #0e7490)"
        : "linear-gradient(135deg, #6d28d9, #8b5cf6, #06b6d4)",
      borderBottom: isDark
        ? "1px solid rgba(167,139,250,0.25)"
        : "1px solid rgba(124,58,237,0.3)",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    }}
  >
    <div className="flex items-center justify-between px-5 py-3">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
            <path
              d="M12 2C7 2 3 5.5 3 10c0 2.5 1.3 4.7 3.3 6.2L5 21l4.5-2.3c.8.2 1.6.3 2.5.3 5 0 9-3.5 9-8s-4-9-9-9z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span
          className="font-bold text-lg tracking-wider text-white"
          style={{ textShadow: "0 0 20px rgba(167,139,250,0.5)" }}
        >
          TECH
        </span>
        {totalUnread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="min-w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
            style={{ background: "linear-gradient(135deg,#ef4444,#f97316)" }}
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </motion.span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <LayoutSwitcher
          layout={layout}
          onChange={onLayoutChange}
          isDark={isDark}
        />
        <div className="w-px h-5 bg-white/15" />
        <button
          onClick={onCycleLang}
          aria-label="Сменить язык интерфейса чата"
          className="h-8 px-3 rounded-full text-white flex items-center gap-1.5 transition-all duration-200 ease-in-out hover:bg-white/20 hover:scale-105 text-xs font-bold"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <Languages className="w-4.5 h-4.5" />
          <span>{langLabels[lang]}</span>
        </button>
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
          <button
            onClick={onComposeOpen}
            aria-label="Начать переписку"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:bg-white/18 hover:scale-110"
            style={{ background: "rgba(255,255,255,0.08)" }}
          >
            <Plus className="w-4.5 h-4.5" strokeWidth={2.5} />
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
              isExpanded ? "Свернуть чат в окно" : "Развернуть чат на весь экран"
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
