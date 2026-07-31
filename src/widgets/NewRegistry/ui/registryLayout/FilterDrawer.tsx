import { useState } from "react";
import locale from "antd/es/locale/ru_RU";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, RotateCcw } from "lucide-react";
import { ConfigProvider, theme } from "antd";
import { FilterField } from "./FilterField";

// --- FILTER DRAWER ---
export const FilterDrawer = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
  configItems = [],
}: any) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const glassTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorBgContainer: "rgba(255, 255, 255, 0.1)",
      colorBorder: "rgba(255, 255, 255, 0.2)",
      colorText: "#ffffff",
      colorTextPlaceholder: "rgba(255, 255, 255, 0.5)",
      controlHeight: 40,
      borderRadius: 8,
      colorPrimary: "#ffffff",
    },
    components: {
      Select: {
        selectorBg: "rgba(255, 255, 255, 0.1)",
        optionSelectedBg: "rgba(255, 255, 255, 0.2)",
      },
    },
  };

  const handleChange = (key: string, value: any) => {
    setLocalFilters((prev: any) => {
      const next = { ...prev };
      // Если значение пустое/null/undefined - удаляем ключ, чтобы Antd сбросил поле
      if (value === null || value === undefined || value === "") {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleResetClick = () => {
    setLocalFilters({});

    // Create a complete clear object with ALL possible keys set to null
    const clearedFilters: Record<string, any> = {};

    // 1. Add current local keys to be cleared
    Object.keys(localFilters).forEach((key) => {
      clearedFilters[key] = null;
    });

    // 2. Add keys from config to be absolutely sure
    configItems.forEach((item: any) => {
      clearedFilters[item.name] = null;
      if (item.rangeNames) {
        clearedFilters[item.rangeNames[0]] = null;
        clearedFilters[item.rangeNames[1]] = null;
      }
    });

    onApply(clearedFilters); // Send 'null' values to clear params
    onReset(); // Trigger standard reset (optional but good for side effects)
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 m-0"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-[#0047AB] via-[#0052CC] to-[#0047AB] shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* ... (Header и Background остаются без изменений) ... */}
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

            <div className="relative flex items-center justify-between px-6 h-16 border-b border-white/10 backdrop-blur-sm flex-shrink-0">
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
                  {Object.values(localFilters).some((v) => !!v) && (
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
                className="text-white/80 hover:text-white cursor-pointer transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Filter Controls (ANTD + DYNAMIC) */}
            <ConfigProvider theme={glassTheme} locale={locale}>
              <div className="relative p-6 space-y-4 flex-1 overflow-y-auto min-h-0">
                <motion.div
                  className="space-y-4"
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                  }}
                >
                  {configItems.map((item: any, index: number) => (
                    <FilterField
                      key={index}
                      item={item}
                      localFilters={localFilters}
                      onChange={handleChange}
                      setLocalFilters={setLocalFilters}
                    />
                  ))}
                </motion.div>
              </div>
            </ConfigProvider>

            {/* Footer Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-black/10">
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleResetClick} // Используем новую функцию сброса
                  className="flex-1 flex items-center cursor-pointer justify-center gap-2 h-11 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 hover:border-white/30 transition-all text-sm font-medium backdrop-blur-sm"
                >
                  <motion.div
                    whileHover={{ rotate: -180 }}
                    transition={{ duration: 0.5 }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </motion.div>
                  Сбросить
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleApply}
                  className="flex-1 flex items-center cursor-pointer justify-center gap-2 h-11 px-4 bg-white hover:bg-white/90 text-blue-600 rounded-lg font-semibold text-sm transition-all shadow-lg"
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
