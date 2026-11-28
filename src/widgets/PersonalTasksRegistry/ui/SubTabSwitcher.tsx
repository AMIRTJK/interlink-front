import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type TSubTab = "registry" | "analytics";

const SUB_TABS: { key: TSubTab; label: string }[] = [
  { key: "registry", label: "Реестр" },
  { key: "analytics", label: "Аналитика" },
];

// Плашка переезжает под выбранный пункт (как во вкладках профиля), а не
// перекрашивает фон кнопок: при перекраске на первом кадре оба пункта
// полуокрашены и экран выглядит так, будто тема ещё не применилась.
const PILL_TRANSITION = { type: "spring", bounce: 0.2, duration: 0.4 } as const;

const TAB_BASE =
  "relative! px-4! py-1.5! rounded-xl! text-sm! font-semibold! bg-transparent! border-0! cursor-pointer! transition-[color]! duration-150!";
const TAB_ACTIVE = "text-[var(--th-on-accent)]!";
const TAB_IDLE = "text-zinc-500! dark:text-zinc-400! hover:text-zinc-700! dark:hover:text-zinc-200!";

interface IProps {
  value: TSubTab;
  onChange: (tab: TSubTab) => void;
}

export const SubTabSwitcher = memo(({ value, onChange }: IProps) => {
  const isReducedMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      className="flex! items-center! gap-1! p-1! rounded-2xl! bg-white/40! dark:bg-th-raised/90! backdrop-blur-xl! ui-glass ui-glass--forced border! border-zinc-200! dark:border-th-high/50!"
    >
      {SUB_TABS.map(({ key, label }) => {
        const isActive = key === value;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`${TAB_BASE} ${isActive ? TAB_ACTIVE : TAB_IDLE}`}
          >
            {isActive && (
              <motion.span
                layoutId="personalTasksSubTabPill"
                transition={isReducedMotion ? { duration: 0 } : PILL_TRANSITION}
                className="absolute! inset-0! rounded-xl! bg-[rgb(var(--th-accent-rgb))]! shadow!"
              />
            )}
            <span className="relative! z-10!">{label}</span>
          </button>
        );
      })}
    </div>
  );
});
