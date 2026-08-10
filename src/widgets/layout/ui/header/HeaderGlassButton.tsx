import { Blend } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { cn, useGlassEffect } from "@shared/lib";

const BUTTON_CLASS =
  "relative flex items-center justify-center w-10 h-10 rounded-[2.5rem] backdrop-blur-xl border transition-colors cursor-pointer focus:outline-none";

const OFF_CLASS =
  "bg-white/30 dark:bg-zinc-800/30 border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50";

/* Включённое состояние берём из токенов темы, чтобы кнопка подсвечивалась тем же
   акцентом, что и остальные активные элементы выбранной темы. */
const ON_CLASS =
  "bg-[var(--th-accent-soft)] border-[var(--th-accent-border)] text-[var(--th-accent-text)] hover:bg-[var(--th-accent-soft-strong)]";

/**
 * Переключатель эффекта «стекла»: лёгкая прозрачность и размытие фона у хедера,
 * панели «Всего», списка реестра и меню корреспонденции.
 */
export const HeaderGlassButton = () => {
  const { isGlassEnabled, toggleGlass } = useGlassEffect();

  const label = isGlassEnabled
    ? "Эффект стекла включён"
    : "Эффект стекла выключен";

  return (
    <Tooltip title={label} placement="bottom">
      <button
        onClick={toggleGlass}
        aria-label={label}
        aria-pressed={isGlassEnabled}
        className={cn(BUTTON_CLASS, isGlassEnabled ? ON_CLASS : OFF_CLASS)}
      >
        <Blend size={18} strokeWidth={2.2} />
        {isGlassEnabled && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[rgb(var(--th-accent-rgb))] border-2 border-white dark:border-zinc-800"
          />
        )}
      </button>
    </Tooltip>
  );
};
