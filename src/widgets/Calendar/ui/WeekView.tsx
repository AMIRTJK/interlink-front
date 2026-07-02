import React, { useState, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Popover } from "antd";
import { ClockCircleOutlined, CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import { If } from "@shared/ui";
import type { Task } from "@features/tasks";

interface IWeekViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs) => void;
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

export const WeekView = ({
  daysToShow,
  tasks,
  onDeleteEvent,
  onDayClick,
}: IWeekViewProps) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

  const isToday = (day: Dayjs) => day.isSame(dayjs(), "day");

  const getTasksForDay = (day: Dayjs) => {
    const targetDate = day.format("YYYY-MM-DD");
    return tasks.filter((t) => t.date === targetDate);
  };

  const nowTop = useMemo(() => {
    const now = dayjs();
    const min = now.hour() * 60 + now.minute();
    return ((min - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  }, []);

  const todayIndex = daysToShow.findIndex((d) => isToday(d));

  return (
    <div className="w-full! bg-white! rounded-2xl! overflow-hidden! border! border-zinc-100!">
      <div className="flex! sticky! top-0! z-10! bg-white! border-b! border-zinc-100!">
        <div className="w-16! flex-shrink-0! border-r! border-zinc-100!" />
        {daysToShow.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={`flex-1! flex! flex-col! items-center! py-3! border-r! border-zinc-100! last:border-r-0! cursor-pointer! hover:bg-zinc-50! transition-colors! ${today ? "bg-violet-50!" : ""}`}
              onClick={() => onDayClick(day)}
            >
              <span className={`text-[11px]! font-bold! uppercase! tracking-wider! mb-1! ${today ? "text-violet-500!" : "text-zinc-400!"}`}>
                {WEEKDAYS[i]}
              </span>
              <span className={`text-lg! font-bold! w-9! h-9! flex! items-center! justify-center! rounded-full! ${today ? "bg-violet-500! text-white!" : "text-zinc-700!"}`}>
                {day.date()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex! overflow-y-auto! max-h-[600px]!">
        <div className="w-16! flex-shrink-0! border-r! border-zinc-100! relative!">
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex! items-start! justify-end! pr-3! text-[11px]! font-medium! text-zinc-400!"
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
              className="col-span-7! border-b! border-zinc-100! pointer-events-none!"
              style={{ height: HOUR_HEIGHT, gridColumn: "1 / -1" }}
            />
          ))}

          <If is={todayIndex >= 0}>
            <div
              className="absolute! left-0! right-0! z-20! pointer-events-none!"
              style={{
                top: nowTop,
                gridColumn: "1 / -1",
              }}
            >
              <div className="flex! items-center! w-full!">
                <div className="w-2! h-2! rounded-full! bg-red-500! flex-shrink-0!" style={{ marginLeft: `calc(${(todayIndex / daysToShow.length) * 100}% - 4px)` }} />
                <div className="h-px! bg-red-400! flex-1!" style={{ marginLeft: `${(todayIndex / daysToShow.length) * 100}%`, width: `${(1 / daysToShow.length) * 100}%`, position: "absolute", left: 0, right: 0 }} />
              </div>
            </div>
          </If>

          {daysToShow.map((day, colIdx) => {
            const dayTasks = getTasksForDay(day);
            const today = isToday(day);
            return (
              <div
                key={day.format("YYYY-MM-DD")}
                className={`relative! border-r! border-zinc-100! last:border-r-0! cursor-pointer! transition-colors! hover:bg-zinc-50/50! ${today ? "bg-violet-50/30!" : ""}`}
                style={{ height: HOUR_HEIGHT * HOURS.length, gridColumn: colIdx + 1 }}
                onClick={() => onDayClick(day)}
              >
                {dayTasks.map((task) => {
                  const { top, height } = getEventPosition(task);
                  return (
                    <div
                      key={task.id}
                      className="absolute! left-1! right-1! z-10!"
                      style={{ top, height }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Popover
                        open={openPopoverId === task.id}
                        onOpenChange={(v) => setOpenPopoverId(v ? task.id : null)}
                        content={
                          <div className="w-[240px]! bg-white! rounded-2xl! shadow-lg! overflow-hidden!">
                            <div className="flex! items-start! gap-2.5! p-4! pb-2!">
                              <span
                                className="w-2.5! h-2.5! rounded-full! flex-shrink-0! mt-1!"
                                style={getEventDotStyle(task.color)}
                              />
                              <h4 className="font-bold! text-zinc-900! text-sm! m-0! leading-snug!">
                                {task.title}
                              </h4>
                            </div>
                            <div className="px-4! pb-3! space-y-1.5! text-zinc-500! text-xs!">
                              <div className="flex! items-center! gap-2!">
                                <ClockCircleOutlined className="text-zinc-400! flex-shrink-0!" />
                                <span>{task.time}{task.endTime ? ` – ${task.endTime}` : ""}</span>
                              </div>
                              <div className="flex! items-center! gap-2!">
                                <CalendarOutlined className="text-zinc-400! flex-shrink-0!" />
                                <span>{dayjs(task.date).format("YYYY-MM-DD")}</span>
                              </div>
                              <If is={!!task.description}>
                                <p className="text-zinc-500! text-xs! mt-1! leading-relaxed! whitespace-pre-wrap! m-0!">
                                  {task.description}
                                </p>
                              </If>
                            </div>
                            <div className="border-t! border-zinc-100! px-4! py-2.5! flex! justify-end!">
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
            );
          })}
        </div>
      </div>
    </div>
  );
};
