import { useMemo, memo } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Task } from "@features/tasks";
import { useCalendarTheme } from "../lib/useCalendarTheme";

interface IMonthViewProps {
  daysToShow: Dayjs[];
  tasks: Task[];
  currentDate: Dayjs;
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs) => void;
  onEventClick: (task: Task) => void;
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

export const MonthView = memo(({
  daysToShow,
  tasks,
  currentDate,
  onDayClick,
  onEventClick,
}: IMonthViewProps) => {
  const { theme } = useCalendarTheme();

  const tasksMap = useMemo(() => {
    const map: Record<string, Task[]> = {};
    tasks.forEach((task) => {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    });
    return map;
  }, [tasks]);

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
          const dateStr = day.format("YYYY-MM-DD");
          const dayTasks = tasksMap[dateStr] || [];
          const inMonth = day.month() === currentDate.month();
          const current = day.isSame(dayjs(), "day");

          return (
            <div
              key={dateStr}
              onClick={() => onDayClick(day)}
              className={`flex! flex-col! p-2! rounded-2xl! border! border-zinc-100/50! dark:border-slate-700/20! bg-white/30! dark:bg-slate-900/30! cursor-pointer! transition-all! hover:bg-white/70! dark:hover:bg-slate-900/70! overflow-hidden! ${
                inMonth ? "" : "opacity-30!"
              }`}
            >
              <div className="flex! justify-end! mb-1!">
                <div
                  className={`flex! items-center! justify-center! w-7! h-7! text-xs! font-bold! rounded-full! ${
                    current ? `bg-gradient-to-r! ${theme.gradient} text-white!` : "text-zinc-500! dark:text-zinc-400!"
                  }`}
                >
                  {day.date()}
                </div>
              </div>

              <div className="flex-1! space-y-1! overflow-y-auto! no-scrollbar!">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(task);
                    }}
                    className={`text-[10px]! font-medium! py-1! px-2! rounded-lg! truncate! transition-all! shadow-sm! cursor-pointer! ${getEventColorClasses(
                      task.color
                    )}`}
                  >
                    {task.time} {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
