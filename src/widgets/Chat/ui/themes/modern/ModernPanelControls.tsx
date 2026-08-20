import { Plus, Search, UserPlus } from "lucide-react";
import { Can } from "@shared/ui";
import type { LayoutPosition } from "../../../model";
import { CHAT_PERMISSIONS } from "../../../model/constants";
import type { Translations } from "../../../lib/translations";
import { ChatThemeMenu } from "../../components/ChatThemeMenu";
import { ModernLayoutSwitcher } from "./ModernLayoutSwitcher";

// Карточка управления панелью бесед: поиск, край панели, оформление и создание
// беседы. В макетах она всегда прилегает к списку — по обе стороны от него
// содержимое одно и то же, меняется только направление, в котором её кладут.

interface IProps {
  t: Translations;
  layout: LayoutPosition;
  onLayoutChange: (layout: LayoutPosition) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onComposeOpen: () => void;
  onGroupOpen: () => void;
}

const ROUND_BUTTON_CLASS =
  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 text-[var(--th-text-muted)] hover:text-[var(--th-text)] hover:bg-[var(--th-hover-bg)]";

export const ModernPanelControls = ({
  t,
  layout,
  onLayoutChange,
  searchQuery,
  onSearchChange,
  onComposeOpen,
  onGroupOpen,
}: IProps) => (
  <div className="chat-modern-card flex flex-col gap-3 p-3 flex-shrink-0">
    <label
      className="flex items-center gap-2 rounded-full px-3.5 py-2"
      style={{ background: "var(--chat-modern-soft)" }}
    >
      <Search className="w-4 h-4 flex-shrink-0 text-[var(--th-text-faint)]" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t.search}
        aria-label={t.search}
        className="flex-1 min-w-0 bg-transparent outline-none text-sm text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
      />
    </label>

    <div className="flex items-center justify-between gap-2 flex-wrap">
      <ModernLayoutSwitcher layout={layout} onChange={onLayoutChange} />

      <div className="flex items-center gap-1">
        <Can permission={CHAT_PERMISSIONS.CREATE}>
          <button
            type="button"
            onClick={onComposeOpen}
            aria-label={t.newMessage}
            title={t.newMessage}
            className={ROUND_BUTTON_CLASS}
          >
            <Plus className="w-4.5 h-4.5" />
          </button>
        </Can>
        <Can permission={CHAT_PERMISSIONS.GROUP_MANAGE}>
          <button
            type="button"
            onClick={onGroupOpen}
            aria-label={t.newGroup}
            title={t.newGroup}
            className={ROUND_BUTTON_CLASS}
          >
            <UserPlus className="w-4.5 h-4.5" />
          </button>
        </Can>
        <ChatThemeMenu
          t={t}
          tone="surface"
          placement={layout === "bottom" ? "top" : "bottom"}
        />
      </div>
    </div>
  </div>
);
