import { useMemo, memo } from "react";
import { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import type { Task } from "@features/tasks";
import { getEventStyle } from "../model";
import { WeatherIcon } from "./WeatherIcon";
import { useWeather } from "../lib/useWeather";

interface IDayViewProps {
  currentDate: Dayjs;
  tasks: Task[];
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs, selectedHour?: number) => void;
  onEventClick: (task: Task) => void;
}

const HOUR_HEIGHT = 48;
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
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.75);
  return { top, height };
};

const formatHourLabel = (h: number) => {
  return `${String(h).padStart(2, "0")}:00`;
};

export const DayView = memo(({
  currentDate,
  tasks,
  onDayClick,
  onEventClick,
}: IDayViewProps) => {
  const weather = useWeather();

  const dayTasks = useMemo(() => {
    const targetDate = currentDate.format("YYYY-MM-DD");
    return tasks.filter((task) => task.date === targetDate);
  }, [currentDate, tasks]);

  return (
    <div className="w-full! flex! flex-col! gap-3!">
      {/* Top Focus Day Banner in Russian */}
      <div className="w-full! py-2.5! px-5! rounded-xl! bg-[#f5f3ff]! dark:bg-purple-950/40! border! border-[#e9d5ff]! dark:border-purple-800/50! text-[#6b21a8]! dark:text-purple-200! font-extrabold! text-[11px]! tracking-widest! uppercase! flex! items-center! justify-center! gap-2! shadow-2xs!">
        <span>{currentDate.locale("ru").format("dddd, D MMMM").toUpperCase()} • ДЕНЬ В ФОКУСЕ</span>
        <WeatherIcon type={weather.weatherType} size={14} />
      </div>

      {/* Real-time Weather info header in Russian */}
      <div className="flex! items-center! gap-2! px-1! text-xs! font-bold! text-slate-700! dark:text-slate-200!">
        <WeatherIcon type={weather.weatherType} size={14} />
        <span className="font-extrabold!">{weather.temp}</span>
        <span className="text-slate-400! dark:text-slate-500! font-semibold!">
          {weather.description}
        </span>
      </div>

      {/* Hourly Grid Container */}
      <div className="flex! relative! w-full! border-t! border-slate-100/80! dark:border-slate-800/50! pt-2!">
        {/* Time Labels in 24h format */}
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

        {/* Day Column Grid */}
        <div
          className="flex-1! relative! cursor-pointer! rounded-2xl! bg-white/70! dark:bg-slate-900/50! border! border-white/80! dark:border-slate-800/60! backdrop-blur-md! shadow-[0_8px_20px_rgba(0,0,0,0.03)]!"
          style={{ height: HOUR_HEIGHT * HOURS.length }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const clickedHour = Math.floor(y / HOUR_HEIGHT);
            onDayClick(currentDate, clickedHour);
          }}
        >
          {/* Horizontal lines */}
          {HOURS.map((h) => (
            <div
              key={h}
              className="w-full! border-b! border-slate-100/70! dark:border-slate-800/40! absolute! left-0! right-0!"
              style={{ top: h * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            />
          ))}

          {/* Event Bars */}
          {dayTasks.map((task) => {
            const { top, height } = getEventPosition(task);
            const style = getEventStyle(task.color);

            return (
              <div
                key={task.id}
                className="absolute! left-2! right-2! z-10!"
                style={{ top, height }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick(task);
                }}
              >
                <div
                  className={`h-full! w-full! rounded-xl! p-3! ${style.bg} ${style.border} shadow-xs! hover:shadow-md! transition-all! cursor-pointer! flex! flex-col! justify-center! gap-1!`}
                >
                  <div className="flex! items-center! gap-2! flex-wrap!">
                    <span className={`w-2! h-2! rounded-full! ${style.dot}`} />
                    <span className={`font-extrabold! text-[11px]! ${style.text}`}>
                      {task.title}
                    </span>
                    <span className="text-[11px]! font-bold! opacity-80!">
                      {task.time} {task.endTime ? `– ${task.endTime}` : ""}
                    </span>
                    {task.description && (
                      <span className="text-[11px]! font-medium! opacity-70!">
                        • {task.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
