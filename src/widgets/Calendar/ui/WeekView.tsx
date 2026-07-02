import React, { useMemo } from "react";
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

const getEventColorClasses = (color?: string) => {
  const lowerColor = color?.toLowerCase();
  if (lowerColor === "#29cc39" || lowerColor === "green" || lowerColor === "#166534") {
    return "bg-emerald-500! text-white! hover:bg-emerald-600!";
  }
  if (lowerColor === "#ffcb33" || lowerColor === "yellow") {
    return "bg-yellow-500! text-white! hover:bg-yellow-600!";
  }
  if (lowerColor === "#ff6633" || lowerColor === "orange") {
    return "bg-orange-500! text-white! hover:bg-orange-600!";
  }
  if (lowerColor === "#cc7429" || lowerColor === "bronze") {
    return "bg-amber-600! text-white! hover:bg-amber-700!";
  }
  if (lowerColor === "#8833ff" || lowerColor === "purple" || lowerColor === "#af52de") {
    return "bg-indigo-500! text-white! hover:bg-indigo-600!";
  }
  if (lowerColor === "#33bfff" || lowerColor === "blue") {
    return "bg-sky-500! text-white! hover:bg-sky-600!";
  }
  if (lowerColor === "#e62e7b" || lowerColor === "pink" || lowerColor === "#f43f5e") {
    return "bg-rose-500! text-white! hover:bg-rose-600!";
  }
  if (lowerColor === "#2ee6ca" || lowerColor === "tiffany" || lowerColor === "#10b981") {
    return "bg-teal-500! text-white! hover:bg-teal-600!";
  }
  return "bg-emerald-500! text-white! hover:bg-emerald-600!";
};

const getEventDotStyle = (color?: string) => {
  return { backgroundColor: color || "#10B981" };
};

export const WeekView = ({
  daysToShow,
  tasks,
  onDeleteEvent,
  onDayClick,
}: IWeekViewProps) => {
  const themeKey = useMemo(() => localStorage.getItem("currentTheme") || "emerald", []);

  const getTodayHeaderClass = (theme: string) => {
    switch (theme) {
      case "blue": return "bg-blue-50! text-blue-600! dark:bg-blue-900/20! dark:text-blue-400!";
      case "sunset": return "bg-orange-50! text-orange-600! dark:bg-orange-900/20! dark:text-orange-400!";
      case "ocean": return "bg-cyan-50! text-cyan-600! dark:bg-cyan-900/20! dark:text-cyan-400!";
      case "purple": return "bg-purple-50! text-purple-600! dark:bg-purple-900/20! dark:text-purple-400!";
      case "Aurora": return "bg-emerald-50! text-emerald-600! dark:bg-emerald-900/20! dark:text-emerald-400!";
      case "fury": return "bg-rose-50! text-rose-600! dark:bg-rose-900/20! dark:text-rose-400!";
      case "Lavender": return "bg-violet-50! text-violet-600! dark:bg-violet-900/20! dark:text-violet-400!";
      case "coral": return "bg-blue-50! text-blue-600! dark:bg-blue-900/20! dark:text-blue-400!";
      case "Peach": return "bg-pink-50! text-pink-500! dark:bg-pink-900/20! dark:text-pink-400!";
      case "galaxy": return "bg-indigo-50! text-indigo-600! dark:bg-indigo-900/20! dark:text-indigo-400!";
      case "emerald":
      default:
        return "bg-emerald-50! text-emerald-600! dark:bg-emerald-900/20! dark:text-emerald-400!";
    }
  };

  const todayClass = getTodayHeaderClass(themeKey);

  const getTasksForDay = (day: Dayjs) => {
    const targetDate = day.format("YYYY-MM-DD");
    return tasks.filter((task) => task.date === targetDate);
  };

  const isToday = (day: Dayjs) => {
    return day.isSame(dayjs(), "day");
  };

  return (
    <div className="w-full! bg-white/40! dark:bg-slate-800/40! rounded-3xl! p-4! border! border-white/20! dark:border-slate-700/30! shadow-sm!">
      <div className="grid! grid-cols-1! md:grid-cols-7! gap-4!">
        {daysToShow.map((day) => {
          const dayTasks = getTasksForDay(day);
          const current = isToday(day);

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              onClick={() => onDayClick(day)}
              className={`flex! flex-col! min-h-[300px]! p-3! rounded-2xl! border! bg-white/30! dark:bg-slate-900/30! cursor-pointer! transition-all! hover:bg-white/70! dark:hover:bg-slate-900/70! ${
                current
                  ? `border-emerald-500/30! dark:border-emerald-500/20! ${todayClass}`
                  : "border-zinc-100/50! dark:border-slate-800/20!"
              }`}
            >
              <div className="flex! items-center! justify-between! mb-3! border-b! border-zinc-100/50! dark:border-slate-800/50! pb-2!">
                <span className="text-xs! font-bold! text-zinc-400! uppercase!">
                  {day.format("dd")}
                </span>
                <span className={`text-sm! font-bold! ${current ? "text-emerald-600! dark:text-emerald-400!" : "text-zinc-700! dark:text-zinc-300!"}`}>
                  {day.format("D MMM")}
                </span>
              </div>

              <div className="flex-1! space-y-2! overflow-y-auto! no-scrollbar!">
                <If is={dayTasks.length === 0}>
                  <div className="text-[11px]! text-zinc-400! italic! text-center! py-8!">
                    Нет событий
                  </div>
                </If>

                {dayTasks.map((task) => (
                  <div key={task.id} onClick={(e) => e.stopPropagation()}>
                    <Popover
                      content={
                        <div className="p-3! bg-white! dark:bg-slate-900! rounded-2xl! shadow-xl! max-w-[280px]! border! border-zinc-100! dark:border-slate-800!">
                          <div className="flex! items-center! gap-2! mb-3!">
                            <span
                              className="w-3! h-3! rounded-full! flex-shrink-0!"
                              style={getEventDotStyle(task.color)}
                            />
                            <h4 className="font-bold! text-zinc-900! dark:text-zinc-100! text-sm! m-0!">
                              {task.title}
                            </h4>
                          </div>
                          <div className="space-y-2! text-zinc-500! dark:text-zinc-400! text-xs! mb-4!">
                            <div className="flex! items-center! gap-2!">
                              <ClockCircleOutlined className="text-emerald-500!" />
                              <span>
                                {task.time}
                                {task.endTime ? ` - ${task.endTime}` : ""}
                              </span>
                            </div>
                            <div className="flex! items-center! gap-2!">
                              <CalendarOutlined className="text-emerald-500!" />
                              <span>{dayjs(task.date).format("YYYY-MM-DD")}</span>
                            </div>
                            <If is={task.description}>
                              <p className="text-zinc-600! dark:text-zinc-300! text-xs! mt-2! leading-relaxed! whitespace-pre-wrap!">
                                {task.description}
                              </p>
                            </If>
                          </div>
                          <div className="border-t! border-zinc-100! dark:border-slate-800! pt-2! flex! justify-end!">
                            <button
                              onClick={() => onDeleteEvent(task.id)}
                              className="flex! items-center! gap-1.5! text-red-500! hover:text-red-700! font-semibold! text-xs! transition-colors! cursor-pointer!"
                            >
                              <DeleteOutlined />
                              <span>Удалить</span>
                            </button>
                          </div>
                        </div>
                      }
                      trigger="click"
                      placement="bottom"
                      overlayClassName="calendar-event-popover"
                    >
                      <div
                        className={`text-xs! font-medium! p-2! rounded-xl! transition-all! shadow-sm! ${getEventColorClasses(
                          task.color
                        )}`}
                      >
                        <div className="font-semibold! text-[10px]! opacity-90! mb-0.5!">
                          {task.time}
                        </div>
                        <div className="truncate!">{task.title}</div>
                      </div>
                    </Popover>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
