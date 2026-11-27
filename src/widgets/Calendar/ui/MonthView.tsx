import { useMemo, memo, type CSSProperties } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { MONTH_GRID_BOTTOM_RESERVE_PX } from "../model";
import { useCalendarWeather } from "../lib/useCalendarWeather";
import { useViewportFillOffset } from "../lib/useViewportFillOffset";
import { DesignedDayCell } from "./capsule-designs/DesignedDayCell";

interface IMonthViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
}

const EMPTY_TASKS: Task[] = [];

export const MonthView = memo(({
  daysToShow,
  tasks,
  currentDate,
  onDayClick,
  onEventClick,
}: IMonthViewProps) => {
  const { ref: gridRef, offset: gridOffset } = useViewportFillOffset<HTMLDivElement>(
    MONTH_GRID_BOTTOM_RESERVE_PX,
  );

  // Только дни выбранного месяца, подряд с 1-го: 4–5 рядов вместо 6 — капсулы крупнее.
  const monthDays = useMemo(
    () => daysToShow.filter((day) => day.month() === currentDate.month()),
    [daysToShow, currentDate],
  );
  const rowCount = Math.ceil(monthDays.length / 7);
  const getDayWeather = useCalendarWeather(monthDays);

  const gridStyle = useMemo(
    () =>
      ({
        "--month-rows": rowCount,
        ...(gridOffset === null ? {} : { "--month-grid-offset": `${gridOffset}px` }),
      }) as CSSProperties,
    [gridOffset, rowCount],
  );

  const tasksMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  return (
    <div className="w-full! flex! flex-col! gap-3!">
      <div
        ref={gridRef}
        style={gridStyle}
        className="grid! grid-cols-7! gap-3.5! auto-rows-[108px] lg:grid-rows-[repeat(var(--month-rows),minmax(0,1fr))] lg:h-[calc(100dvh-var(--month-grid-offset,0px))] lg:min-h-[480px]"
      >
        {monthDays.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          return (
            <DesignedDayCell
              key={dateStr}
              day={day}
              tasks={tasksMap[dateStr] ?? EMPTY_TASKS}
              weather={getDayWeather(day)}
              isToday={day.isSame(dayjs(), "day")}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
});
