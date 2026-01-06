import { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { ViewMode } from "../../../widgets/Calendar/model"; 
dayjs.extend(isoWeek);
interface UseCalendarViewProps {
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
}
const DAYS_PER_PAGE = 7;
export const useCalendarView = ({ currentDate, onDateChange }: UseCalendarViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [monthPageOffset, setMonthPageOffset] = useState(0);
  const [prevDate, setPrevDate] = useState(currentDate);
  const [prevViewMode, setPrevViewMode] = useState(viewMode);
  if (!currentDate.isSame(prevDate, 'day') || viewMode !== prevViewMode) {
    setPrevDate(currentDate);
    setPrevViewMode(viewMode);
    
    if (viewMode === 'month') {
      const start = currentDate.startOf('month').startOf('isoWeek');
      const allDays = Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
      const dateIndex = allDays.findIndex(day => day.isSame(currentDate, 'day'));
      const targetPage = dateIndex >= 0 ? Math.floor(dateIndex / DAYS_PER_PAGE) : 0;
      setMonthPageOffset(targetPage);
    } else {
      setMonthPageOffset(0);
    }
  }
  const allMonthDays = useMemo(() => {
    const start = currentDate.startOf('month').startOf('isoWeek');
    return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'));
  }, [currentDate]);

  const startOfWeek = viewMode === 'month' 
    ? currentDate.startOf('month').startOf('isoWeek')
    : viewMode === 'year'
      ? currentDate.startOf('year')
      : currentDate.startOf('isoWeek');

  const endOfWeek = viewMode === 'month'
    ? currentDate.endOf('month').endOf('isoWeek')
    : viewMode === 'year'
      ? currentDate.endOf('year')
      : currentDate.endOf('isoWeek');

  const totalMonthPages = Math.ceil(allMonthDays.length / DAYS_PER_PAGE);

  const paginatedMonthDays = viewMode === 'month'
    ? allMonthDays.slice(monthPageOffset * DAYS_PER_PAGE, (monthPageOffset + 1) * DAYS_PER_PAGE)
    : [];

  const daysToShow = viewMode === 'year' 
    ? Array.from({ length: 12 }, (_, i) => currentDate.startOf('year').add(i, 'month'))
    : viewMode === 'month'
      ? paginatedMonthDays
      : Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const goToPrev = () => {
    if (viewMode === 'year') onDateChange(currentDate.subtract(1, 'year'));
    else if (viewMode === 'week') onDateChange(currentDate.subtract(1, 'week'));
    else onDateChange(currentDate.subtract(1, 'month'));
  };

  const goToNext = () => {
    if (viewMode === 'year') onDateChange(currentDate.add(1, 'year'));
    else if (viewMode === 'week') onDateChange(currentDate.add(1, 'week'));
    else onDateChange(currentDate.add(1, 'month'));
  };

  const goToMonthPagePrev = () => {
    if (monthPageOffset > 0) {
      setMonthPageOffset(monthPageOffset - 1);
    }
  };

  const goToMonthPageNext = () => {
    if (monthPageOffset < totalMonthPages - 1) {
      setMonthPageOffset(monthPageOffset + 1);
    }
  };

  const formatDateRange = () => {
    if (viewMode === 'year') return currentDate.format('YYYY');
    if (viewMode === 'month') return currentDate.format('MMMM YYYY');
    return `${startOfWeek.format('D')} - ${endOfWeek.format('D MMMM YYYY')} г.`;
  };

  const isToday = (day: Dayjs) => day.isSame(dayjs(), 'day');

  return {
    viewMode,
    setViewMode,
    daysToShow,
    goToPrev,
    goToNext,
    formatDateRange,
    isToday,
    monthPageOffset,
    totalMonthPages,
    goToMonthPagePrev,
    goToMonthPageNext,
    canGoMonthPagePrev: monthPageOffset > 0,
    canGoMonthPageNext: monthPageOffset < totalMonthPages - 1,
  };
};
