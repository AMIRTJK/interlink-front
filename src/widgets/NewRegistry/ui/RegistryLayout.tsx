import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutGrid, List, TrendingUp, Filter } from "lucide-react";

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
  meta: any; // { current_page, last_page, total, per_page, from, to }
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

  // --- ДАННЫЕ ИЗ API (META) ---
  // Используем данные напрямую из meta, или дефолтные значения
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const totalRecords = meta?.total || 0;
  const perPage = meta?.per_page || 15;

  // Если API отдает from/to, используем их, иначе считаем сами
  const showFrom = meta?.from || (currentPage - 1) * perPage;
  const showTo = meta?.to || showFrom + (documents?.length || 0);

  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Состояние для эффекта Ripple
  const [ripples, setRipples] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  const hasActiveFilters = Object.values(currentFilters).some((v) => !!v);

  const handleCreateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
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
          {createButtonText && (
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)",
              }}
              whileTap={{ scale: 0.97 }}
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
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
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
            <div className="flex items-center gap-1.5 text-xs text-gray-600 px-3 py-1.5 bg-gray-50 rounded-full">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-medium">
                Всего:{" "}
                <span className="text-blue-600 font-bold">{totalRecords}</span>
              </span>
            </div>

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

        <div className="flex items-center gap-2 pb-1 scrollbar-hide flex-wrap">
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
          key={activeTabId + currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col gap-6"
        >
          <SectionHeader
            activeStatusData={activeTab}
            t={{ total: "Всего", documents: "документов", shown: "Показано" }}
            currentDocuments={documents}
            startIndex={showFrom - 1}
            endIndex={showTo}
          />

          {/* --- CONTENT AREA --- */}
          <div className="flex-1 min-h-0 pr-1 m-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTabId + currentPage}
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
                {documents && documents.length > 0 ? (
                  documents.map((doc: any, idx: number) => {
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
                  })
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center h-40 text-gray-400">
                    <p>Нет документов</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* --- PAGINATION --- */}
          {lastPage > 1 && (
            <div className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <Pagination
                currentPage={currentPage}
                totalPages={lastPage}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

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

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ (Без изменений)
// ==========================================

import {
  Building2,
  FileType,
  User,
  Mail,
  Send,
  X,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

const FilterInput = ({
  value,
  onChange,
  placeholder,
  icon: Icon,
  onClear,
}: any) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative flex items-center group"
    >
      <AnimatePresence>
        {Icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute left-3 z-10"
          >
            <Icon
              className={`w-4 h-4 transition-all duration-300 ${
                isFocused
                  ? "text-white scale-110"
                  : "text-blue-200/60 group-hover:text-white"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`w-full h-10 pr-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-blue-100/50 outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 focus:border-white/40 transition-all duration-300 text-sm backdrop-blur-sm ${
          Icon ? "pl-9" : "pl-4"
        }`}
      />

      {value && onClear && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClear}
          className="absolute right-3 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
};

// --- SECTION HEADER ---
export const SectionHeader = ({
  activeStatusData,
  t,
  currentDocuments,
  startIndex,
  endIndex,
}: any) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 m-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`p-2 rounded-lg bg-gradient-to-r ${
              activeStatusData?.gradient || "from-gray-100 to-gray-200"
            }`}
          >
            {activeStatusData?.icon && (
              <div className="text-white">{activeStatusData.icon}</div>
            )}
          </motion.div>
          <div>
            <h3 className="font-semibold text-gray-900">
              <span
                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                  activeStatusData?.gradient || "from-gray-700 to-gray-900"
                }`}
              >
                {activeStatusData?.label || "Все документы"}
              </span>
            </h3>
            <p className="text-sm text-gray-500">
              {t?.total || "Всего"} {t?.documents || "документов"}:{" "}
              {currentDocuments?.length || 0} | {t?.shown || "Показано"}:{" "}
              {startIndex + 1}-{endIndex}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CARD VIEW ---
export const DocumentCard = ({
  data,
  statusData,
  index,
  onClick,
  activeStatusData,
}: any) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.1 }}
      whileHover={{ y: -4, boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.15)" }}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div
        className={`p-3 bg-gradient-to-r  ${
          activeStatusData?.gradient || "from-gray-100 to-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="p-1.5 bg-white/20 rounded-md backdrop-blur-sm">
              {statusData.icon}
            </div>
            <div className="text-xs font-medium opacity-90">ID: {data.id}</div>
          </div>
          <div className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] text-white font-medium">
            {data.created_at}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-gray-400">
            <FileType size={12} />
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Тема
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
            {data.subject}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-400">
              <Building2 size={12} />
              <span>Отправитель</span>
            </div>
            <div
              className="font-medium text-gray-700 truncate"
              title={data.sender_name}
            >
              {data.sender_name}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-gray-400">
              <User size={12} />
              <span>Исполнитель</span>
            </div>
            <div className="font-medium text-gray-700 truncate">
              {data.recipient_name ||
                data.recipients?.[0]?.user?.full_name ||
                "—"}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex gap-2">
          <div className="flex-1 bg-blue-50/50 rounded p-1.5">
            <div className="flex items-center gap-1 text-blue-500 mb-0.5">
              <Mail size={10} />
              <span className="text-[10px]">Входящий</span>
            </div>
            <div className="text-xs font-mono font-semibold text-gray-700">
              {data.reg_number || "—"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- LIST VIEW ---
export const DocumentListItem = ({
  data,
  statusData,
  index,
  onClick,
  activeStatusData,
}: any) => {
  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        x: -20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: 20,
      }}
      transition={{
        delay: index * 0.03,
        duration: 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{
        x: 4,
        boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.1)",
      }}
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 transition-all duration-300 cursor-pointer mb-2"
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Status Icon */}
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className={`flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-r  ${
              activeStatusData?.gradient || "from-gray-100 to-gray-200"
            }`}
          >
            {statusData?.icon && (
              <div className="text-white">{statusData.icon}</div>
            )}
          </motion.div>

          {/* Document Info Grid */}
          <div className="flex-1 grid grid-cols-12 gap-4 items-center min-w-0">
            {/* ID & Date */}
            <div className="col-span-2">
              <div className="text-xs text-gray-500 mb-0.5">№ {data.id}</div>
              <div className="text-xs font-medium text-gray-700">
                {data.created_at}
              </div>
            </div>

            {/* Subject */}
            <div className="col-span-3 min-w-0">
              <div className="text-xs text-gray-500 mb-0.5">Тема</div>
              <div className="text-sm font-semibold text-gray-900 truncate">
                {data.subject}
              </div>
            </div>

            {/* Sender */}
            <div className="col-span-2 min-w-0">
              <div className="text-xs text-gray-500 mb-0.5">Отправитель</div>
              <div className="text-sm text-gray-900 font-medium truncate">
                {data.sender_name || "Не указано"}
              </div>
            </div>

            {/* Executor */}
            <div className="col-span-2 min-w-0">
              <div className="text-xs text-gray-500 mb-0.5">Исполнитель</div>
              <div className="text-sm text-gray-900 font-medium truncate">
                {data.recipient_name ||
                  data.recipients?.[0]?.user?.full_name ||
                  "—"}
              </div>
            </div>

            {/* Document Numbers */}
            <div className="col-span-3 flex gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <Mail className="w-3 h-3 text-blue-500" />
                  <span className="text-xs text-gray-500">Вх.</span>
                </div>
                <div className="text-xs font-mono font-semibold text-gray-900 bg-blue-50 px-2 py-1 rounded truncate">
                  {data.reg_number || "Не указано"}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-0.5">
                  <Send className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-gray-500">Исх.</span>
                </div>
                <div className="text-xs font-mono font-semibold text-gray-900 bg-emerald-50 px-2 py-1 rounded truncate">
                  {data.outgoing_number || "Не указано"}
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r text-white  ${
                activeStatusData?.gradient || "from-gray-100 to-gray-200"
              }`}
            >
              {statusData?.label}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const FilterDrawer = ({ isOpen, onClose, filters, onApply, onReset }: any) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key: string, value: string) => {
    setLocalFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 m-0"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-[#0047AB] via-[#0052CC] to-[#0047AB] shadow-2xl z-50 overflow-hidden"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "easeInOut",
                }}
              />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between px-6 h-16 border-b border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Filter className="w-5 h-5 text-white/80" />
                </motion.div>
                <h3 className="text-white font-semibold text-lg">
                  Фильтр документов
                </h3>

                <AnimatePresence>
                  {(localFilters.incomingNumber ||
                    localFilters.outgoingNumber ||
                    localFilters.sender) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-medium"
                    >
                      Активно
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Filter Controls */}
            <div className="relative p-6 space-y-4 overflow-y-auto h-[calc(100%-8rem)]">
              <motion.div
                className="space-y-4"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.08 },
                  },
                }}
                initial="hidden"
                animate="show"
              >
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    show: { opacity: 1, x: 0 },
                  }}
                >
                  <label className="text-white/80 text-sm font-medium mb-2 block">
                    Входящий номер
                  </label>
                  <FilterInput
                    placeholder="Например: ВХ-123"
                    icon={Mail}
                    value={localFilters.incomingNumber || ""}
                    onChange={(val: string) =>
                      handleChange("incomingNumber", val)
                    }
                    onClear={() => handleChange("incomingNumber", "")}
                  />
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    show: { opacity: 1, x: 0 },
                  }}
                >
                  <label className="text-white/80 text-sm font-medium mb-2 block">
                    Исходящий номер
                  </label>
                  <FilterInput
                    placeholder="Например: ИСХ-456"
                    icon={Search}
                    value={localFilters.outgoingNumber || ""}
                    onChange={(val: string) =>
                      handleChange("outgoingNumber", val)
                    }
                    onClear={() => handleChange("outgoingNumber", "")}
                  />
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    show: { opacity: 1, x: 0 },
                  }}
                >
                  <label className="text-white/80 text-sm font-medium mb-2 block">
                    Период
                  </label>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="relative group"
                  >
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200/60 group-hover:text-white transition-colors z-10" />
                    <div className="flex items-center h-10 w-full pl-9 pr-4 bg-white/10 border border-white/20 rounded-lg text-white/50 text-xs gap-2 cursor-pointer hover:bg-white/15 hover:border-white/30 transition-all">
                      <span>С даты</span>
                      <span className="text-white/20">→</span>
                      <span>По дату</span>
                      <Calendar className="ml-auto w-4 h-4 opacity-50" />
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    show: { opacity: 1, x: 0 },
                  }}
                >
                  <label className="text-white/80 text-sm font-medium mb-2 block">
                    Отправитель
                  </label>
                  <FilterInput
                    placeholder="Название организации"
                    icon={User}
                    value={localFilters.sender || ""}
                    onChange={(val: string) => handleChange("sender", val)}
                    onClear={() => handleChange("sender", "")}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 backdrop-blur-sm bg-black/10">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setLocalFilters({});
                    onReset();
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 h-11 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 hover:border-white/30 transition-all text-sm font-medium backdrop-blur-sm"
                >
                  <motion.div
                    whileHover={{ rotate: -180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.div>
                  Сброс
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleApply}
                  className="flex-1 flex items-center justify-center gap-2 h-11 px-4 bg-white hover:bg-white/90 text-blue-600 rounded-lg font-semibold text-sm transition-all shadow-lg"
                >
                  <Filter className="w-4 h-4" />
                  Применить
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- PAGINATION (Updated) ---
const Pagination = ({ currentPage, totalPages, onPageChange, t }: any) => {
  const texts = t || { back: "Назад", forward: "Вперед" };
  const current = Number(currentPage);

  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots: (number | string)[] = [];
    let l;

    range.push(1);

    if (totalPages <= 1) return [1];

    for (let i = current - delta; i <= current + delta; i++) {
      if (i < totalPages && i > 1) {
        range.push(i);
      }
    }
    range.push(totalPages);

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }, [current, totalPages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2 py-4"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          current === 1
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 cursor-pointer"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">{texts.back}</span>
      </motion.button>

      <div className="flex items-center gap-1">
        {pages.map((page: any, index: any) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-400"
              >
                ...
              </span>
            );
          }
          const pageNum = Number(page);
          const isActive = pageNum === current;

          return (
            <motion.button
              key={pageNum}
              whileHover={{ scale: isActive ? 1 : 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {pageNum}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onPageChange(current + 1)}
        disabled={current === totalPages}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          current === totalPages
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 cursor-pointer"
        }`}
      >
        <span className="hidden sm:inline">{texts.forward}</span>
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
};
