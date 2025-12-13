import { useCalendarView } from "@shared/lib/hooks/useCalendarView";
import type { Task } from "@features/tasks";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "./calendar.css";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";

dayjs.extend(isoWeek);

interface IProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (date: Dayjs, time: string) => void;
  currentDate: Dayjs;
  onDateChange: (date: Dayjs) => void;
}

export const WeeklyCalendar = ({
  tasks,
  onTaskClick,
  onTimeSlotClick,
  currentDate,
  onDateChange,
}: IProps) => {
  const {
    viewMode,
    setViewMode,
    daysToShow,
    goToPrev,
    goToNext,
    formatDateRange,
    isToday,
  } = useCalendarView({ currentDate, onDateChange });

  return (
    <div className="weekly-calendar">
      <CalendarHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        onPrev={goToPrev}
        onNext={goToNext}
        dateRange={formatDateRange()}
      />
      <CalendarGrid
        daysToShow={daysToShow}
        viewMode={viewMode}
        tasks={tasks}
        onTaskClick={onTaskClick}
        onTimeSlotClick={onTimeSlotClick}
        isToday={isToday}
      />
    </div>
  );
};
