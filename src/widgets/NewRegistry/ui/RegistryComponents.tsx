import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  FileType,
  User,
  Mail,
  Send,
  X,
  RotateCcw,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from "lucide-react";

// --- Вспомогательный компонент для инпута в фильтре ---
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

// --- CARD VIEW ---
export const DocumentCard = ({ data, statusData, index, onClick }: any) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.15)" }}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className={`p-3 bg-gradient-to-r ${statusData.gradient}`}>
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
          {/* <div className="flex-1 bg-emerald-50/50 rounded p-1.5">...</div> */}
        </div>
      </div>
    </motion.div>
  );
};

// --- LIST VIEW ---
export const DocumentListItem = ({ data, statusData, index, onClick }: any) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
    >
      <div
        className={`p-2 rounded-lg bg-gradient-to-br flex-shrink-0 text-white shadow-sm ${statusData.gradient}`}
      >
        {statusData.icon}
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-1 text-xs text-gray-500">#{data.id}</div>
        <div className="col-span-2 text-xs font-medium">{data.created_at}</div>
        <div className="col-span-4 font-semibold text-sm text-gray-800 truncate">
          {data.subject}
        </div>
        <div className="col-span-3 text-xs text-gray-600 truncate">
          {data.sender_name}
        </div>
        <div className="col-span-2">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] text-white bg-gradient-to-r ${statusData.gradient}`}
          >
            {statusData.label}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// --- FILTER DRAWER ---
export const FilterDrawer = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: any) => {
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
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

// --- PAGINATION ---
export const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {
  return (
    <div className="flex justify-center items-center gap-2">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-gray-600">
        Страница {currentPage} из {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
