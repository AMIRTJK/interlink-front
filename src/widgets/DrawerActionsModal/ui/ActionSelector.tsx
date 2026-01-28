/**
 * Кнопка выбора действия в инспекторе.
 * Открывает модальное окно поиска при клике.
 */
import React from 'react';
import { RightOutlined } from '@ant-design/icons';

interface IActionSelectorProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export const ActionSelector: React.FC<IActionSelectorProps> = ({ icon, label, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group flex items-center justify-between bg-white p-4 rounded-2xl cursor-pointer hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 border border-transparent hover:border-purple-100"
    >
      <div className="flex items-center gap-3 text-gray-700">
        <span className="text-lg text-gray-400 group-hover:text-purple-500 transition-colors">
          {icon}
        </span>
        <span className="font-medium text-sm text-gray-700">
          {label}
        </span>
      </div>
      <RightOutlined className="text-gray-300 text-[10px] transition-all duration-300 group-hover:translate-x-1" />
    </div>
  );
};
