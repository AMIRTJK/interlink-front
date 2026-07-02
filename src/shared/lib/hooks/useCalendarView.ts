import { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { ViewMode } from "../../../widgets/Calendar/model"; 

dayjs.extend(isoWeek);

interface UseCalendarViewProps {
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
}

export const useCalendarView = ({ currentDate, onDateChange }: UseCalendarViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const startOfWeek = useMemo(() => {
    if (viewMode === 'month') {
      return currentDate.startOf('month').startOf('isoWeek');
    }
    if (viewMode === 'week') {
      return currentDate.startOf('isoWeek');
    }
    return currentDate.startOf('day');
  }, [currentDate, viewMode]);

  const daysToShow = useMemo(() => {
    if (viewMode === 'month') {
      return Array.from({ length: 42 }, (_, i) => startOfWeek.add(i, 'day'));
    }
    if (viewMode === 'week') {
      return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    }
    return [currentDate];
  }, [startOfWeek, viewMode, currentDate]);

  const goToPrev = () => {
    if (viewMode === 'month') {
      onDateChange(currentDate.subtract(1, 'month'));
    } else if (viewMode === 'week') {
      onDateChange(currentDate.subtract(1, 'week'));
    } else {
      onDateChange(currentDate.subtract(1, 'day'));
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      onDateChange(currentDate.add(1, 'month'));
    } else if (viewMode === 'week') {
      onDateChange(currentDate.add(1, 'week'));
    } else {
      onDateChange(currentDate.add(1, 'day'));
    }
  };

  const formatDateRange = () => {
    if (viewMode === 'month') {
      const formatted = currentDate.format('MMMM YYYY');
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    if (viewMode === 'week') {
      const endOfWeek = startOfWeek.add(6, 'day');
      return `${startOfWeek.format('D')} - ${endOfWeek.format('D MMMM YYYY')} г.`;
    }
    return currentDate.format('D MMMM YYYY');
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
