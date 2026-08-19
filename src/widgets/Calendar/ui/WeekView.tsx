import React, { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { getEventStyle, getDayWeather } from "../model";
import { WeatherIcon } from "./WeatherIcon";

interface IWeekViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs, selectedHour?: number) => void;
  onHeaderClick?: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
}

const HOUR_HEIGHT = 46;
const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

const timeToMinutes = (time?: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

const getEventPosition = (task: Task) => {
  const startMin = timeToMinutes(task.time);
  const endMin = task.endTime ? timeToMinutes(task.endTime) : startMin + 60;
  const top = (startMin / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.7);
  return { top, height };
};

const formatHourLabel = (h: number) => {
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
};

const getWeekColumnStyle = (colIdx: number) => {
  if (colIdx === 0) {
    return "bg-[#fef3c7]/60 dark:bg-amber-950/30 border border-[#fde68a] shadow-[0_8px_20px_rgba(245,158,11,0.15)]";
  }
  if (colIdx === 1 || colIdx === 2) {
    return "bg-[#f3e8ff]/60 dark:bg-purple-950/30 border border-[#e9d5ff] shadow-[0_8px_20px_rgba(168,85,247,0.15)]";
  }
  if (colIdx === 3) {
    return "bg-[#e0f2fe]/60 dark:bg-cyan-950/30 border border-[#bae6fd] shadow-[0_8px_20px_rgba(6,182,212,0.15)]";
  }
  if (colIdx === 4 || colIdx === 5) {
    return "bg-[#f1f5f9]/60 dark:bg-slate-800/50 border border-[#e2e8f0] shadow-[0_8px_20px_rgba(168,85,247,0.1)]";
  }
  return "bg-[#e0f2fe]/60 dark:bg-cyan-950/30 border border-[#bae6fd] shadow-[0_8px_20px_rgba(6,182,212,0.15)]";
};

export const WeekView = memo(({
  daysToShow,
  tasks,
  currentDate,
  onDayClick,
  onHeaderClick,
  onEventClick,
}: IWeekViewProps) => {
  const tasksMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  const currentMinutes = useMemo(() => {
    const now = dayjs();
    return now.hour() * 60 + now.minute();
  }, []);

  const redLineTop = (currentMinutes / 60) * HOUR_HEIGHT;

  return (
    <div className="w-full! flex! flex-col! gap-2!">
      {/* Header Day Columns */}
      <div className="flex! items-center! gap-2! pl-14! mb-1!">
        {daysToShow.map((day) => {
          const isToday = day.isSame(dayjs(), "day");
          const isSelected = day.isSame(currentDate, "day");
          const weather = getDayWeather(day);

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              onClick={() => (onHeaderClick ? onHeaderClick(day) : onDayClick(day))}
              className={`flex-1! py-1.5! px-2! rounded-xl! flex! items-center! justify-center! gap-1! cursor-pointer! transition-all! border! ${
                isToday || isSelected
                  ? "bg-[#fef3c7]/80! dark:bg-amber-950/40! border-2! border-[#fcd34d]! text-[#92400e]! dark:text-amber-200! shadow-2xs!"
                  : "bg-[#f0f9ff]/70! dark:bg-slate-800/60! border! border-[#e0f2fe]! dark:border-slate-700/50! text-slate-700! dark:text-slate-200!"
              }`}
            >
              <span className="text-[11px]! font-extrabold! tracking-wider! uppercase!">
                {day.format("ddd").toUpperCase()} {day.date()}
              </span>
              <WeatherIcon type={weather} size={12} />
            </div>
          );
        })}
      </div>

      {/* Main Grid Area */}
      <div className="flex! relative! max-h-[560px]! overflow-y-auto! no-scrollbar!">
        {/* Time Axis */}
        <div className="w-14! flex-shrink-0! relative!">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex! items-start! justify-end! pr-2.5! text-[9px]! font-extrabold! text-slate-400! dark:text-slate-500!"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="-translate-y-2!">{formatHourLabel(h)}</span>
            </div>
          ))}
        </div>

        {/* 7 Vertical Columns Grid */}
        <div className="flex-1! grid! grid-cols-7! gap-2! relative!">
          {/* Horizontal Grid lines */}
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute! left-0! right-0! border-b! border-slate-100/70! dark:border-slate-800/40! pointer-events-none!"
              style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            />
          ))}

          {/* Red current time indicator line */}
          <div
            className="absolute! left-0! right-0! z-30! flex! items-center! pointer-events-none!"
            style={{ top: redLineTop }}
          >
            <div className="w-2! h-2! rounded-full! bg-rose-500! -ml-1! shadow-xs!" />
            <div className="flex-1! h-[2px]! bg-rose-500!" />
          </div>

          {/* Individual Column Capsules */}
          {daysToShow.map((day, colIdx) => {
            const dateStr = day.format("YYYY-MM-DD");
            const dayTasks = tasksMap[dateStr] || [];
            const colStyle = getWeekColumnStyle(colIdx);

            return (
              <div
                key={dateStr}
                className={`relative! rounded-2xl! backdrop-blur-md! cursor-pointer! transition-colors! ${colStyle}`}
                style={{ height: HOUR_HEIGHT * HOURS.length, gridColumn: colIdx + 1 }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const clickedHour = Math.floor(y / HOUR_HEIGHT);
                  onDayClick(day, clickedHour);
                }}
              >
                {dayTasks.map((task) => {
                  const { top, height } = getEventPosition(task);
                  const style = getEventStyle(task.color);

                  return (
                    <div
                      key={task.id}
                      className="absolute! left-1! right-1! z-20!"
                      style={{ top, height }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(task);
                      }}
                    >
                      <div
                        className={`h-full! w-full! rounded-xl! p-2! ${style.bg} ${style.border} overflow-hidden! shadow-xs! hover:shadow-md! transition-all! cursor-pointer! flex! flex-col! justify-center!`}
                      >
                        <div className={`font-extrabold! text-[11px]! ${style.text} truncate!`}>
                          {task.title}
                        </div>
                        <div className="text-[9px]! font-bold! opacity-80! truncate!">
                          {task.time} {task.endTime ? `- ${task.endTime}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
