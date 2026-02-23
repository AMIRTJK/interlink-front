/**
 * Кнопка выбора действия в инспекторе.
 * Открывает модальное окно поиска при клике.
 */
import React from "react";
import { RightOutlined } from "@ant-design/icons";

interface IActionSelectorProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isDarkMode?: boolean;
}

export const ActionSelector: React.FC<IActionSelectorProps> = ({
  icon,
  label,
  onClick,
  isDarkMode,
}) => {
  const containerClasses = isDarkMode
    ? "border-gray-700 bg-gray-800 hover:border-[#8b5cf6] hover:bg-gray-700 hover:shadow-lg hover:shadow-purple-900/20"
    : "border-[#a78bfa] bg-white hover:border-[#8b5cf6] hover:bg-[#f5f3ff] hover:shadow-lg hover:shadow-purple-100";
  return (
    <div
      onClick={onClick}
      className={`group flex items-center justify-between p-4 rounded-2xl cursor-pointer border transition-all duration-300 ${containerClasses}`}
    >
      <div className="flex items-center gap-3 text-gray-700">
        <span
          className={`text-lg transition-colors ${
            isDarkMode
              ? "text-gray-500 group-hover:text-purple-400"
              : "text-gray-400 group-hover:text-purple-500"
          }`}
        >
          {icon}
        </span>
        <span
          className={`font-medium text-sm ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
        >
          {label}
        </span>
      </div>
      <RightOutlined
        className={`text-[10px]! transition-all! duration-300! group-hover:translate-x-1! ${
          isDarkMode ? "text-gray-500!" : "text-gray-300!"
        }`}
      />
    </div>
  );
};
