import { PRIORITY_OPTIONS } from "../model/constants";

interface IProps {
  breakdown: Record<string, number>;
}

/**
 * Распределение задач по приоритетам: одна полоса, где ширина сегмента равна доле,
 * и легенда с числами. Раньше это были четыре плашки произвольной ширины, которые
 * выглядели как кнопки, хотя ничего не делали.
 */
export const PriorityBreakdownBar = ({ breakdown }: IProps) => {
  const items = PRIORITY_OPTIONS.map((option) => ({
    ...option,
    count: breakdown[option.value] || 0,
  }));
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const getPct = (count: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <div className="ui-glass flex flex-col gap-2.5 md:flex-row md:items-center md:gap-5 rounded-2xl border border-zinc-200 dark:border-th-high/50 bg-white/70 dark:bg-th-raised/90 px-4 py-3">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Приоритеты
      </span>

      <div
        className="flex h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70 dark:bg-th-high/60"
        role="img"
        aria-label={items.map((item) => `${item.label} ${getPct(item.count)}%`).join(", ")}
      >
        {items.map((item) =>
          item.count > 0 ? (
            <span key={item.value} className={item.dotBg} style={{ width: `${getPct(item.count)}%` }} />
          ) : null,
        )}
      </div>

      <ul className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {items.map((item) => (
          <li key={item.value} className="flex items-center gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${item.dotBg}`} />
            <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
            <span className="font-bold tabular-nums text-slate-800 dark:text-slate-100">{item.count}</span>
            <span className="tabular-nums text-slate-400 dark:text-slate-500">{getPct(item.count)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
