import React, { useState } from "react";
import { Search, Calendar, X, Loader2 } from "lucide-react";
import { cn, useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

export type PriorityLevel = "low" | "medium" | "high";

export interface ExecutorUser {
  id: number;
  full_name: string;
  phone: string;
}

const AVATAR_COLORS = [
  "bg-blue-50 text-blue-600 border-blue-100",
  "bg-emerald-50 text-emerald-600 border-emerald-100",
  "bg-purple-50 text-purple-600 border-purple-100",
  "bg-amber-50 text-amber-600 border-amber-100",
  "bg-rose-50 text-rose-600 border-rose-100",
  "bg-indigo-50 text-indigo-600 border-indigo-100",
];

const getInitials = (fullName: string) => {
  if (!fullName) return "??";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const priorityConfig: Record<
  PriorityLevel,
  { label: string; activeClass: string; inactiveClass: string }
> = {
  low: {
    label: "Низкий",
    activeClass: "bg-emerald-500 text-white border-emerald-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-emerald-300",
  },
  medium: {
    label: "Средний",
    activeClass: "bg-amber-500 text-white border-amber-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-amber-300",
  },
  high: {
    label: "Высокий",
    activeClass: "bg-rose-500 text-white border-rose-500",
    inactiveClass: "border-slate-200 text-slate-500 hover:border-rose-300",
  },
};
const priorityKeys: PriorityLevel[] = ["low", "medium", "high"];

interface IProps {
  selectedExecutor: ExecutorUser | null;
  setSelectedExecutor: (u: ExecutorUser | null) => void;
  taskText: string;
  setTaskText: (v: string) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  priority: PriorityLevel;
  setPriority: (p: PriorityLevel) => void;
  note: string;
  setNote: (v: string) => void;
}

export const TaskFormFields: React.FC<IProps> = ({
  selectedExecutor,
  setSelectedExecutor,
  taskText,
  setTaskText,
  deadline,
  setDeadline,
  priority,
  setPriority,
  note,
  setNote,
}) => {
  const [searchParams, setSearchParams] = useState({ query: "" });
  const [showExecutorDropdown, setShowExecutorDropdown] = useState(false);

  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS,
    useToken: true,
    params: searchParams,
  });

  const apiUsersList: ExecutorUser[] =
    usersData?.data?.data && Array.isArray(usersData.data.data)
      ? usersData.data.data
      : Array.isArray(usersData)
        ? usersData
        : [];

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-left">
      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Исполнитель
        </label>
        <div className="relative">
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            {selectedExecutor ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 border",
                    AVATAR_COLORS[selectedExecutor.id % AVATAR_COLORS.length],
                  )}
                >
                  {getInitials(selectedExecutor.full_name)}
                </div>
                <span className="text-sm text-slate-800 flex-1 truncate">
                  {selectedExecutor.full_name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExecutor(null);
                    setSearchParams({ query: "" });
                  }}
                  className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={searchParams.query}
                onChange={(e) => {
                  setSearchParams({ query: e.target.value });
                  setShowExecutorDropdown(true);
                }}
                onFocus={() => setShowExecutorDropdown(true)}
                onBlur={() => setTimeout(() => setShowExecutorDropdown(false), 150)}
                placeholder="Найти исполнителя..."
                className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent min-w-0"
              />
            )}
            {loadingUsers && !selectedExecutor && (
              <Loader2 size={13} className="animate-spin text-indigo-400 flex-shrink-0" />
            )}
          </div>
          {showExecutorDropdown && !selectedExecutor && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 overflow-y-auto max-h-48">
              {loadingUsers && apiUsersList.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-3 text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Загрузка...</span>
                </div>
              ) : apiUsersList.length > 0 ? (
                apiUsersList.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onMouseDown={() => {
                      setSelectedExecutor(u);
                      setShowExecutorDropdown(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border",
                        AVATAR_COLORS[u.id % AVATAR_COLORS.length],
                      )}
                    >
                      {getInitials(u.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {u.full_name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate font-mono">
                        {u.phone}
                      </p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">Ничего не найдено</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Поручение
        </label>
        <textarea
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Опишите задачу..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none transition-all"
        />
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Срок исполнения
        </label>
        <div className="relative">
          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm text-slate-800 outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Приоритет
        </label>
        <div className="flex rounded-xl overflow-hidden border border-slate-200">
          {priorityKeys.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold transition-all border-r last:border-r-0 border-slate-200 cursor-pointer",
                priority === p ? priorityConfig[p].activeClass : priorityConfig[p].inactiveClass,
              )}
            >
              {priorityConfig[p].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
          Примечание
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Дополнительные сведения..."
          rows={2}
          className="w-full rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none transition-all"
        />
      </div>
    </div>
  );
};
