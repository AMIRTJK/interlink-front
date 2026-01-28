/**
 * Карточка выбранного элемента (письмо или сотрудник) в инспекторе.
 * Отображает заголовок, подзаголовок и кнопку удаления.
 */
import React from 'react';
import { CloseOutlined } from '@ant-design/icons';

interface ISelectedCardProps {
  title: string;
  subtitle?: string;
  onRemove: () => void;
}

export const SelectedCard: React.FC<ISelectedCardProps> = ({ title, subtitle, onRemove }) => {
  return (
    <div className="group relative flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{title}</div>
        {subtitle && <div className="text-xs text-gray-400 truncate">{subtitle}</div>}
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
