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
 * Включает в себя кнопку "Сегодня", навигацию по датам (стрелки),
 * отображение текущего диапазона и переключатель видов (Неделя, Месяц, Год),
 * а также поле серверного поиска.
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
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Левая часть: Today + навигация */}
      <div className="weekly-calendar__header-left">
        <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}>
          <Button
            onClick={onToday}
            text="Сейчас"
            type="default"
            className="bg-transparent! border-2! border-[#F5F6F7]! px-5! text-[#6B7A99]! text-[12px]! font-medium! h-full rounded-[15px]! shadow-[0_4px_10px_#26334D0D]!"
          />
        </motion.div>

        <div className="weekly-calendar__nav">
          {/* Кнопка «Назад» */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08, backgroundColor: "rgba(108,99,255,0.08)" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={onPrev}
            aria-label="Предыдущий период"
            className="weekly-calendar__nav-btn"
          >
            <img className="h-7 w-7" src={LeftArrow} alt="Назад" />
          </motion.button>

          {/* Анимированный диапазон дат */}
          <AnimatePresence mode="wait">
            <motion.p
              key={dateRange}
              className="weekly-calendar__date-range"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {dateRange}
            </motion.p>
          </AnimatePresence>

          {/* Кнопка «Вперёд» */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.08, backgroundColor: "rgba(108,99,255,0.08)" }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={onNext}
            aria-label="Следующий период"
            className="weekly-calendar__nav-btn"
          >
            <img className="h-7 w-7" src={RightArrow} alt="Вперед" />
          </motion.button>
        </div>

        {/* Пагинация по дням (режим «Месяц») */}
        {viewMode === 'month' && onMonthPagePrev && onMonthPageNext && (
          <div className="weekly-calendar__nav" style={{ marginLeft: '16px' }}>
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              onClick={onMonthPagePrev}
              disabled={!canGoMonthPagePrev}
              aria-label="Предыдущая страница дней"
              className="weekly-calendar__nav-btn"
            >
              <img className="h-7 w-7" src={LeftArrow} alt="Назад" />
            </motion.button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Дни:</span>
              <p className="weekly-calendar__date-range" style={{ minWidth: '50px', margin: 0 }}>
                {monthPageOffset !== undefined && totalMonthPages !== undefined
                  ? `${monthPageOffset + 1} / ${totalMonthPages}`
                  : ''}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.08 }}
              onClick={onMonthPageNext}
              disabled={!canGoMonthPageNext}
              aria-label="Следующая страница дней"
              className="weekly-calendar__nav-btn"
            >
              <img className="h-7 w-7" src={RightArrow} alt="Вперед" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Правая часть: переключатель вида + поиск */}
      <div className="weekly-calendar__header-right">
        {/* Pill-переключатель */}
        <div className="weekly-calendar__view-switcher">
          {VIEW_MODES.map(({ key, label }) => (
            <motion.button
              key={key}
              onClick={() => setViewMode(key)}
              className={`weekly-calendar__view-btn ${viewMode === key ? 'weekly-calendar__view-btn--active' : ''}`}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              {viewMode === key && (
                <motion.span
                  layoutId="view-indicator"
                  className="weekly-calendar__view-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="weekly-calendar__view-btn-label">{label}</span>
            </motion.button>
          ))}
        </div>

        <div className="weekly-calendar__search">
          <Input
            placeholder="Поиск событий..."
            prefix={<SearchOutlined style={{ color: "#ADB8CC" }} />}
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
