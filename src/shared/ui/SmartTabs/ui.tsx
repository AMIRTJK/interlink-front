/**
 * Универсальный компонент переключателя вкладок (табов).
 */
import React from "react";

export interface ITabOption {
  key: string;
  label: string;
}

interface IProps {
  items: ITabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  isDarkMode?: boolean;
}

export const SmartTabs: React.FC<IProps> = ({
  items,
  activeKey,
  onChange,
  isDarkMode,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1 px-1">
      <div className="flex justify-between items-center gap-2">
        {items.map((tab) => {
          const isActive = activeKey === tab.key;

          const inactiveClass = isDarkMode
            ? "bg-transparent text-gray-400 hover:bg-gray-800 hover:text-gray-100"
            : "bg-transparent text-gray-500 hover:bg-white hover:text-gray-800";

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              type="button"
              className={`relative cursor-pointer px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ease-out whitespace-nowrap border border-transparent select-none ${
                isActive ? "bg-[#F87171] text-white scale-105" : inactiveClass
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
