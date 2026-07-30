import React from "react";
import { Button, Empty } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { ISmartSearchModalProps, ISearchItem } from "./model";
import { SearchPreviewPanel } from "./ui/SearchPreviewPanel";
import { SearchListItem } from "./ui/SearchListItem";
import { SearchInputBar } from "./ui/SearchInputBar";
import { SelectedBadgesBar } from "./ui/SelectedBadgesBar";
import { useSmartSearchState } from "./useSmartSearchState";
import { Loader, If } from "@shared/ui";
import { motion, AnimatePresence } from "framer-motion";

export const SmartSearchUI: React.FC<ISmartSearchModalProps> = (props) => {
  const {
    placeholder = "Поиск по теме или отправителю...",
    mode = "attach",
    isDarkMode,
  } = props;

  const {
    state,
    selectedItemsMap,
    searchText,
    setSearchText,
    isSearchFocused,
    setIsSearchFocused,
    isLoading,
    displayItems,
    isExpanded,
    handleItemClick,
    handleConfirmClick,
    handleClosePreview,
    setActivePreview,
  } = useSmartSearchState(props);

  return (
    <div
      className={`smart-search-content flex flex-col h-full rounded-3xl ${
        isDarkMode ? "transparent" : "bg-gray-50/30"
      }`}
    >
      <SearchInputBar
        searchText={searchText}
        setSearchText={setSearchText}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        isDarkMode={isDarkMode}
        placeholder={placeholder}
      />

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
                  className="text-gray-400! hover:text-gray-600! transition-colors!"
                />
              </div>
              <SearchPreviewPanel
                item={state.activePreviewItem}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layout
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`flex flex-col relative ${
            isExpanded ? "w-[440px]" : "w-full"
          }`}
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
                  isDarkMode={isDarkMode}
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
          <SelectedBadgesBar
            selectedIds={state.selectedIds}
            selectedItemsMap={selectedItemsMap}
            activePreviewItem={state.activePreviewItem}
            onSelectPreview={setActivePreview}
            isDarkMode={isDarkMode}
          />
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
