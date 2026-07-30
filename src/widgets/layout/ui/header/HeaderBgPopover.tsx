import { CheckCircle } from "lucide-react";
import { BACKGROUNDS } from "../designSettings";

interface IHeaderBgPopoverProps {
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  isDarkMode: boolean;
}

export const HeaderBgPopover = ({
  currentBg,
  setCurrentBg,
  isDarkMode,
}: IHeaderBgPopoverProps) => {
  return (
    <div className="w-[260px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Фон страницы
      </p>
      <div className="space-y-2">
        {Object.entries(BACKGROUNDS).map(([key, bg]) => (
          <button
            key={key}
            onClick={() => {
              if (setCurrentBg) {
                setCurrentBg(key);
                localStorage.setItem("currentBg", key);
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer ${
              currentBg === key
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                isDarkMode ? bg.dark : bg.light
              } border border-zinc-200 dark:border-zinc-700 flex-shrink-0 shadow-sm`}
            />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {bg.name}
            </span>
            {currentBg === key && (
              <CheckCircle size={18} className="ml-auto text-emerald-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
