import { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { getEventStyle, getDayWeather } from "../model";
import { WeatherIcon } from "./WeatherIcon";

interface IMonthViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
}

const WEEKDAYS = [
  { label: "MON", isWeekend: false },
  { label: "TUE", isWeekend: false },
  { label: "WED", isWeekend: false },
  { label: "THU", isWeekend: false },
  { label: "FRI", isWeekend: false },
  { label: "SAT", isWeekend: true },
  { label: "SUN", isWeekend: true },
];

export const MonthView = memo(({
  daysToShow,
  tasks,
  currentDate,
  onDayClick,
  onEventClick,
}: IMonthViewProps) => {
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
      {/* Header Weekdays */}
      <div className="grid! grid-cols-7! gap-3! text-center!">
        {WEEKDAYS.map((day) => (
          <div
            key={day.label}
            className={`py-2! text-xs! font-black! tracking-wider! transition-all! flex! items-center! justify-center! ${
              day.isWeekend
                ? "border! border-[#fde68a]! bg-[#fffbeb]! dark:bg-amber-950/40! text-[#d97706]! dark:text-amber-400! rounded-2xl!"
                : "text-slate-400! dark:text-slate-500!"
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* Grid of Days */}
      <div className="grid! grid-cols-7! gap-3! auto-rows-[105px]">
        {daysToShow.map((day, idx) => {
          const dateStr = day.format("YYYY-MM-DD");
          const dayTasks = tasksMap[dateStr] || [];
          const inMonth = day.month() === currentDate.month();
          const isToday = day.isSame(dayjs(), "day");
          const isWeekend = idx % 7 === 5 || idx % 7 === 6;
          const weather = getDayWeather(day);

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(day)}
              className={`flex! flex-col! p-2.5! rounded-[1.5rem]! cursor-pointer! transition-all! duration-200! overflow-hidden! ${
                isWeekend
                  ? "bg-[#fffdf7]! dark:bg-amber-950/20! border! border-[#fde68a]/60! shadow-[0_10px_28px_rgba(245,158,11,0.06)]!"
                  : "bg-white! dark:bg-slate-900/90! border! border-slate-100/90! dark:border-slate-800! shadow-[0_10px_30px_rgba(147,51,234,0.08)]! hover:shadow-[0_14px_35px_rgba(147,51,234,0.15)]!"
              } ${inMonth ? "" : "opacity-35!"}`}
            >
              {/* Cell Header: Left Date Circle/Number & Right Weather Badge */}
              <div className="flex! items-center! justify-between! mb-2!">
                {isToday ? (
                  <div className="w-6! h-6! flex! items-center! justify-center! text-xs! font-extrabold! rounded-full! bg-[#0d9488]! text-white! shadow-xs!">
                    {day.date()}
                  </div>
                ) : (
                  <span className="text-xs! font-extrabold! text-slate-700! dark:text-slate-300! pl-1!">
                    {day.date()}
                  </span>
                )}

                {/* Weather Badge Container */}
                <div className="w-6! h-6! rounded-full! bg-white! dark:bg-slate-800! border! border-slate-100! dark:border-slate-700! shadow-xs! flex! items-center! justify-center!">
                  <WeatherIcon type={weather} size={13} />
                </div>
              </div>

              {/* Cell Events List */}
              <div className="flex-1! flex! flex-col! gap-1.5! overflow-y-auto! no-scrollbar!">
                {dayTasks.map((task) => {
                  const style = getEventStyle(task.color);
                  return (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(task);
                      }}
                      className={`w-full! py-1! px-2.5! rounded-xl! text-[11px]! font-extrabold! ${style.bg} ${style.text} flex! items-center! gap-2! truncate! transition-all!`}
                    >
                      <span className={`w-2! h-2! rounded-full! ${style.dot} flex-shrink-0!`} />
                      <span className="truncate!">
                        {task.time ? `${task.time} ` : ""}
                        {task.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
