import React, { useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Popover } from "antd";
import { ClockCircleOutlined, CalendarOutlined, DeleteOutlined } from "@ant-design/icons";
import { If } from "@shared/ui";
import type { Task } from "@features/tasks";

interface IMonthViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs) => void;
}

const WEEKDAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

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

export const MonthView = ({
  daysToShow,
  tasks,
  currentDate,
  onDeleteEvent,
  onDayClick,
}: IMonthViewProps) => {
  const themeKey = useMemo(() => localStorage.getItem("currentTheme") || "emerald", []);

  const getTodayBgClass = (theme: string) => {
    switch (theme) {
      case "blue": return "bg-blue-600! text-white!";
      case "sunset": return "bg-orange-500! text-white!";
      case "ocean": return "bg-cyan-500! text-white!";
      case "purple": return "bg-purple-600! text-white!";
      case "Aurora": return "bg-emerald-500! text-white!";
      case "fury": return "bg-rose-500! text-white!";
      case "Lavender": return "bg-violet-500! text-white!";
      case "coral": return "bg-blue-500! text-white!";
      case "Peach": return "bg-pink-400! text-white!";
      case "galaxy": return "bg-indigo-700! text-white!";
      case "emerald":
      default:
        return "bg-emerald-600! text-white!";
    }
  };

  const todayClass = getTodayBgClass(themeKey);

  const getTasksForDay = (day: Dayjs) => {
    const targetDate = day.format("YYYY-MM-DD");
    return tasks.filter((task) => task.date === targetDate);
  };

  const isCurrentMonth = (day: Dayjs) => {
    return day.month() === currentDate.month();
  };

  const isToday = (day: Dayjs) => {
    return day.isSame(dayjs(), "day");
  };

  return (
    <div className="w-full! bg-white/40! dark:bg-slate-800/40! rounded-3xl! p-4! border! border-white/20! dark:border-slate-700/30! shadow-sm!">
      <div className="grid! grid-cols-7! gap-2! text-center! mb-4!">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-sm! font-bold! text-zinc-400! uppercase! py-2!">
            {day}
          </div>
        ))}
      </div>

      <div className="grid! grid-cols-7! gap-2! auto-rows-[120px]!">
        {daysToShow.map((day) => {
          const dayTasks = getTasksForDay(day);
          const inMonth = isCurrentMonth(day);
          const current = isToday(day);

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              onClick={() => onDayClick(day)}
              className={`flex! flex-col! p-2! rounded-2xl! border! border-zinc-100/50! dark:border-slate-700/20! bg-white/30! dark:bg-slate-900/30! cursor-pointer! transition-all! hover:bg-white/70! dark:hover:bg-slate-900/70! overflow-hidden! ${
                inMonth ? "" : "opacity-30!"
              }`}
            >
              <div className="flex! justify-end! mb-1!">
                <div
                  className={`flex! items-center! justify-center! w-7! h-7! text-xs! font-bold! rounded-full! ${
                    current ? todayClass : "text-zinc-500! dark:text-zinc-400!"
                  }`}
                >
                  {day.date()}
                </div>
              </div>

              <div className="flex-1! space-y-1! overflow-y-auto! no-scrollbar!">
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
                      placement="right"
                      overlayClassName="calendar-event-popover"
                    >
                      <div
                        className={`text-[10px]! font-medium! py-1! px-2! rounded-lg! truncate! transition-all! shadow-sm! ${getEventColorClasses(
                          task.color
                        )}`}
                      >
                        {task.time} {task.title}
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
