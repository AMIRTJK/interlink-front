import React from "react";
import { Clock } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";

export interface IAssignmentUser {
  id: number;
  full_name?: string;
  position?: string;
  photo_url?: string;
}

export interface IAssignmentData {
  id: number;
  text?: string;
  due_at?: string | null;
  priority?: string;
  note?: string | null;
  status?: string;
  assignee?: IAssignmentUser;
  executor?: IAssignmentUser;
  user?: IAssignmentUser;
}

const PRIORITY_MAP: Record<string, { label: string; bg: string; text: string; border: string }> = {
  low: { label: "Низкий", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  medium: { label: "Средний", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  high: { label: "Высокий", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  urgent: { label: "Срочный", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "В работе", bg: "bg-blue-50", text: "text-blue-600" },
  submitted: { label: "На проверке", bg: "bg-amber-50", text: "text-amber-600" },
  done: { label: "Исполнено", bg: "bg-emerald-50", text: "text-emerald-600" },
  returned: { label: "Доработка", bg: "bg-rose-50", text: "text-rose-600" },
};

const getInitials = (name?: string) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};

export const TaskItemCard = ({ item }: { item: IAssignmentData }) => {
  const user = item.assignee || item.executor || item.user || {};
  const prioKey = (item.priority || "medium").toLowerCase();
  const prio = PRIORITY_MAP[prioKey] || PRIORITY_MAP.medium;
  const statusKey = (item.status || "pending").toLowerCase();
  const status = STATUS_MAP[statusKey] || STATUS_MAP.pending;

  return (
    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs font-sans">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold flex items-center justify-center text-[11px] flex-shrink-0 shadow-sm">
            {getInitials(user.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-800 truncate text-xs">
              {user.full_name || "Не указан"}
            </p>
            <If is={!!user.position}>
              <p className="text-[10px] text-slate-400 truncate">{user.position}</p>
            </If>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border", prio.bg, prio.text, prio.border)}>
            {prio.label}
          </span>
        </div>
      </div>

      <If is={!!item.text}>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
            Текст поручения
          </span>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {item.text}
          </p>
        </div>
      </If>

      <If is={!!item.due_at}>
        <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
          <Clock size={13} className="text-indigo-500 flex-shrink-0" />
          <span className="font-semibold">Срок:</span>
          <span>{new Date(item.due_at!).toLocaleDateString("ru-RU")}</span>
        </div>
      </If>

      <If is={!!item.note}>
        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px]">
          <span className="font-semibold text-amber-800 block mb-0.5">Примечание:</span>
          <p className="text-amber-900 leading-normal">{item.note}</p>
        </div>
      </If>

      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100">
        <span>Статус:</span>
        <span className={cn("px-2 py-0.5 rounded-md font-semibold", status.bg, status.text)}>
          {status.label}
        </span>
      </div>
    </div>
  );
};
