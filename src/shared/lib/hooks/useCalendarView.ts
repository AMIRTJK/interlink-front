import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { ViewMode } from "../../../widgets/Calendar/model"; // Adjust import path if needed, or better expose ViewMode from shared if possible, but user said ViewMode is in widget model.

dayjs.extend(isoWeek);

interface UseCalendarViewProps {
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
}

export const useCalendarView = ({ currentDate, onDateChange }: UseCalendarViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  const startOfWeek = viewMode === 'month' 
    ? currentDate.startOf('month').startOf('isoWeek')
    : viewMode === 'day'
      ? currentDate
      : currentDate.startOf('isoWeek');

  const endOfWeek = viewMode === 'month'
    ? currentDate.endOf('month').endOf('isoWeek')
    : viewMode === 'day'
      ? currentDate
      : currentDate.endOf('isoWeek');

  const daysToShow = viewMode === 'day' 
    ? [currentDate]
    : viewMode === 'month'
      ? Array.from({ length: 42 }, (_, i) => startOfWeek.add(i, 'day'))
      : Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const goToPrev = () => {
    if (viewMode === 'day') onDateChange(currentDate.subtract(1, 'day'));
    else if (viewMode === 'week') onDateChange(currentDate.subtract(1, 'week'));
    else onDateChange(currentDate.subtract(1, 'month'));
  };

  const goToNext = () => {
    if (viewMode === 'day') onDateChange(currentDate.add(1, 'day'));
    else if (viewMode === 'week') onDateChange(currentDate.add(1, 'week'));
    else onDateChange(currentDate.add(1, 'month'));
  };

  const formatDateRange = () => {
    if (viewMode === 'day') return currentDate.format('D MMMM YYYY');
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
  };
};
