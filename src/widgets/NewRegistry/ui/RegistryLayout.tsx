import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutGrid, List, TrendingUp, Filter } from "lucide-react";
import {
  DocumentCard,
  DocumentListItem,
  FilterDrawer,
  Pagination,
  SectionHeader,
} from "./RegistryComponents";
import { Spin } from "antd";

// Компонент эффекта волны (Ripple)
const RippleEffect = ({ x, y }: { x: number; y: number }) => (
  <motion.span
    initial={{ scale: 0, opacity: 0.5 }}
    animate={{ scale: 2.5, opacity: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 100,
      height: 100,
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.4)",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
    }}
  />
);

interface RegistryLayoutProps {
  documents: any[];
  isLoading: boolean;
  meta: any; // { current_page, last_page, total }
  tabs: any[];
  activeTabId: string;
  createButtonText?: string;
  onTabChange: (id: string) => void;
  onPageChange: (page: number) => void;
  onFilterApply: (filters: any) => void;
  onFilterReset: () => void;
  onCardClick: (id: number) => void;
  onCreate: () => void;
  currentFilters: any;
  statusConfig: any;
}

export const RegistryLayout = ({
  documents,
  isLoading,
  meta,
  tabs,
  activeTabId,
  createButtonText,
  onTabChange,
  onPageChange,
  onFilterApply,
  onFilterReset,
  onCardClick,
  onCreate,
  currentFilters,
  statusConfig,
}: RegistryLayoutProps) => {
  const [viewMode, setViewMode] = useState<"list" | "block">("block");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // --- MOCK DATA ДЛЯ ТЕСТА ---
  // Генерируем 12 элементов на основе первого, если он есть
  const displayDocuments = useMemo(() => {
    if (!documents || documents.length === 0) return [];

    // Берем реальный документ как шаблон
    const template = documents[0];

    // Создаем 12 копий
    return Array.from({ length: 12 }).map((_, index) => ({
      ...template,
      // Генерируем уникальный ID, чтобы React keys работали корректно
      id: parseInt(`${template.id}${index}`),
      // Добавляем индекс в тему, чтобы видеть разницу визуально
      subject:
        index === 0
          ? template.subject
          : `${template.subject} (Копия ${index + 1})`,
    }));
  }, [documents]);

  // Подменяем meta для теста пагинации
  const effectiveMeta = {
    ...meta,
    last_page: 10, // Форсируем 10 страниц
    total: 120, // Форсируем кол-во записей
  };
  // ----------------------------

  // Состояние для эффекта Ripple
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const hasActiveFilters = Object.values(currentFilters).some((v) => !!v);

  // Логика создания Ripple и вызов onCreate
  const handleCreateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);

    // Удаляем ripple через время анимации
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);

    // Вызываем переданный метод создания
    onCreate();
  };

  return (
    <div
      className={`w-full h-full space-y-4 flex flex-col gap-6 overflow-hidden`}
    >
      {/* --- HEADER BLOCK --- */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 space-y-3 flex-shrink-0 m-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Create Button with Animation */}
          {createButtonText && (
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)",
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={handleCreateClick}
              className="relative cursor-pointer flex items-center gap-2 px-6 py-2 overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-sm shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
            >
              <AnimatePresence>
                {ripples.map((ripple) => (
                  <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
                ))}
              </AnimatePresence>

              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{createButtonText}</span>

              {/* Gradient animation (Shimmer) */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />
            </motion.button>
          )}

          <div className="flex items-center gap-2">
            {/* Total Counter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 px-3 py-1.5 bg-gray-50 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium">
                Всего:{" "}
                <span className="text-blue-600 font-bold">
                  {effectiveMeta.total || 0}
                </span>
              </span>
            </div>

            {/* View Switcher */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("list")}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <List size={16} />
                <span>Список</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("block")}
                className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === "block"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutGrid size={16} />
                <span>Блоки</span>
              </motion.button>
            </div>

            {/* Filter Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFilterOpen(true)}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                hasActiveFilters
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter size={16} />
              <span>Фильтры</span>
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Status Tabs (Pills) with Animation */}
        <div className="flex items-center gap-2  pb-1 scrollbar-hide flex-wrap">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                activeTabId === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-md`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span
                className={`flex items-center justify-center ${
                  activeTabId !== tab.id ? "opacity-70" : ""
                }`}
              >
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ml-1 min-w-[18px] text-center ${
                    activeTabId === tab.id
                      ? "bg-white/25 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {tab.count}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTabId + effectiveMeta.current_page}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y: -20,
          }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="flex flex-col gap-6"
        >
          <SectionHeader
            activeStatusData={activeTab}
            t={{ total: "Всего", documents: "документов", shown: "Показано" }}
            currentDocuments={displayDocuments}
            startIndex={
              (effectiveMeta.current_page - 1) * displayDocuments.length
            }
            endIndex={effectiveMeta.current_page * displayDocuments.length}
          />

          {/* --- CONTENT AREA --- */}
          <div className="flex-1  min-h-0 pr-1 m-0">
            {isLoading ? (
              <div className="w-full h-40 flex items-center justify-center text-gray-400">
                <Spin />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTabId + effectiveMeta.current_page}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={
                    viewMode === "block"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4"
                      : "space-y-2"
                  }
                >
                  {displayDocuments.map((doc: any, idx: number) => {
                    const statusData =
                      statusConfig[doc.status] || statusConfig.default;

                    const props = {
                      key: doc.id,
                      data: doc,
                      statusData,
                      index: idx,
                      onClick: () => onCardClick(doc.id),
                      activeStatusData: activeTab,
                    };

                    return viewMode === "block" ? (
                      <DocumentCard {...props} />
                    ) : (
                      <DocumentListItem {...props} />
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* --- PAGINATION --- */}
          {/* Мы используем effectiveMeta.last_page, который мы задали как 10, поэтому условие сработает */}
          {effectiveMeta.last_page > 1 && (
            <div className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <Pagination
                currentPage={effectiveMeta.current_page}
                totalPages={effectiveMeta.last_page}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* --- FILTER DRAWER --- */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={currentFilters}
        onApply={onFilterApply}
        onReset={onFilterReset}
      />
    </div>
  );
};
