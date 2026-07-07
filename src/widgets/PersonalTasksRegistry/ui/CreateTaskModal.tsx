import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Lock, X, ChevronDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { If } from "@shared/ui/If";
import type { IPersonalTask, TPriority, TTaskStatus } from "../model/types";

interface IProps {
  onClose: () => void;
  task: IPersonalTask | null;
  userName: string;
  onSave: (values: { title: string; description: string; priority: TPriority; status: TTaskStatus; due_date: string; tags: string[]; progress: number }) => void;
  isSaving: boolean;
  activeTheme: any;
}

const PRIORITY_OPTIONS: { value: TPriority; label: string; color: string }[] = [
  { value: "low", label: "Низкий", color: "bg-green-500" }, { value: "medium", label: "Средний", color: "bg-amber-500" },
  { value: "high", label: "Высокий", color: "bg-orange-500" }, { value: "critical", label: "Критичный", color: "bg-red-500" }
];

const STATUS_OPTIONS: { value: TTaskStatus; label: string; color: string }[] = [
  { value: "new", label: "Новая", color: "bg-blue-500" }, { value: "in_progress", label: "В работе", color: "bg-indigo-500" },
  { value: "review", label: "На ревью", color: "bg-purple-500" }, { value: "completed", label: "Завершена", color: "bg-emerald-500" },
  { value: "overdue", label: "Просрочена", color: "bg-rose-500" }
];

export const CreateTaskModal = ({ onClose, task, userName, onSave, isSaving, activeTheme }: IProps) => {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TPriority>("medium");
  const [status, setStatus] = React.useState<TTaskStatus>("new");
  const [dueDate, setDueDate] = React.useState("");
  const [tagsInput, setTagsInput] = React.useState("");
  const [priorityOpen, setPriorityOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [dateOpen, setDateOpen] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState(new Date());

  React.useEffect(() => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setPriority(task?.priority || "medium");
    setStatus(task?.status || "new");
    setDueDate(task?.due_date ? task.due_date.split("T")[0] : "");
    setTagsInput(task?.tags ? task.tags.join(", ") : "");
  }, [task]);

  const daysInMonth = React.useMemo(() => {
    const d = [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    while (date.getMonth() === currentDate.getMonth()) {
      d.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return d;
  }, [currentDate]);

  const paddingDays = React.useMemo(() => {
    const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    return startDay === 0 ? 6 : startDay - 1;
  }, [currentDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) onSave({ title: title.trim(), description, priority, status, due_date: dueDate, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean), progress: task ? task.progress : 0 });
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
  };

  const selectedPriority = PRIORITY_OPTIONS.find((o) => o.value === priority) || PRIORITY_OPTIONS[1];
  const selectedStatus = STATUS_OPTIONS.find((o) => o.value === status) || STATUS_OPTIONS[0];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden flex flex-col z-10"
      >
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          <div className={`px-6 py-5 bg-gradient-to-r ${activeTheme.gradient} text-white flex items-center justify-between`}>
            <h3 className="font-bold text-lg text-white m-0 leading-none">
              <If is={!!task}>Редактировать задачу</If>
              <If is={!task}>Новая задача</If>
            </h3>
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white border-0 bg-transparent cursor-pointer flex items-center justify-center">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto bg-white dark:bg-zinc-800">
            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Название задачи</label>
              <input type="text" required placeholder="Например: Разработка нового модуля" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200" />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Описание</label>
              <textarea rows={3} placeholder="Детали задачи…" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-slate-800 dark:text-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Приоритет</label>
                <button type="button" onClick={() => setPriorityOpen(!priorityOpen)} onBlur={() => setTimeout(() => setPriorityOpen(false), 200)} className="w-full bg-zinc-100 dark:bg-zinc-900 border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border-zinc-200 dark:border-zinc-700 text-slate-855 dark:text-slate-200 text-left flex items-center justify-between cursor-pointer bg-transparent">
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedPriority.color}`} />
                    {selectedPriority.label}
                  </span>
                  <ChevronDown size={14} className="text-zinc-400" />
                </button>
                <If is={priorityOpen}>
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden py-1">
                    {PRIORITY_OPTIONS.map((o) => (
                      <button key={o.value} type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setPriority(o.value); setPriorityOpen(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-slate-800 dark:text-slate-200 flex items-center gap-2 border-0 bg-transparent">
                        <span className={`w-1.5 h-1.5 rounded-full ${o.color}`} />
                        {o.label}
                      </button>
                    ))}
                  </div>
                </If>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Статус</label>
                <button type="button" onClick={() => setStatusOpen(!statusOpen)} onBlur={() => setTimeout(() => setStatusOpen(false), 200)} className="w-full bg-zinc-100 dark:bg-zinc-900 border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all border-zinc-200 dark:border-zinc-700 text-slate-855 dark:text-slate-200 text-left flex items-center justify-between cursor-pointer bg-transparent">
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedStatus.color}`} />
                    {selectedStatus.label}
                  </span>
                  <ChevronDown size={14} className="text-zinc-400" />
                </button>
                <If is={statusOpen}>
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden py-1">
                    {STATUS_OPTIONS.map((o) => (
                      <button key={o.value} type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setStatus(o.value); setStatusOpen(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-slate-800 dark:text-slate-200 flex items-center gap-2 border-0 bg-transparent">
                        <span className={`w-1.5 h-1.5 rounded-full ${o.color}`} />
                        {o.label}
                      </button>
                    ))}
                  </div>
                </If>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Срок</label>
              <button type="button" onClick={() => setDateOpen(!dateOpen)} onBlur={() => setTimeout(() => setDateOpen(false), 200)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-200 text-left flex items-center justify-between cursor-pointer bg-transparent">
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-zinc-400" />
                  {dueDate ? new Date(dueDate).toLocaleDateString("ru-RU") : "Выберите дату"}
                </span>
                <ChevronDown size={14} className="text-zinc-400" />
              </button>
              <If is={dateOpen}>
                <div className="absolute z-20 right-0 bottom-full mb-1 w-[280px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)); }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-slate-705 dark:text-slate-200 border-0 bg-transparent cursor-pointer flex items-center justify-center">
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">{currentDate.toLocaleString("ru-RU", { month: "long", year: "numeric" })}</span>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)); }} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-slate-705 dark:text-slate-200 border-0 bg-transparent cursor-pointer flex items-center justify-center">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-wider">
                    <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 justify-items-center">
                    {Array.from({ length: paddingDays }).map((_, i) => <div key={i} className="h-8 w-8" />)}
                    {daysInMonth.map((d) => {
                      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                      const isSelected = dateStr === dueDate;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setDueDate(dateStr); setDateOpen(false); }}
                          className={`h-8 w-8 text-xs font-bold rounded-xl flex items-center justify-center border-0 cursor-pointer transition-all ${isSelected ? `bg-gradient-to-r ${activeTheme.gradient} text-white shadow-md` : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-200 bg-transparent"}`}
                        >
                          {d.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </If>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5"><Lock size={12} /> Исполнитель</label>
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 opacity-80 cursor-not-allowed select-none">
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 bg-zinc-500">{getInitials(userName)}</span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200 flex-1 truncate">{userName}</span>
                <Lock size={14} className="text-zinc-400 flex-shrink-0" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">Теги (через запятую)</label>
              <input type="text" placeholder="backend, security" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800 dark:text-slate-200" />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3 bg-white dark:bg-zinc-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border-0 bg-transparent cursor-pointer">Отмена</button>
            <button type="submit" disabled={isSaving} className={`px-5 py-2.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r ${activeTheme.gradient} hover:opacity-90 transition-all shadow-md border-0 cursor-pointer disabled:opacity-50`}>
              <If is={isSaving}>
                <If is={!!task}>Сохранение...</If>
                <If is={!task}>Создание...</If>
              </If>
              <If is={!isSaving}>
                <If is={!!task}>Сохранить</If>
                <If is={!task}>Создать задачу</If>
              </If>
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body,
  );
};
