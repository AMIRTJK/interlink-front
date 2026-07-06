import React, { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Popover } from "antd";
import { ClockCircleOutlined, CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import { If } from "@shared/ui";
import type { Task } from "@features/tasks";

interface IDayViewProps {
  currentDate: Dayjs;
  tasks: Task[];
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs) => void;
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

const getEventDotStyle = (color?: string) => ({
  backgroundColor: color || "#10B981",
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

export const DayView = ({
  currentDate,
  tasks,
  onDeleteEvent,
  onDayClick,
}: IDayViewProps) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const dayTasks = useMemo(() => {
    const targetDate = currentDate.format("YYYY-MM-DD");
    return tasks.filter((task) => task.date === targetDate);
  }, [currentDate, tasks]);

  const nowTop = useMemo(() => {
    const now = dayjs();
    const isToday = now.isSame(currentDate, "day");
    if (!isToday) return null;
    const min = now.hour() * 60 + now.minute();
    return ((min - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  }, [currentDate]);

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
            onClick={() => onDayClick(currentDate)}
          >
            {HOURS.map((h) => (
              <div
                key={h}
                className="w-full! border-b! border-zinc-100! dark:border-slate-700/20! absolute! left-0! right-0!"
                style={{ top: (h - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              />
            ))}

            <If is={nowTop !== null}>
              <div
                className="absolute! left-0! right-0! z-20! flex! items-center! pointer-events-none!"
                style={{ top: nowTop ?? 0 }}
              >
                <div className="w-2! h-2! rounded-full! bg-red-500! flex-shrink-0! -ml-1!" />
                <div className="flex-1! h-px! bg-red-400!" />
              </div>
            </If>

            {dayTasks.map((task) => {
              const { top, height } = getEventPosition(task);
              return (
                <div
                  key={task.id}
                  className="absolute! left-2! right-2! z-10!"
                  style={{ top, height }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Popover
                    open={openPopoverId === task.id}
                    onOpenChange={(v) => setOpenPopoverId(v ? task.id : null)}
                    content={
                      <div className="w-[240px]! bg-white! dark:bg-slate-800! rounded-2xl! shadow-lg! overflow-hidden! border! border-transparent! dark:border-slate-700/50!">
                        <div className="flex! items-start! gap-2.5! p-4! pb-2!">
                          <span
                            className="w-2.5! h-2.5! rounded-full! flex-shrink-0! mt-1!"
                            style={getEventDotStyle(task.color)}
                          />
                          <h4 className="font-bold! text-zinc-900! dark:text-zinc-100! text-sm! m-0! leading-snug!">
                            {task.title}
                          </h4>
                        </div>
                        <div className="px-4! pb-3! space-y-1.5! text-zinc-500! dark:text-zinc-400! text-xs!">
                          <div className="flex! items-center! gap-2!">
                            <ClockCircleOutlined className="text-zinc-400! dark:text-zinc-500! flex-shrink-0!" />
                            <span>{task.time}{task.endTime ? ` – ${task.endTime}` : ""}</span>
                          </div>
                          <div className="flex! items-center! gap-2!">
                            <CalendarOutlined className="text-zinc-400! dark:text-zinc-500! flex-shrink-0!" />
                            <span>{dayjs(task.date).format("YYYY-MM-DD")}</span>
                          </div>
                          <If is={!!task.description}>
                            <p className="text-zinc-500! dark:text-zinc-400! text-xs! mt-1! leading-relaxed! whitespace-pre-wrap! m-0!">
                              {task.description}
                            </p>
                          </If>
                        </div>
                        <div className="border-t! border-zinc-100! dark:border-slate-700/50! px-4! py-2.5! flex! justify-end!">
                          <button
                            onClick={() => { onDeleteEvent(task.id); setOpenPopoverId(null); }}
                            className="flex! items-center! gap-1.5! text-red-500! hover:text-red-600! font-semibold! text-xs! transition-colors! cursor-pointer! bg-transparent! border-none! p-0!"
                          >
                            <DeleteOutlined />
                            <span>Удалить</span>
                          </button>
                        </div>
                      </div>
                    }
                    trigger="click"
                    placement="right"
                    overlayClassName="calendar-event-popover"
                    overlayInnerStyle={{ padding: 0, borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
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
                  </Popover>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
