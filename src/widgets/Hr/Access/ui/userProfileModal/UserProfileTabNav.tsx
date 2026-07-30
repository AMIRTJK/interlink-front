import { motion } from "framer-motion";
import type { TTab } from "./userProfileModalModel";

interface IProps {
  tab: TTab;
  onTabChange: (tab: TTab) => void;
}

export function UserProfileTabNav({ tab, onTabChange }: IProps) {
  const tabs: { key: TTab; label: string }[] = [
    { key: "profile", label: "Профиль" },
    { key: "permissions", label: "Права доступа" },
    { key: "sessions", label: "Сессии" },
    { key: "history", label: "История" },
  ];

  return (
    <div className="px-6 pt-3 border-b border-slate-100">
      <div className="flex items-center gap-6">
        {tabs.map(({ key, label }) => {
          const isActive = tab === key;
          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`relative pb-3 text-sm font-semibold transition-colors cursor-pointer select-none outline-none! focus:outline-none! border border-transparent ${
                isActive
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span>{label}</span>
              {isActive && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full origin-left"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
