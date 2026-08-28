import { Plus, Search, UserPlus } from "lucide-react";
import { Can } from "@shared/ui";
import type { LayoutPosition } from "../../../model";
import { CHAT_PERMISSIONS } from "../../../model/constants";
import type { Translations } from "../../../lib/translations";
import { ChatThemeMenu } from "../../components/ChatThemeMenu";
import { ReliefLayoutSwitcher } from "./ReliefLayoutSwitcher";

// Блок управления панелью бесед: поиск, край панели, оформление и создание
// беседы. В макетах он всегда прилегает к списку — по обе стороны от него
// содержимое одно и то же, меняется только направление, в котором его кладут.

interface IProps {
  t: Translations;
  layout: LayoutPosition;
  onLayoutChange: (layout: LayoutPosition) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onComposeOpen: () => void;
  onGroupOpen: () => void;
}

export const ReliefPanelControls = ({
  t,
  layout,
  onLayoutChange,
  searchQuery,
  onSearchChange,
  onComposeOpen,
  onGroupOpen,
}: IProps) => (
  <div className="chat-relief-panel flex flex-col gap-4 p-5 flex-shrink-0">
    <label className="chat-relief-well flex items-center gap-2 h-9 px-3 cursor-text">
      <Search className="w-4 h-4 flex-shrink-0 text-[var(--th-text-faint)]" />
      <span className="sr-only">{t.search}</span>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t.search}
        className="flex-1 min-w-0 bg-transparent outline-none text-[13px] leading-[17px] text-[var(--th-text)] placeholder:text-[var(--th-text-faint)]"
      />
    </label>

    <div className="flex items-center justify-between gap-3 flex-wrap">
      <ReliefLayoutSwitcher layout={layout} onChange={onLayoutChange} />

      <div className="flex items-center gap-3">
        <Can permission={CHAT_PERMISSIONS.CREATE}>
          <button
            type="button"
            onClick={onComposeOpen}
            aria-label={t.newMessage}
            title={t.newMessage}
            className="chat-relief-ghost w-8 h-8"
          >
            <Plus className="w-5 h-5" />
          </button>
        </Can>
        <Can permission={CHAT_PERMISSIONS.GROUP_MANAGE}>
          <button
            type="button"
            onClick={onGroupOpen}
            aria-label={t.newGroup}
            title={t.newGroup}
            className="chat-relief-ghost w-8 h-8"
          >
            <UserPlus className="w-5 h-5" />
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
