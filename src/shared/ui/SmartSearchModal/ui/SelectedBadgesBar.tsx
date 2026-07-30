import type { ISearchItem } from "../model";

interface ISelectedBadgesBarProps {
  selectedIds: string[];
  selectedItemsMap: Record<string, ISearchItem>;
  activePreviewItem: ISearchItem | null;
  onSelectPreview: (item: ISearchItem) => void;
  isDarkMode?: boolean;
}

export const SelectedBadgesBar = ({
  selectedIds,
  selectedItemsMap,
  activePreviewItem,
  onSelectPreview,
  isDarkMode,
}: ISelectedBadgesBarProps) => {
  return (
    <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
      {selectedIds.map((id) => {
        const item = selectedItemsMap[id];
        if (!item) return null;
        const isActive = activePreviewItem?.id === id;

        const activeClass =
          "bg-[#8C52FF] text-white border-[#8C52FF] shadow-sm";
        const inactiveClass = isDarkMode
          ? "bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-500"
          : "bg-white text-gray-500 border-gray-100 hover:border-purple-200";

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectPreview(item)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border outline-none ${
              isActive ? activeClass : inactiveClass
            }`}
          >
            {item.title || "Без названия"}
          </button>
        );
      })}
    </div>
  );
};
