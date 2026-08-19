import React, { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import type { Task } from "@features/tasks";
import { getEventStyle } from "../model";
import { WeatherIcon } from "./WeatherIcon";
import { useWeather } from "../lib/useWeather";

interface IWeekViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs, selectedHour?: number) => void;
  onHeaderClick?: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
}

const HOUR_HEIGHT = 50;
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
  return `${String(h).padStart(2, "0")}:00`;
};

const getWeekColumnConfig = (colIdx: number) => {
  if (colIdx === 0) {
    return {
      style: {
        background: "linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)",
        boxShadow: "0 14px 30px -4px rgba(254, 215, 170, 0.7)",
      },
      className: "border border-[#fed7aa]/80",
    };
  }
  if (colIdx === 1 || colIdx === 2 || colIdx === 4 || colIdx === 5) {
    return {
      style: {
        background: "linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%)",
        boxShadow: "0 14px 30px -4px rgba(233, 213, 255, 0.7)",
      },
      className: "border border-[#e9d5ff]/80",
    };
  }
  return {
    style: {
      background: "linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)",
      boxShadow: "0 14px 30px -4px rgba(186, 230, 253, 0.7)",
    },
    className: "border border-[#bae6fd]/80",
  };
};

export const WeekView = memo(({
  daysToShow,
  tasks,
  currentDate,
  onDayClick,
  onHeaderClick,
  onEventClick,
}: IWeekViewProps) => {
  const { getWeatherForDate } = useWeather();

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
    <div className="w-full! flex! flex-col! gap-3!">
      {/* Header Day Columns in Russian */}
      <div className="flex! items-center! gap-3! pl-14! mb-1!">
        {daysToShow.map((day) => {
          const isToday = day.isSame(dayjs(), "day");
          const dayWeather = getWeatherForDate(day);

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              onClick={() => (onHeaderClick ? onHeaderClick(day) : onDayClick(day))}
              className={`flex-1! py-2! px-2! rounded-[1.25rem]! flex! items-center! justify-center! gap-1.5! cursor-pointer! transition-all! ${
                isToday
                  ? "bg-[#fff7ed]! border-2! border-[#fed7aa]! text-[#c2410c]! shadow-xs!"
                  : "bg-white/80! dark:bg-slate-800/80! border! border-slate-100! dark:border-slate-700! text-slate-700! dark:text-slate-200! shadow-xs!"
              }`}
            >
              <span className="text-[11px]! font-black! tracking-wider! uppercase!">
                {day.locale("ru").format("ddd").toUpperCase()} {day.date()}
              </span>
              <WeatherIcon type={dayWeather.weatherType} size={13} />
            </div>
          );
        })}
      </div>

      {/* Main Grid Area */}
      <div className="flex! relative! w-full!">
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
        <div className="flex-1! grid! grid-cols-7! gap-3! relative!">
          {/* Horizontal Grid lines */}
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute! left-0! right-0! border-b! border-slate-200/30! dark:border-slate-700/20! pointer-events-none!"
              style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            />
          ))}

          {/* Red current time indicator line */}
          <div
            className="absolute! left-0! right-0! z-30! flex! items-center! pointer-events-none!"
            style={{ top: redLineTop }}
          >
            <div className="w-2.5! h-2.5! rounded-full! bg-rose-500! -ml-1! shadow-xs!" />
            <div className="flex-1! h-[2px]! bg-rose-500!" />
          </div>

          {/* Individual Column Capsules */}
          {daysToShow.map((day, colIdx) => {
            const dateStr = day.format("YYYY-MM-DD");
            const dayTasks = tasksMap[dateStr] || [];
            const colConfig = getWeekColumnConfig(colIdx);

            return (
              <div
                key={dateStr}
                className={`relative! rounded-[1.8rem]! backdrop-blur-md! cursor-pointer! transition-colors! ${colConfig.className}`}
                style={{ height: HOUR_HEIGHT * HOURS.length, gridColumn: colIdx + 1, ...colConfig.style }}
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
                      className="absolute! left-1.5! right-1.5! z-20!"
                      style={{ top, height }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(task);
                      }}
                    >
                      <div
                        className={`h-full! w-full! rounded-xl! p-2.5! ${style.bg} ${style.border} overflow-hidden! shadow-xs! hover:shadow-md! transition-all! cursor-pointer! flex! flex-col! justify-center!`}
                      >
                        <div className={`font-black! text-[11px]! ${style.text} truncate!`}>
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
