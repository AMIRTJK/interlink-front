import { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { getEventStyle, getDayWeather, WeatherType } from "../model";
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

const getMonthCardStyle = (weather: WeatherType, isPreviousOrNextMonth: boolean) => {
  if (isPreviousOrNextMonth) {
    return {
      className: "bg-[#fcfdfe] dark:bg-slate-900/40 opacity-40 shadow-[0_8px_20px_rgba(0,0,0,0.02)]",
      style: {
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        boxShadow: "0 10px 24px -4px rgba(226, 232, 240, 0.6)",
      },
    };
  }

  switch (weather) {
    case "sun":
      // Warm yellow/peach card with amber bottom glow
      return {
        className: "text-[#1e293b]",
        style: {
          background: "linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)",
          boxShadow: "0 14px 30px -4px rgba(254, 215, 170, 0.7), 0 6px 14px -2px rgba(249, 115, 22, 0.12)",
        },
      };
    case "sun-cloud":
      // Soft lavender/purple card with purple bottom glow
      return {
        className: "text-[#1e293b]",
        style: {
          background: "linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 100%)",
          boxShadow: "0 14px 30px -4px rgba(233, 213, 255, 0.7), 0 6px 14px -2px rgba(168, 85, 247, 0.12)",
        },
      };
    case "rain":
      // Soft sky blue/cyan card with blue bottom glow
      return {
        className: "text-[#1e293b]",
        style: {
          background: "linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)",
          boxShadow: "0 14px 30px -4px rgba(186, 230, 253, 0.7), 0 6px 14px -2px rgba(14, 165, 233, 0.12)",
        },
      };
    case "snow":
      // Soft pale lavender/white card with soft glow
      return {
        className: "text-[#1e293b]",
        style: {
          background: "linear-gradient(180deg, #FAF5FF 0%, #EEF2FF 100%)",
          boxShadow: "0 14px 30px -4px rgba(224, 231, 255, 0.7), 0 6px 14px -2px rgba(99, 102, 241, 0.12)",
        },
      };
    case "cloud":
    default:
      // Neutral smooth slate card with gray glow
      return {
        className: "text-[#1e293b]",
        style: {
          background: "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)",
          boxShadow: "0 14px 30px -4px rgba(226, 232, 240, 0.8), 0 6px 14px -2px rgba(100, 116, 139, 0.1)",
        },
      };
  }
};

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
      <div className="grid! grid-cols-7! gap-3! text-center! mb-1!">
        {WEEKDAYS.map((day) => (
          <div
            key={day.label}
            className={`py-2! text-[11px]! font-black! tracking-wider! transition-all! flex! items-center! justify-center! ${
              day.isWeekend
                ? "border-2! border-[#fed7aa]! bg-[#fff7ed]! dark:bg-amber-950/40! text-[#ea580c]! dark:text-amber-400! rounded-[1.25rem]! shadow-xs!"
                : "text-slate-400! dark:text-slate-500!"
            }`}
          >
            {day.label}
          </div>
        ))}
      </div>

      {/* Grid of Days */}
      <div className="grid! grid-cols-7! gap-3.5! auto-rows-[108px]">
        {daysToShow.map((day) => {
          const dateStr = day.format("YYYY-MM-DD");
          const dayTasks = tasksMap[dateStr] || [];
          const inMonth = day.month() === currentDate.month();
          const isTodayHighlight = day.date() === 17 && inMonth;
          const weather = getDayWeather(day);
          const cardConfig = getMonthCardStyle(weather, !inMonth);

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(day)}
              style={cardConfig.style}
              className={`flex! flex-col! p-2.5! rounded-[1.6rem]! cursor-pointer! transition-all! duration-200! overflow-hidden! ${cardConfig.className}`}
            >
              {/* Cell Header: Date on left & White circular weather badge on right */}
              <div className="flex! items-center! justify-between! mb-1.5!">
                {isTodayHighlight ? (
                  <div className="w-6! h-6! flex! items-center! justify-center! text-xs! font-extrabold! rounded-full! bg-[#00897b]! text-white! shadow-xs!">
                    {day.date()}
                  </div>
                ) : (
                  <span className="text-xs! font-black! text-slate-800! dark:text-slate-200! pl-1!">
                    {day.date()}
                  </span>
                )}

                {/* Pure White Circular Weather Badge */}
                <div className="w-6! h-6! rounded-full! bg-white! dark:bg-slate-800! shadow-[0_2px_8px_rgba(0,0,0,0.06)]! flex! items-center! justify-center!">
                  <WeatherIcon type={weather} size={13} />
                </div>
              </div>

              {/* Cell Events List: White Pill Chips with Colored Dot */}
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
                      className="w-fit! max-w-full! py-1! px-2.5! rounded-full! bg-white/90! dark:bg-slate-800/90! shadow-[0_2px_8px_rgba(0,0,0,0.04)]! text-[10px]! font-black! flex! items-center! gap-1.5! truncate! transition-all!"
                    >
                      <span className={`w-1.5! h-1.5! rounded-full! ${style.dot} flex-shrink-0!`} />
                      <span className={`${style.text} truncate!`}>{task.title}</span>
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
