import { Hash, MessagesSquare, Pencil, Trash2 } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { cn } from "@shared/lib";
import type { ITopic, TTopicId } from "../../../api/topics";
import { TOPIC_TEXTS } from "./model";

// Вкладка топика. Действия «переименовать/удалить» показываются только у
// выбранного топика: на каждой вкладке они превратили бы полосу в шум.

interface IProps {
  topic: ITopic;
  isActive: boolean;
  onSelect: (topicId: TTopicId) => void;
  onRename: (topicId: TTopicId) => void;
  onRemove: (topicId: TTopicId) => void;
}

const ACTION_CLASS =
  "w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-200 text-[var(--th-accent-text)] hover:bg-[var(--th-accent-soft-strong)]";

export const TopicTab = ({ topic, isActive, onSelect, onRename, onRemove }: IProps) => {
  const Icon = topic.is_default ? MessagesSquare : Hash;
  const canEdit = isActive && !topic.is_default;

  return (
    <div
      className={cn(
        "flex-shrink-0 flex items-center gap-0.5 rounded-full border transition-colors duration-200",
        isActive
          ? "bg-[var(--th-accent-soft)] border-[var(--th-accent-border)]"
          : "border-transparent hover:bg-[var(--th-hover-bg)]",
      )}
    >
      <button
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => onSelect(topic.id)}
        className={cn(
          "flex items-center gap-1.5 h-7 pl-3 text-xs font-medium whitespace-nowrap max-w-[12rem] outline-none rounded-full focus-visible:ring-2 focus-visible:ring-[var(--th-accent-border)]",
          canEdit ? "pr-1" : "pr-3",
          isActive ? "text-[var(--th-accent-text)]" : "text-[var(--th-text-muted)]",
        )}
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
        <span className="truncate">{topic.title}</span>
      </button>

      {canEdit && (
        <div className="flex items-center gap-0.5 pr-1.5">
          <Tooltip title={TOPIC_TEXTS.rename}>
            <button
              type="button"
              aria-label={TOPIC_TEXTS.rename}
              onClick={() => onRename(topic.id)}
              className={ACTION_CLASS}
            >
              <Pencil className="w-3 h-3" />
            </button>
          </Tooltip>
          <Tooltip title={TOPIC_TEXTS.remove}>
            <button
              type="button"
              aria-label={TOPIC_TEXTS.remove}
              onClick={() => onRemove(topic.id)}
              className={ACTION_CLASS}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
