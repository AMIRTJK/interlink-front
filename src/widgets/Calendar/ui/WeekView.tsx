import React, { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { If } from "@shared/ui";
import type { Task } from "@features/tasks";
import { useCalendarTheme } from "../lib/useCalendarTheme";

interface IWeekViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs, selectedHour?: number) => void;
  onHeaderClick?: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
}

const HOUR_HEIGHT = 64;
const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

const getEventBgStyle = (color?: string): React.CSSProperties => ({
  backgroundColor: color ? `${color}22` : "#10B98122",
  borderLeft: `3px solid ${color || "#10B981"}`,
  color: color || "#10B981",
});

const timeToMinutes = (time?: string): number => {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

const getEventPosition = (task: Task) => {
  const startMin = timeToMinutes(task.time);
  const endMin = task.endTime ? timeToMinutes(task.endTime) : startMin + 60;
  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, HOUR_HEIGHT * 0.5);
  return { top, height };
};

export const WeekView = memo(({
  daysToShow,
  tasks,
  currentDate,
  onDayClick,
  onHeaderClick,
  onEventClick,
}: IWeekViewProps) => {
  const { theme } = useCalendarTheme();
  const isSelected = (day: Dayjs) => day.isSame(currentDate, "day");

  const tasksMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

  return (
    <div className="w-full! bg-white! dark:bg-slate-800/40! rounded-2xl! overflow-hidden! border! border-zinc-100! dark:border-slate-700/30! shadow-sm!">
      <div className="flex! sticky! top-0! z-10! bg-white! dark:bg-slate-900/90! backdrop-blur-sm! border-b! border-zinc-100! dark:border-slate-700/30!">
        <div className="w-16! flex-shrink-0! border-r! border-zinc-100! dark:border-slate-700/30!" />
        {daysToShow.map((day, i) => {
          const selected = isSelected(day);
          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={`flex-1! flex! flex-col! items-center! py-3! border-r! border-zinc-100! dark:border-slate-700/30! last:border-r-0! cursor-pointer! hover:bg-zinc-50! dark:hover:bg-slate-800/40! transition-colors!`}
              onClick={() => onHeaderClick ? onHeaderClick(day) : onDayClick(day)}
            >
              <span className={`text-[11px]! font-bold! uppercase! tracking-wider! mb-1! ${selected ? "text-zinc-700! dark:text-zinc-200!" : "text-zinc-400! dark:text-zinc-500!"}`}>
                {WEEKDAYS[i]}
              </span>
              <span
                className={`text-lg! font-bold! w-9! h-9! flex! items-center! justify-center! rounded-full! ${
                  selected ? `bg-gradient-to-r! ${theme.gradient} text-white!` : "text-zinc-700! dark:text-zinc-300!"
                }`}
                style={selected ? { color: "white" } : undefined}
              >
                {day.date()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex!">
        <div className="w-16! flex-shrink-0! border-r! border-zinc-100! dark:border-slate-700/30! relative!">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex! items-start! justify-end! pr-3! text-[11px]! font-medium! text-zinc-400! dark:text-zinc-500!"
              style={{ height: HOUR_HEIGHT }}
            >
              <span className="-translate-y-2!">{h === 0 ? "" : `${String(h).padStart(2, "0")}:00`}</span>
            </div>
          ))}
        </div>

        <div className="flex-1! grid! relative!" style={{ gridTemplateColumns: `repeat(${daysToShow.length}, 1fr)` }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="absolute! left-0! right-0! border-b! border-zinc-100! dark:border-slate-700/20! pointer-events-none!"
              style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            />
          ))}

          {daysToShow.map((day, colIdx) => {
            const dateStr = day.format("YYYY-MM-DD");
            const dayTasks = tasksMap[dateStr] || [];
            return (
              <div
                key={dateStr}
                className="relative! border-r! border-zinc-100! dark:border-slate-700/30! last:border-r-0! cursor-pointer! transition-colors! hover:bg-zinc-50/50! dark:hover:bg-slate-900/20!"
                style={{ height: HOUR_HEIGHT * HOURS.length, gridColumn: colIdx + 1 }}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const clickedHour = START_HOUR + Math.floor((y + 16) / HOUR_HEIGHT);
                  onDayClick(day, clickedHour);
                }}
              >
                {dayTasks.map((task) => {
                  const { top, height } = getEventPosition(task);
                  return (
                    <div
                      key={task.id}
                      className="absolute! left-1! right-1! z-10!"
                      style={{ top, height }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(task);
                      }}
                    >
                      <div
                        className="h-full! w-full! rounded-lg! px-2! py-1! overflow-hidden! cursor-pointer! transition-opacity! hover:opacity-90! text-xs! font-medium!"
                        style={getEventBgStyle(task.color)}
                      >
                        <div className="font-semibold! truncate!">{task.time} {task.title}</div>
                        <If is={!!task.endTime}>
                          <div className="opacity-70! truncate! text-[10px]!">{task.endTime}</div>
                        </If>
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
