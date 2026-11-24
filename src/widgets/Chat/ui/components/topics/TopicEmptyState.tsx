import { Hash } from "lucide-react";
import { TOPIC_TEXTS } from "./model";

// Пустой топик объясняет, что сообщения из него не смешиваются с остальной
// перепиской, — иначе пустая лента выглядит как пропавшая история.

interface IProps {
  title: string;
}

export const TopicEmptyState = ({ title }: IProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-2">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[var(--th-accent-soft)] text-[var(--th-accent-text)]">
      <Hash className="w-6 h-6" aria-hidden />
    </div>
    <p className="text-sm font-medium text-[var(--th-text-muted)]">{TOPIC_TEXTS.emptyTitle(title)}</p>
    <p className="text-xs text-[var(--th-text-faint)]">{TOPIC_TEXTS.emptyHint}</p>
  </div>
);
