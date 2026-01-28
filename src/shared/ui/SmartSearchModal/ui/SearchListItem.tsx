import React from 'react';
import { CheckCircleOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
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
        p-5 rounded-[24px] cursor-pointer transition-all border relative
        ${isSelected 
            ? 'border-[#8C52FF] bg-[rgba(167,139,250,0.12)]' 
            : isActive 
                ? 'border-gray-200 bg-gray-50'
                : 'border-gray-50 bg-white hover:bg-gray-50 hover:border-purple-200'
        }
        ${!isSelected && !isActive && 'shadow-sm'}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col min-w-0 flex-1 pr-4">
          <div className="mb-2">
            <span className={`text-[15px] leading-tight font-bold ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
              {item.title}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-[12px] text-gray-400 font-medium">
             <span className="flex items-center gap-1.5 truncate">
               <UserOutlined className="text-[10px]" />
               {item.subtitle}
             </span>
             {item.date && (
               <span className="flex items-center gap-1.5 shrink-0">
                 <ClockCircleOutlined className="text-[10px]" />
                 {item.date}
               </span>
             )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 shrink-0">
          {item.tag && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
              item.tag === 'Входящее' ? 'bg-purple-100 text-purple-600' : 
              item.tag === 'Отправленные' ? 'bg-blue-100 text-blue-600' : 
              'bg-gray-100 text-gray-600'
            }`}>
              {item.tag}
            </span>
          )}
          
          <div className="mt-auto">
            {isSelected ? (
               <CheckCircleOutlined style={{ color: '#8C52FF' }} className="text-xl" />
            ) : (
               <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};