import React from 'react';
import { ISearchItem } from '../model';
import { DocPreview } from '@widgets/DocView/ui/DocPreview';

interface IProps {
  item: ISearchItem | null;
}

export const SearchPreviewPanel: React.FC<IProps> = ({ item }) => {
  if (!item) {
    return (
        <div className="flex flex-col h-full bg-gray-50 rounded-3xl border border-gray-100 p-5 items-center justify-center text-gray-300">
            <p className="text-sm font-medium">Выберите файл для предпросмотра</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 overflow-hidden relative">
        <DocPreview 
            fileUrl={item.previewUrl || ""} 
            docName={item.title}
        />
      </div>
    </div>
  );
};