import React, { useState, useMemo } from "react";
import { Input, Button, Empty } from "antd";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { ISmartSearchModalProps, ISelectionState, ISearchItem } from "./model";
import { SearchPreviewPanel } from "./ui/SearchPreviewPanel";
import { SearchListItem } from "./ui/SearchListItem";
import { useGetQuery } from "@shared/lib/hooks";
import { Loader, If } from "@shared/ui";
import { motion, AnimatePresence } from "framer-motion";

export const SmartSearchUI: React.FC<ISmartSearchModalProps> = ({
  placeholder = "Поиск по теме или отправителю...",
  items = [],
  querySettings,
  transformResponse,
  onConfirm,
  multiple = true,
  mode = "attach",
}) => {
  const [state, setState] = useState<ISelectionState>({
    selectedIds: [],
    activePreviewItem: null,
  });
  const [selectedItemsMap, setSelectedItemsMap] = useState<
    Record<string, ISearchItem>
  >({});
  const [searchText, setSearchText] = useState("");
  const { data: fetchedData, isLoading } = useGetQuery<any, any>({
    url: querySettings?.url,
    params: {
      ...querySettings?.params,
      ...(mode === "attach"
        ? { subject: searchText, sender_name: searchText }
        : { search: searchText }), // Для поиска людей теперь используем один ключ search
      page: 1,
      per_page: 50,
    },
    options: {
      enabled: !!querySettings?.url,
    },
  });

  const displayItems = useMemo(() => {
    if (!querySettings?.url) return items;
    let rawItems: any[] = [];
    if (Array.isArray(fetchedData)) {
      rawItems = fetchedData;
    } else if (fetchedData) {
      const data = fetchedData as any;
      if (Array.isArray(data.items)) rawItems = data.items;
      else if (Array.isArray(data.data)) rawItems = data.data;
      else if (data.data && Array.isArray(data.data.items))
        rawItems = data.data.items;
      else if (data.data && Array.isArray(data.data.data))
        rawItems = data.data.data;
    }

    if (transformResponse) {
      return transformResponse(rawItems);
    }
    return rawItems;
  }, [querySettings?.url, fetchedData, items, transformResponse]);

  const isExpanded = mode === "attach" && !!state.activePreviewItem;

  const handleItemClick = (item: ISearchItem) => {
    setSelectedItemsMap((prev) => {
      const newMap = { ...prev };
      if (!multiple) {
        return newMap[item.id] ? {} : { [item.id]: item };
      }
      if (newMap[item.id]) {
        delete newMap[item.id];
      } else {
        newMap[item.id] = item;
      }
      return newMap;
    });

    setState((prev) => {
      let newSelectedIds = prev.selectedIds;

      if (multiple) {
        const isSelected = prev.selectedIds.includes(item.id);
        if (!isSelected && prev.selectedIds.length >= 3) {
          return prev;
        }
        newSelectedIds = isSelected
          ? prev.selectedIds.filter((id) => id !== item.id)
          : [...prev.selectedIds, item.id];
      } else {
        newSelectedIds = prev.selectedIds.includes(item.id) ? [] : [item.id];
      }

      return {
        ...prev,
        activePreviewItem: mode === "attach" ? item : null,
        selectedIds: newSelectedIds,
      };
    });
  };

  const handleConfirmClick = () => {
    const selectedItems = state.selectedIds
      .map((id) => selectedItemsMap[id])
      .filter(Boolean);
    onConfirm(state.selectedIds, selectedItems);
  };

  const handleClosePreview = () => {
    setState((prev) => ({ ...prev, activePreviewItem: null }));
  };

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div className="smart-search-content flex flex-col h-full bg-gray-50/30 rounded-3xl">
      <div className="py-4 w-full transition-all duration-300 ease-out transform">
        <Input
          size="large"
          placeholder="Поиск..."
          prefix={
            <SearchOutlined
              className={`text-lg mr-2 transition-colors duration-300 ${isSearchFocused ? "text-blue-600" : "text-gray-400"}`}
            />
          }
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={`w-full h-12 rounded-2xl border text-base shadow-sm transition-all duration-300 ${isSearchFocused ? "border-blue-500 shadow-lg shadow-blue-500/15" : "border-gray-200 hover:border-blue-300"}`}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <div className="flex min-h-0 gap-3 mb-6 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <motion.div
              key="preview-panel"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex-1 flex flex-col min-w-0"
            >
              <div className="flex items-center justify-end mb-1">
                <Button
                  icon={<CloseOutlined />}
                  type="text"
                  onClick={handleClosePreview}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                />
              </div>
              <SearchPreviewPanel item={state.activePreviewItem} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`
                flex flex-col relative
                ${isExpanded ? "w-[440px]" : "w-full"}
            `}
        >
          <If is={isLoading}>
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-[24px] overflow-hidden">
              <Loader />
            </div>
          </If>

          <div className="flex-1 overflow-y-auto flex flex-col gap-3 custom-scrollbar pr-1">
            {displayItems.length === 0 && !isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Empty description="Нет данных" />
              </div>
            ) : (
              displayItems.map((item: ISearchItem) => (
                <SearchListItem
                  key={item.id}
                  item={item}
                  isActive={state.activePreviewItem?.id === item.id}
                  isSelected={state.selectedIds.includes(item.id)}
                  onClick={handleItemClick}
                />
              ))
            )}
          </div>
        </motion.div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-gray-400 text-sm font-medium whitespace-nowrap">
          Выбрано:{" "}
          <span className="text-[#8C52FF] ml-1">
            {state.selectedIds.length}
          </span>
        </div>

        <If is={mode === "attach" && state.selectedIds.length > 0}>
          <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
            {state.selectedIds.map((id) => {
              const item = selectedItemsMap[id];
              if (!item) return null;
              const isActive = state.activePreviewItem?.id === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setState((prev) => ({ ...prev, activePreviewItem: item }))
                  }
                  className={`
                                px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border outline-none
                                ${
                                  isActive
                                    ? "bg-[#8C52FF] text-white border-[#8C52FF] shadow-sm"
                                    : "bg-white text-gray-500 border-gray-100 hover:border-purple-200"
                                }
                            `}
                >
                  {item.title || "Без названия"}
                </button>
              );
            })}
          </div>
        </If>

        <If is={!(mode === "attach" && state.selectedIds.length > 0)}>
          <div className="flex-1" />
        </If>

        <Button
          size="large"
          disabled={state.selectedIds.length === 0}
          onClick={handleConfirmClick}
          className=" bg-[#8C52FF]! text-white! border-none! hover:bg-[#7a3eff]!"
        >
          Готово
        </Button>
      </div>
    </div>
  );
};
