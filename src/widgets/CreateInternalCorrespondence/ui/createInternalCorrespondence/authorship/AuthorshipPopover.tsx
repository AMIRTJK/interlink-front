import { If } from "@shared/ui";

import { authorshipColorOf, type IAuthorshipEntry } from "./model";
import type { IAuthorshipFragment } from "./markAuthorship";

const POPOVER_HALF_WIDTH = 150;

const formatMoment = (date: string) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EntryLine = ({ entry }: { entry: IAuthorshipEntry }) => (
  <div className="flex flex-col">
    <span className="text-[11px] font-semibold text-slate-700">
      {entry.authorName}
    </span>
    <span className="text-[10px] text-slate-400">
      Версия №{entry.versionNumber}
      {formatMoment(entry.date) ? ` • ${formatMoment(entry.date)}` : ""}
    </span>
  </div>
);

interface IProps {
  fragment: IAuthorshipFragment;
  x: number;
  y: number;
}

/**
 * Карточка «кто написал этот фрагмент». Не перехватывает мышь: иначе она
 * оказывалась бы под курсором и подсказка мигала бы.
 */
export const AuthorshipPopover = ({ fragment, x, y }: IProps) => {
  const color = authorshipColorOf(fragment.colorIndex);
  const left = Math.min(
    Math.max(x, POPOVER_HALF_WIDTH),
    window.innerWidth - POPOVER_HALF_WIDTH,
  );

  return (
    <div
      className="fixed z-[900] pointer-events-none w-[300px] rounded-xl border border-slate-200 bg-white shadow-2xl px-3.5 py-3 font-sans"
      style={{ left, top: y - 12, transform: "translate(-50%, -100%)" }}
      role="tooltip"
    >
      <div className="flex items-start gap-2.5">
        <span
          className="mt-1 w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color.dot }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 truncate">
            {fragment.current.authorName}
          </p>
          <p className="text-[10px] text-slate-500 truncate">
            {fragment.current.authorPosition}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            Добавлено в версии №{fragment.current.versionNumber}
            {formatMoment(fragment.current.date)
              ? ` • ${formatMoment(fragment.current.date)}`
              : ""}
          </p>
        </div>
      </div>

      <If is={fragment.history.length > 0}>
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ранее в этом месте
          </span>
          {fragment.history.map((entry) => (
            <EntryLine
              key={`${entry.authorId}:${entry.versionId}`}
              entry={entry}
            />
          ))}
        </div>
      </If>
    </div>
  );
};
