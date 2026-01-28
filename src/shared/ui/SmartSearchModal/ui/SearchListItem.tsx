import React from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { ISearchItem } from '../model';

interface IProps {
  item: ISearchItem;
  isSelected: boolean;
  isActive: boolean;
  onClick: (item: ISearchItem) => void;
}

export const SearchListItem: React.FC<IProps> = ({ item, isSelected, isActive, onClick }) => {
  return (
    <div
      onClick={() => onClick(item)}
      className={`
        p-4 rounded-2xl cursor-pointer transition-all border 
        ${isSelected 
            ? 'border-purple-400 bg-purple-50' 
            : isActive 
                ? 'border-gray-300 bg-gray-100'
                : 'border-transparent bg-gray-50 hover:bg-gray-100'
        }
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col min-w-0 flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-base font-bold truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
              {item.title}
            </span>
            {item.tag && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                item.tag === 'Входящее' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {item.tag}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
             <span className="truncate">{item.subtitle}</span>
             {item.date && (
               <span className="flex items-center gap-1 shrink-0">
                 <span className="text-[10px] opacity-60">🕒</span> {item.date}
               </span>
             )}
          </div>
        </div>
        
        <div className="flex items-center h-full pt-1">
          {isSelected ? (
             <CheckCircleOutlined style={{ color: '#8C52FF' }} className="text-xl" />
          ) : (
             <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
          )}
        </div>
      </div>
    </div>
  );
};