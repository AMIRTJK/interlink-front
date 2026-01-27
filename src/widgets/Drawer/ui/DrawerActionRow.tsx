import React from 'react';
import { RightOutlined } from '@ant-design/icons';
import { IActionItem } from '../model';
export const DrawerActionRow: React.FC<IActionItem> = ({ label, placeholder, icon, onClick }) => {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">
        {label}
      </div>
      
      <div 
        onClick={onClick}
        className="
          group flex items-center justify-between 
          bg-white p-4 rounded-2xl cursor-pointer 
          hover:shadow-lg hover:shadow-gray-100 
          transition-all duration-300
          border border-transparent hover:border-red-100
        "
      >
        <div className="flex items-center gap-3 text-gray-700">
          <span className="text-lg text-gray-400 group-hover:text-[#F87171] transition-colors">
            {icon}
          </span>
          <span className="font-medium text-sm text-gray-700">
            {placeholder}
          </span>
        </div>
        <RightOutlined className="text-gray-300 text-xs group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};