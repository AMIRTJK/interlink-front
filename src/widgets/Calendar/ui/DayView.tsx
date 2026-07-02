import React, { useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Popover, Avatar, Tooltip } from "antd";
import { ClockCircleOutlined, CalendarOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { If } from "@shared/ui";
import type { Task } from "@features/tasks";

interface IDayViewProps {
  currentDate: Dayjs;
  tasks: Task[];
  onDeleteEvent: (id: string) => void;
  onDayClick: (date: Dayjs) => void;
}

const getEventColorClasses = (color?: string) => {
  const lowerColor = color?.toLowerCase();
  if (lowerColor === "#29cc39" || lowerColor === "green" || lowerColor === "#166534") {
    return "bg-emerald-50! border-emerald-200! text-emerald-700! dark:bg-emerald-950/20! dark:border-emerald-800/30!";
  }
  if (lowerColor === "#ffcb33" || lowerColor === "yellow") {
    return "bg-yellow-50! border-yellow-200! text-yellow-700! dark:bg-yellow-950/20! dark:border-yellow-800/30!";
  }
  if (lowerColor === "#ff6633" || lowerColor === "orange") {
    return "bg-orange-50! border-orange-200! text-orange-700! dark:bg-orange-950/20! dark:border-orange-800/30!";
  }
  if (lowerColor === "#cc7429" || lowerColor === "bronze") {
    return "bg-amber-50! border-amber-200! text-amber-800! dark:bg-amber-950/20! dark:border-amber-800/30!";
  }
  if (lowerColor === "#8833ff" || lowerColor === "purple" || lowerColor === "#af52de") {
    return "bg-indigo-50! border-indigo-200! text-indigo-700! dark:bg-indigo-950/20! dark:border-indigo-800/30!";
  }
  if (lowerColor === "#33bfff" || lowerColor === "blue") {
    return "bg-sky-50! border-sky-200! text-sky-700! dark:bg-sky-950/20! dark:border-sky-800/30!";
  }
  if (lowerColor === "#e62e7b" || lowerColor === "pink" || lowerColor === "#f43f5e") {
    return "bg-rose-50! border-rose-200! text-rose-700! dark:bg-rose-950/20! dark:border-rose-800/30!";
  }
  if (lowerColor === "#2ee6ca" || lowerColor === "tiffany" || lowerColor === "#10b981") {
    return "bg-teal-50! border-teal-200! text-teal-700! dark:bg-teal-950/20! dark:border-teal-800/30!";
  }
  return "bg-emerald-50! border-emerald-200! text-emerald-700! dark:bg-emerald-950/20! dark:border-emerald-800/30!";
};

const getEventDotStyle = (color?: string) => {
  return { backgroundColor: color || "#10B981" };
};

export const DayView = ({
  currentDate,
  tasks,
  onDeleteEvent,
  onDayClick,
}: IDayViewProps) => {
  const dayTasks = useMemo(() => {
    const targetDate = currentDate.format("YYYY-MM-DD");
    return tasks.filter((task) => task.date === targetDate);
  }, [currentDate, tasks]);

  const formattedDayName = useMemo(() => {
    const formatted = currentDate.format("dddd");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [currentDate]);

  return (
    <div
      onClick={() => onDayClick(currentDate)}
      className="w-full! bg-white/40! dark:bg-slate-800/40! rounded-3xl! p-6! border! border-white/20! dark:border-slate-700/30! shadow-sm! min-h-[400px]! cursor-pointer!"
    >
      <div className="flex! items-center! justify-between! mb-6! border-b! border-zinc-100! dark:border-slate-800! pb-4!">
        <div>
          <h2 className="text-xl! font-extrabold! text-zinc-800! dark:text-zinc-100! m-0!">
            {currentDate.format("D MMMM YYYY")} г.
          </h2>
          <p className="text-sm! font-semibold! text-zinc-400! m-0! mt-0.5!">
            {formattedDayName}
          </p>
        </div>
        <span className="text-xs! font-bold! text-zinc-400! bg-zinc-100! dark:bg-slate-800! px-3! py-1.5! rounded-full!">
          Событий: {dayTasks.length}
        </span>
      </div>

      <div className="space-y-4!">
        <If is={dayTasks.length === 0}>
          <div className="flex! flex-col! items-center! justify-center! text-zinc-400! italic! py-20!">
            <CalendarOutlined className="text-4xl! mb-3! opacity-35!" />
            <span>Нет запланированных событий на этот день</span>
            <span className="text-xs! mt-1! opacity-75!">Нажмите в любое место, чтобы создать событие</span>
          </div>
        </If>

        {dayTasks.map((task) => (
          <div
            key={task.id}
            onClick={(e) => e.stopPropagation()}
            className={`flex! flex-col! md:flex-row! md:items-center! justify-between! p-4! rounded-2xl! border! shadow-sm! transition-all! hover:shadow-md! ${getEventColorClasses(
              task.color
            )}`}
          >
            <div className="flex! items-start! gap-4!">
              <div
                className="w-3! h-3! rounded-full! mt-1.5! flex-shrink-0!"
                style={getEventDotStyle(task.color)}
              />
              <div className="space-y-1!">
                <div className="flex! items-center! gap-2! flex-wrap!">
                  <span className="font-bold! text-zinc-900! dark:text-zinc-100! text-base!">
                    {task.title}
                  </span>
                  <div className="flex! items-center! gap-1! text-xs! font-bold! text-zinc-500! dark:text-zinc-400! bg-white/60! dark:bg-slate-900/60! px-2.5! py-1! rounded-full!">
                    <ClockCircleOutlined />
                    <span>
                      {task.time}
                      {task.endTime ? ` - ${task.endTime}` : ""}
                    </span>
                  </div>
                </div>
                <If is={task.description}>
                  <p className="text-sm! text-zinc-600! dark:text-zinc-300! leading-relaxed! whitespace-pre-wrap! max-w-2xl!">
                    {task.description}
                  </p>
                </If>

                <If is={task.participants && task.participants.length > 0}>
                  <div className="flex! items-center! gap-2! mt-2!">
                    <span className="text-[10px]! font-bold! uppercase! text-zinc-400!">Участники:</span>
                    <Avatar.Group size="small" maxCount={5}>
                      {task.participants?.map((p) => (
                        <Tooltip key={p.id} title={p.name}>
                          <Avatar src={p.avatar} icon={<UserOutlined />} />
                        </Tooltip>
                      ))}
                    </Avatar.Group>
                  </div>
                </If>
              </div>
            </div>

            <div className="flex! items-center! gap-2! mt-4! md:mt-0! self-end! md:self-center!">
              <button
                onClick={() => onDeleteEvent(task.id)}
                className="flex! items-center! gap-1.5! text-red-500! hover:text-red-600! font-semibold! text-xs! transition-colors! cursor-pointer! bg-transparent! border-none! p-0!"
              >
                <DeleteOutlined />
                <span>Удалить</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
