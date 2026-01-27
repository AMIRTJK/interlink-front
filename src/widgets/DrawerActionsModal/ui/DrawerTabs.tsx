import React from 'react';
import { TABS_LIST, TTab } from '../model';

interface DrawerTabsProps {
  activeTab: TTab;
  onChange: (tab: TTab) => void;
}

export const DrawerTabs: React.FC<DrawerTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar py-1">
      {TABS_LIST.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
              ${isActive 
                ? 'bg-[#F87171] text-white shadow-md shadow-red-200' 
                : 'text-gray-500 hover:bg-gray-100 bg-transparent'}
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};