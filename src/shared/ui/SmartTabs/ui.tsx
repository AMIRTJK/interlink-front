import React from 'react';

export interface ITabOption {
  key: string;
  label: string;
}

interface IProps {
  items: ITabOption[];  
  activeKey: string;         
  onChange: (key: string) => void; 
}

export const SmartTabs: React.FC<IProps> = ({ items, activeKey, onChange }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 mb-4">
      <div className="flex items-center gap-2">
        
        {items.map((tab) => {
          const isActive = activeKey === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              type="button"
              className={`
                relative px-5 py-2 rounded-xl text-sm font-semibold 
                transition-all duration-300 ease-out whitespace-nowrap
                border border-transparent select-none
                
                ${isActive 
                  ? 'bg-[#F87171] text-white shadow-[0_4px_12px_rgba(248,113,113,0.35)] scale-105' 
                  : 'bg-transparent text-gray-500 hover:bg-white hover:text-gray-800'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
        
      </div>
    </div>
  );
};