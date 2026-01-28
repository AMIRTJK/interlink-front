import React from 'react';
import { FileImageOutlined, PaperClipOutlined } from '@ant-design/icons';
import { ISearchItem } from '../model';

interface IProps {
  item: ISearchItem | null;
}

export const SearchPreviewPanel: React.FC<IProps> = ({ item }) => {
  const renderPlaceholder = () => (
    <div className="text-gray-300 flex flex-col items-center gap-3">
      <div className="bg-gray-50 p-6 rounded-full">
        <FileImageOutlined style={{ fontSize: '48px' }} />
      </div>
      <p className="text-sm font-medium">Выберите файл для предпросмотра</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {item && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <PaperClipOutlined className="text-gray-400 rotate-45" />
          <span className="text-sm font-semibold text-gray-700 truncate">{item.title}</span>
        </div>
      )}
      <div className="flex-1 flex flex-col bg-gray-50 rounded-3xl border border-gray-100 p-5 overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 overflow-hidden shadow-inner uppercase text-[10px] text-gray-300">
        {item?.previewUrl ? (
          <img 
            src={item.previewUrl} 
            className="max-w-full max-h-full object-contain p-4 transition-opacity duration-300" 
            alt="document preview" 
          />
        ) : (
          renderPlaceholder()
        )}
        </div>
      </div>
    </div>
  );
};