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
import { Lang, Translations } from "../../lib/translations";
import { LayoutSwitcher } from "./LayoutSwitcher";
import { ChatThemeMenu } from "./ChatThemeMenu";

// Верхняя панель окна чата: счётчик непрочитанного, раскладка, язык и создание
// бесед. Кнопки создания скрыты без права chat.create.

interface IProps {
  isDark: boolean;
  lang?: Lang;
  langLabels?: Record<Lang, string>;
  onCycleLang?: () => void;
  t: Translations;
  layout: LayoutPosition;
  onLayoutChange: (layout: LayoutPosition) => void;
  /** Непрочитанные сообщения по всем беседам (GET /chat/counters). */
  totalUnread?: number;
  onComposeOpen: () => void;
  onGroupOpen: () => void;
  isExpanded: boolean;
  onToggleExpand?: () => void;
  onRequestClose?: () => void;
}

// Блок управления едет вместе с панелью бесед, поэтому при макете «снизу» он
// оказывается под ней — граница и тень в этом случае смотрят вверх.
const getEdgeStyle = (layout: LayoutPosition) => {
  const edge = "1px solid var(--th-sidebar-border)";
  const isBelowPanel = layout === "bottom";

  // Боковой край продолжает границу панели бесед вверх: блок стоит над ней на
  // нейтральном фоне, и без него линия обрывалась бы на заголовке «Chats».
  return {
    borderBottom: isBelowPanel ? undefined : edge,
    borderTop: isBelowPanel ? edge : undefined,
    borderRight: layout === "left" ? edge : undefined,
    borderLeft: layout === "right" ? edge : undefined,
    boxShadow: isBelowPanel
      ? "0 -4px 15px rgb(var(--th-shadow-rgb) / 0.08)"
      : "0 4px 15px rgb(var(--th-shadow-rgb) / 0.08)",
  };
};

export const ChatHeader = ({
  isDark,
  t,
  layout,
  onLayoutChange,
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

  // Фон — как у панели бесед, а не заливка акцента: блок прилегает к списку,
  // и цветная полоса над нейтральным списком выглядела чужеродно. Акцент
  // остаётся только на выбранной раскладке.
  return (
    <header
      className="flex-shrink-0 relative"
      style={{
        background: "var(--th-sidebar-bg)",
        ...getEdgeStyle(layout),
      }}
    >
      {/* flex-wrap оставлен страховкой на нештатно узкие раскладки: перенос
          некрасив, но лучше обрезанных кнопок. */}
      <div
        className={`flex items-center flex-wrap gap-2 px-5 py-3 ${
          isCentered ? "justify-center" : "justify-between"
        }`}
      >
        <div
          className={`flex items-center flex-wrap gap-2 ${
            isCentered ? "justify-center" : "justify-end"
          }`}
        >
          <LayoutSwitcher
            layout={layout}
            onChange={onLayoutChange}
            isDark={isDark}
          />

          {/* Оформление стоит рядом с раскладкой: обе настройки про вид окна,
              и пользователь ищет их в одном месте. */}
          <ChatThemeMenu
            t={t}
            tone="surface"
            placement={layout === "bottom" ? "top" : "bottom"}
          />

          <Can permission={CHAT_PERMISSIONS.CREATE}>
            <button
              onClick={onComposeOpen}
              aria-label="Новый личный чат"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--th-accent-text)] bg-[var(--th-active-bg)] transition-all duration-200 ease-in-out hover:scale-110"
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>
          </Can>
          <Can permission={CHAT_PERMISSIONS.GROUP_MANAGE}>
            <button
              onClick={onGroupOpen}
              aria-label="Создать группу"
              className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-[var(--th-hover-bg)] hover:scale-110 flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text)]"
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
              className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-[var(--th-hover-bg)] hover:scale-110 flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text)]"
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
              className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-[var(--th-hover-bg)] hover:scale-110 flex items-center justify-center text-[var(--th-text-muted)] hover:text-[var(--th-text)]"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
