// Общий вид элементов панели задач: всё одной высоты (36px), сегменты — как
// остальные переключатели приложения (стеклянная дорожка, активный пункт в цвете темы).
export const SEGMENT_TRACK =
  "h-9 flex items-center gap-0.5 p-1 rounded-full ui-glass-soft bg-slate-100 dark:bg-th-raised/90 border border-zinc-200 dark:border-th-high/50";
export const SEGMENT_ITEM =
  "h-full flex items-center gap-1.5 px-3 rounded-full text-xs font-semibold whitespace-nowrap border-0 cursor-pointer transition-[color] duration-150";
export const SEGMENT_ACTIVE = "bg-th-accent-600 text-white shadow-sm";
export const SEGMENT_IDLE =
  "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white";

export const FIELD =
  "h-9 flex items-center rounded-full ui-glass-soft bg-white/70 dark:bg-th-raised/90 border border-zinc-200 dark:border-th-high/50 text-xs";
