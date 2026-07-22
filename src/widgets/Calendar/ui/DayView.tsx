import React, { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { If } from "@shared/ui";
import type { Task } from "@features/tasks";

interface IDayViewProps {
  currentDate: Dayjs;
  tasks: Task[];
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs, selectedHour?: number) => void;
  onEventClick: (task: Task) => void;
}

const HOUR_HEIGHT = 64;
const START_HOUR = 0;
const END_HOUR = 24;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

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

export const DayView = memo(({
  currentDate,
  tasks,
  onDayClick,
  onEventClick,
}: IDayViewProps) => {
  const dayTasks = useMemo(() => {
    const targetDate = currentDate.format("YYYY-MM-DD");
    return tasks.filter((task) => task.date === targetDate);
  }, [currentDate, tasks]);

  const dayName = currentDate.format("dd").toUpperCase();
  const monthYear = currentDate.format("MMMM YYYY");

  return (
    <div className="w-full! bg-white! dark:bg-slate-800/40! rounded-2xl! overflow-hidden! border! border-zinc-100! dark:border-slate-700/30! shadow-sm!">
      <div className="flex!">
        <div className="w-24! flex-shrink-0! border-r! border-zinc-100! dark:border-slate-700/30! p-4! flex! flex-col! gap-0.5!">
          <span className="text-5xl! font-black! text-zinc-800! dark:text-zinc-200! leading-none!">{currentDate.date()}</span>
          <span className="text-sm! font-bold! text-zinc-500! dark:text-zinc-400!">{dayName}</span>
          <span className="text-xs! text-zinc-400! dark:text-zinc-500!">{monthYear}</span>
        </div>

        <div className="flex-1! flex!">
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

          <div
            className="flex-1! relative! cursor-pointer!"
            style={{ height: HOUR_HEIGHT * HOURS.length }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const y = e.clientY - rect.top;
              const clickedHour = START_HOUR + Math.floor(y / HOUR_HEIGHT);
              onDayClick(currentDate, clickedHour);
            }}
          >
            {HOURS.map((h) => (
              <div
                key={h}
                className="w-full! border-b! border-zinc-100! dark:border-slate-700/20! absolute! left-0! right-0!"
                style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              />
            ))}

            {dayTasks.map((task) => {
              const { top, height } = getEventPosition(task);
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
        </div>
      </div>
    </div>
  );
});
