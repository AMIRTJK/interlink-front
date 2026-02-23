import React from "react";
import { ISearchItem } from "../model";
import { DocPreview } from "@widgets/DocView/ui/DocPreview";

interface IProps {
  item: ISearchItem | null;
  isDarkMode?: boolean;
}

export const SearchPreviewPanel: React.FC<IProps> = ({ item, isDarkMode }) => {
  if (!item) {
    return (
      <div
        className={`flex flex-col h-full rounded-3xl border p-5 items-center justify-center ${
          isDarkMode
            ? "bg-gray-800 border-gray-700 text-gray-500"
            : "bg-gray-50 border-gray-100 text-gray-300"
        }`}
      >
        <p className="text-sm font-medium">Выберите файл для предпросмотра</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div
        className={`flex-1 rounded-3xl border overflow-hidden relative ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-100"
        }`}
      >
        <DocPreview
          fileUrl={item.previewUrl || ""}
          docName={item.title}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};
