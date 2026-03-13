/**
 * Карточка выбранного элемента (письмо или сотрудник) в Действиях.
 * Отображает заголовок, подзаголовок и кнопку удаления.
 */
import React from "react";
import { CloseOutlined } from "@ant-design/icons";

interface ISelectedCardProps {
  title: string;
  subtitle?: string;
  onRemove: () => void;
  isDarkMode?: boolean;
}

export const SelectedCard: React.FC<ISelectedCardProps> = ({
  title,
  subtitle,
  onRemove,
  isDarkMode,
}) => {
  return (
    <div
      className={`group relative flex items-start gap-3 p-3 rounded-lg transition-all ${
        isDarkMode
          ? "bg-gray-800 hover:bg-gray-700"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-400 truncate">{subtitle}</div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
      >
        <CloseOutlined className="text-xs" />
      </button>
    </div>
  );
};
