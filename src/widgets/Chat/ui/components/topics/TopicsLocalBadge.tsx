import { Info } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { TOPIC_TEXTS } from "./model";

// Пометка, что топики пока не синхронизируются с сервером: без неё пользователь
// будет искать свои топики на другом устройстве или ждать их у собеседника.

export const TopicsLocalBadge = () => (
  <Tooltip title={TOPIC_TEXTS.localHint} placement="bottomRight">
    <span
      tabIndex={0}
      aria-label={TOPIC_TEXTS.localHint}
      className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold cursor-help outline-none border bg-[rgb(var(--th-warning-rgb)/0.12)] border-[rgb(var(--th-warning-rgb)/0.35)] text-[rgb(var(--th-warning-rgb))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--th-warning-rgb)/0.5)]"
    >
      <Info className="w-3 h-3" aria-hidden />
      <span className="hidden sm:inline">{TOPIC_TEXTS.localBadge}</span>
    </span>
  </Tooltip>
);
