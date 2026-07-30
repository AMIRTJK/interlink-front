import { CheckCircle } from "lucide-react";
import { THEMES } from "../designSettings";

interface IHeaderThemePopoverProps {
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
}

export const HeaderThemePopover = ({
  currentTheme,
  setCurrentTheme,
}: IHeaderThemePopoverProps) => {
  return (
    <div className="w-[260px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Выберите тему
      </p>
      <div className="space-y-2">
        {Object.entries(THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => {
              if (setCurrentTheme) {
                setCurrentTheme(key);
                localStorage.setItem("currentTheme", key);
                window.dispatchEvent(
                  new StorageEvent("storage", {
                    key: "currentTheme",
                    newValue: key,
                  }),
                );
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer ${
              currentTheme === key
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                theme.swatch || theme.gradient
              } shadow-lg flex-shrink-0`}
            />
            <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              {key}
            </span>
            {currentTheme === key && (
              <CheckCircle size={18} className="ml-auto text-emerald-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
