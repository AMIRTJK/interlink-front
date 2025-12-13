import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { TaskCard } from "@features/calendar";
import { ViewMode } from "../model";

interface CalendarGridProps {
  daysToShow: Dayjs[];
  viewMode: ViewMode;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (date: Dayjs, time: string) => void;
  isToday: (date: Dayjs) => boolean;
}

export const CalendarGrid = ({
  daysToShow,
  viewMode,
  tasks,
  onTaskClick,
  onTimeSlotClick,
  isToday,
}: CalendarGridProps) => {
  const getTasksForDay = (day: Dayjs) => {
    return tasks.filter((task) => dayjs(task.date).isSame(day, "day"));
  };

  const getCurrentTimePosition = () => {
    const now = dayjs();
    const hours = now.hour();
    const minutes = now.minute();
    return hours + minutes / 60;
  };

  const handleTimeSlotClick = (day: Dayjs, hour: number) => {
    if (onTimeSlotClick) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      onTimeSlotClick(day, time);
    }
  };

  const currentTimePosition = getCurrentTimePosition();
  const showTimeLine = daysToShow.some((day) => isToday(day));

  return (
    <div className="weekly-calendar__grid">
      <div className="weekly-calendar__time-column">
        <div className="weekly-calendar__time-header">Сейчас</div>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="weekly-calendar__time-slot">
            {i.toString().padStart(2, "0")}
          </div>
        ))}
      </div>
      <div className={`weekly-calendar__days ${viewMode}`}>
        {daysToShow.map((day) => (
          <div
            key={day.format("YYYY-MM-DD")}
            className={`weekly-calendar__day-column ${
              isToday(day) ? "weekly-calendar__day-column--today" : ""
            }`}
          >
            <div className="weekly-calendar__day-header">
              <div className="weekly-calendar__day-name">
                {day.format("dddd DD")}
              </div>
            </div>
            <div className="weekly-calendar__day-content">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="weekly-calendar__hour-line"
                  style={{ top: `${i * 60}px` }}
                  onClick={() => handleTimeSlotClick(day, i)}
                />
              ))}
              {showTimeLine && isToday(day) && (
                <div
                  className="weekly-calendar__current-time-line"
                  style={{ top: `${currentTimePosition * 60}px` }}
                />
              )}
              {getTasksForDay(day).map((task, index) => {
                const taskHour = parseInt(task.time.split(":")[0]);
                const taskMinute = parseInt(task.time.split(":")[1]);
                const topPosition = (taskHour + taskMinute / 60) * 60;

                const leftOffset = Math.min(index * 15, 60);
                const width = `calc(100% - ${leftOffset}px)`;

                return (
                  <div
                    key={task.id}
                    className="weekly-calendar__task-wrapper"
                    style={{
                      top: `${topPosition}px`,
                      left: `${leftOffset}px`,
                      width: width,
                      zIndex: 10 + index,
                    }}
                  >
                    <TaskCard task={task} onClick={() => onTaskClick?.(task)} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
