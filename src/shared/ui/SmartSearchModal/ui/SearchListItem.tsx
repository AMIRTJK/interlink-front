// Update imports to include CheckCircleOutlined
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
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className={`text-base font-bold ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
            {item.title}
          </span>
          <span className="text-xs text-gray-500 font-medium mt-1">
             {item.subtitle || item.date}
          </span>
        </div>
        
        {isSelected && (
           <CheckCircleOutlined className="text-purple-500 text-xl" />
        )}
      </div>
    </div>
  );
};