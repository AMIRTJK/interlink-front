import { Input } from "antd";
import type { ViewMode } from "../model";
import { Button } from "@shared/ui";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import LeftArrow from "../../../assets/icons/left-arrow.svg";
import RightArrow from "../../../assets/icons/right-arrow.svg";

interface CalendarHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  dateRange: string;
  onToday: () => void;
  search?: string;
  onSearch?: (value: string) => void;
  // Month pagination
  onMonthPagePrev?: () => void;
  onMonthPageNext?: () => void;
  canGoMonthPagePrev?: boolean;
  canGoMonthPageNext?: boolean;
  monthPageOffset?: number;
  totalMonthPages?: number;
}

/**
 * Компонент CalendarHeader отвечает за верхнюю панель управления календарем.
 */
export const CalendarHeader = ({
  viewMode,
  setViewMode,
  onPrev,
  onNext,
  dateRange,
  onToday,
  search = "",
  onSearch,
  onMonthPagePrev,
  onMonthPageNext,
  canGoMonthPagePrev,
  canGoMonthPageNext,
  monthPageOffset,
  totalMonthPages,
}: CalendarHeaderProps) => {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch?.(localSearch);
    }, 500);

    return () => clearTimeout(handler);
  }, [localSearch, onSearch]);

  const VIEW_MODES: { key: ViewMode; label: string }[] = [
    { key: "week", label: "Неделя" },
    { key: "month", label: "Месяц" },
    { key: "year", label: "Год" },
  ];

  return (
    <motion.div
      className="weekly-calendar__header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="weekly-calendar__header-left">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onToday}
            text="Сегодня"
            type="default"
            className="rounded-[12px]! h-[40px]! px-6! border-rgba(226, 232, 240, 0.8)! bg-white/60! backdrop-filter! blur-sm! hover:bg-white! transition-all!"
          />
        </motion.div>

        <div className="weekly-calendar__nav">
          <motion.button
            whileHover={{ x: -2, backgroundColor: "rgba(0,0,0,0.03)" }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrev}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
          >
            <img className="h-5 w-5 opacity-60" src={LeftArrow} alt="Назад" />
          </motion.button>

          <AnimatePresence mode="wait">
            <motion.p
              key={dateRange}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="weekly-calendar__date-range"
            >
              {dateRange}
            </motion.p>
          </AnimatePresence>

          <motion.button
            whileHover={{ x: 2, backgroundColor: "rgba(0,0,0,0.03)" }}
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
          >
            <img className="h-5 w-5 opacity-60" src={RightArrow} alt="Вперед" />
          </motion.button>
        </div>

        {/* Пагинация по дням (режим «Месяц») */}
        {viewMode === 'month' && onMonthPagePrev && onMonthPageNext && (
          <div className="weekly-calendar__nav ml-4">
            <motion.button
              whileHover={{ x: -2, backgroundColor: "rgba(0,0,0,0.03)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onMonthPagePrev}
              disabled={!canGoMonthPagePrev}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <img className="h-4 w-4 opacity-50" src={LeftArrow} alt="Назад" />
            </motion.button>
            <div className="flex items-center gap-2 min-w-[80px] justify-center">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Дни:</span>
              <p className="text-[12px] font-semibold text-[#1e293b] m-0">
                {monthPageOffset !== undefined && totalMonthPages !== undefined
                  ? `${monthPageOffset + 1}/${totalMonthPages}`
                  : ''}
              </p>
            </div>
            <motion.button
              whileHover={{ x: 2, backgroundColor: "rgba(0,0,0,0.03)" }}
              whileTap={{ scale: 0.9 }}
              onClick={onMonthPageNext}
              disabled={!canGoMonthPageNext}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <img className="h-4 w-4 opacity-50" src={RightArrow} alt="Вперед" />
            </motion.button>
          </div>
        )}
      </div>

      <div className="weekly-calendar__header-right">
        <div className="weekly-calendar__view-switcher">
          {VIEW_MODES.map(({ key, label }) => (
            <motion.button
              key={key}
              onClick={() => setViewMode(key)}
              className={`relative px-6 h-full text-[13px] font-semibold transition-colors ${
                viewMode === key ? "text-[#6C63FF]" : "text-[#94A3B8] hover:text-[#64748b]"
              }`}
            >
              {viewMode === key && (
                <motion.div
                  layoutId="switcher-pill"
                  className="absolute inset-0 bg-white rounded-[18px] shadow-sm z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </motion.button>
          ))}
        </div>

        <div className="weekly-calendar__search">
          <Input
            placeholder="Поиск событий..."
            prefix={<SearchOutlined className="text-[#94A3B8]" />}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="weekly-calendar__search-input"
            allowClear
          />
        </div>
      </div>
    </motion.div>
  );
};
