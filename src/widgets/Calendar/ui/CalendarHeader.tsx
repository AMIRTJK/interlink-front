import { Button as ButtonAntd, Input } from "antd";
import type { ViewMode } from "../model";
import { Button } from "@shared/ui";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

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

  return (
    <div className="weekly-calendar__header">
      <div className="weekly-calendar__header-left">
        <Button
          onClick={onToday}
          text="Сейчас"
          type="default"
          className="bg-transparent! border-2! border-[#F5F6F7]! px-5! text-[#6B7A99]! text-[12px]! font-medium! h-full rounded-[15px]! shadow-[0_4px_10px_#26334D0D]!"
        />
        <div className="weekly-calendar__nav">
          <ButtonAntd
            onClick={onPrev}
            className="border-2! border-[#F5F6F7]! "
            type="default"
            shape="circle"
            style={{ width: 40, height: 40, padding: 0 }}
            icon={<img className="h-7 w-7" src={LeftArrow}></img>}
          />
          <p className="weekly-calendar__date-range">{dateRange}</p>
          <ButtonAntd
            onClick={onNext}
            className="border-2! border-[#F5F6F7]! "
            type="default"
            shape="circle"
            style={{ width: 40, height: 40, padding: 0 }}
            icon={<img className="h-7 w-7" src={RightArrow}></img>}
          />
        </div>
        {viewMode === 'month' && onMonthPagePrev && onMonthPageNext && (
          <div className="weekly-calendar__nav" style={{ marginLeft: '16px' }}>
            <ButtonAntd
              onClick={onMonthPagePrev}
              disabled={!canGoMonthPagePrev}
              className="border-2! border-[#F5F6F7]!"
              type="default"
              shape="circle"
              style={{ width: 40, height: 40, padding: 0 }}
              icon={<img className="h-7 w-7" src={LeftArrow}></img>}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                Дни:
              </span>
              <p className="weekly-calendar__date-range" style={{ minWidth: '50px', margin: 0 }}>
                {monthPageOffset !== undefined && totalMonthPages !== undefined
                  ? `${monthPageOffset + 1} / ${totalMonthPages}`
                  : ''}
              </p>
            </div>
            <ButtonAntd
              onClick={onMonthPageNext}
              disabled={!canGoMonthPageNext}
              className="border-2! border-[#F5F6F7]!"
              type="default"
              shape="circle"
              style={{ width: 40, height: 40, padding: 0 }}
              icon={<img className="h-7 w-7" src={RightArrow}></img>}
            />
          </div>
        )}
      </div>

      <div className="weekly-calendar__header-right">
        <div className="weekly-calendar__view-switcher">
          <ButtonAntd
            className={`h-10! ${viewMode === "week" ? "text-[#6B7A99]!" : "text-[#ADB8CC]!"}`}
            type="text"
            onClick={() => setViewMode("week")}
          >
            Неделя
          </ButtonAntd>
          <ButtonAntd
            className={`h-10! ${viewMode === "month" ? "text-[#6B7A99]!" : "text-[#ADB8CC]!"}`}
            type="text"
            onClick={() => setViewMode("month")}
          >
            Месяц
          </ButtonAntd>
          <ButtonAntd
            className={`h-10! ${viewMode === "year" ? "text-[#6B7A99]!" : "text-[#ADB8CC]!"}`}
            type="text"
            onClick={() => setViewMode("year")}
          >
            Год
          </ButtonAntd>
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
    </div>
  );
};
