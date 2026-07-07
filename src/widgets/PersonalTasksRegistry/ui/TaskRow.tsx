import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { Dropdown } from "antd";
import { If } from "@shared/ui/If";
import type { IPersonalTask, TPriority, TTaskStatus } from "../model/types";
import { formatDueDate, getCountdown } from "../lib/helpers";

interface IProps {
  task: IPersonalTask;
  isSelected: boolean;
  onSelectToggle: (id: number) => void;
  onOpen: (task: IPersonalTask) => void;
  onEdit: (task: IPersonalTask) => void;
  onDelete: (id: number) => void;
  userName: string;
}

const PRIORITY_BADGES = {
  critical: { bg: "bg-red-100 text-red-750", dot: "bg-red-500", label: "Критичный" },
  high: { bg: "bg-orange-100 text-orange-755", dot: "bg-orange-500", label: "Высокий" },
  medium: { bg: "bg-blue-100 text-blue-755", dot: "bg-blue-500", label: "Средний" },
  low: { bg: "bg-green-100 text-green-755", dot: "bg-green-500", label: "Низкий" },
};

const STATUS_BADGES = {
  new: { bg: "bg-blue-100 text-blue-755", dot: "bg-blue-500", label: "Новая" },
  in_progress: { bg: "bg-blue-100 text-blue-755", dot: "bg-blue-500", label: "В работе" },
  review: { bg: "bg-violet-100 text-violet-755", dot: "bg-violet-500", label: "На ревью" },
  completed: { bg: "bg-emerald-100 text-emerald-755", dot: "bg-emerald-500", label: "Завершена" },
  overdue: { bg: "bg-red-100 text-red-755", dot: "bg-red-500", label: "Просрочена" },
};

export const TaskRow = ({ task, isSelected, onSelectToggle, onOpen, onEdit, onDelete, userName }: IProps) => {
  const pBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
  const sBadge = STATUS_BADGES[task.status] || STATUS_BADGES.new;
  const countMeta = getCountdown(task.due_date);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  const menuItems = [
    { key: "edit", label: "Редактировать", onClick: () => onEdit(task) },
    { key: "delete", label: "Удалить", danger: true, onClick: () => onDelete(task.id) },
  ];

  return (
    <motion.tr
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => onOpen(task)}
      className="group border-b border-zinc-100 dark:border-zinc-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-all duration-150 cursor-pointer"
    >
      <td className="px-4 py-3.5 align-top" onClick={(e) => { e.stopPropagation(); onSelectToggle(task.id); }}>
        <button
          type="button"
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors border-zinc-300 dark:border-zinc-600 text-transparent hover:border-zinc-400 cursor-pointer bg-transparent ${
            isSelected ? "bg-indigo-650! border-indigo-655! text-white!" : ""
          }`}
          aria-label={`Выбрать ${task.title}`}
        >
          <If is={isSelected}>
            <span className="text-[10px] font-black leading-none">✓</span>
          </If>
        </button>
      </td>

      <td className="px-4 py-3.5 align-top">
        <span className="text-xs font-mono font-semibold text-zinc-400 dark:text-zinc-500">TSK-{task.id}</span>
      </td>

      <td className="px-4 py-3.5 align-top min-w-[240px]">
        <div className="font-semibold text-sm text-zinc-800 dark:text-zinc-100 leading-snug">{task.title}</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {task.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              #{tag}
            </span>
          ))}
        </div>
      </td>

      <td className="px-4 py-3.5 align-top">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pBadge.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${pBadge.dot}`} /> {pBadge.label}
        </span>
      </td>

      <td className="px-4 py-3.5 align-top">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${sBadge.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sBadge.dot}`} /> {sBadge.label}
        </span>
      </td>

      <td className="px-4 py-3.5 align-top">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 bg-zinc-500">{getInitials(userName)}</span>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">{userName}</span>
        </div>
      </td>

      <td className="px-4 py-3.5 align-top min-w-[140px]">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
            <div className={`h-full rounded-full ${task.status === "overdue" ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${task.progress}%` }} />
          </div>
          <span className="text-xs font-mono font-semibold text-zinc-500 dark:text-zinc-400 w-8 text-right">{task.progress}%</span>
        </div>
      </td>

      <td className="px-4 py-3.5 align-top min-w-[160px]">
        <If is={task.status === "completed"}>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
            <span>✓</span><span>Завершено</span>
          </span>
        </If>
        <If is={task.status !== "completed"}>
          <If is={countMeta.type === "overdue"}>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>Просрочено</span>
            </span>
          </If>
          <If is={countMeta.type !== "overdue"}>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <span>●</span><span>{countMeta.text}</span>
            </span>
          </If>
        </If>
      </td>

      <td className="px-4 py-3.5 align-top relative text-right" onClick={(e) => e.stopPropagation()}>
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <button className="p-1.5 rounded-lg text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-0 bg-transparent cursor-pointer flex items-center justify-center">
            <MoreVertical size={16} />
          </button>
        </Dropdown>
      </td>
    </motion.tr>
  );
};
