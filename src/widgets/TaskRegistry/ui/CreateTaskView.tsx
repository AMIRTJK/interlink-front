import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ListPlus,
  X,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Trash2,
  Pen,
} from "lucide-react";
import { cn } from "@shared/lib";
import type {
  BatchRow,
  Colleague,
  Priority,
  SubRow,
  TaskPayload,
  TaskStatus,
  TaskType,
} from "../model/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../model/constants";
import { signTimestamp } from "../lib/helpers";
import { Avatar } from "./Avatar";

interface CreateTaskViewProps {
  colleagues: Colleague[];
  onBack: () => void;
  /** Создаёт одну или несколько задач через API. */
  onCreate: (payloads: TaskPayload[]) => Promise<void>;
}

export const CreateTaskView = ({ colleagues, onBack, onCreate }: CreateTaskViewProps) => {
  const firstId = colleagues[0]?.id ?? "";
  const [isSaving, setIsSaving] = React.useState(false);

  // --- Personal form state ---
  const [formTitle, setFormTitle] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");
  const [formTags, setFormTags] = React.useState("");
  const [formPriority, setFormPriority] = React.useState<Priority>("medium");
  const [formStatus, setFormStatus] = React.useState<TaskStatus>("new");
  const [formDueDate, setFormDueDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [formAssignees, setFormAssignees] = React.useState<string[]>([firstId]);
  const [assigneeQuery, setAssigneeQuery] = React.useState("");
  const [assigneeOpen, setAssigneeOpen] = React.useState(false);
  const [titleError, setTitleError] = React.useState(false);
  const [taskType, setTaskType] = React.useState<TaskType>("personal");

  // --- Protocol (batch) state ---
  const [batchGlobal, setBatchGlobal] = React.useState({
    chairmanId: firstId,
    participants: [] as string[],
    date: new Date().toISOString().split("T")[0],
    number: "",
  });
  const [participantsQuery, setParticipantsQuery] = React.useState("");
  const [participantsOpen, setParticipantsOpen] = React.useState(false);
  const [batchRows, setBatchRows] = React.useState<BatchRow[]>([
    { id: 1, title: "", priority: "medium", status: "new", assigneeId: firstId },
  ]);
  const [subRowsMap, setSubRowsMap] = React.useState<Record<number, SubRow[]>>({});
  const [expandedRows, setExpandedRows] = React.useState<number[]>([]);
  const [chairmanSelectOpen, setChairmanSelectOpen] = React.useState(false);
  const [secretaryId, setSecretaryId] = React.useState<string>("");
  const [secretaryAdding, setSecretaryAdding] = React.useState(false);
  const [secretaryQuery, setSecretaryQuery] = React.useState("");
  const [secretaryOpen, setSecretaryOpen] = React.useState(false);
  const [chairmanSigned, setChairmanSigned] = React.useState<string | null>(null);
  const [secretarySigned, setSecretarySigned] = React.useState<string | null>(null);

  const toAssigneeIds = (ids: string[]): number[] =>
    ids.map((id) => Number(id)).filter((n) => Number.isFinite(n) && n > 0);

  const handleCreateTask = async () => {
    if (!formTitle.trim()) {
      setTitleError(true);
      return;
    }
    if (isSaving) return;
    const payload: TaskPayload = {
      title: formTitle.trim(),
      description: formDescription,
      priority: formPriority,
      status: formStatus,
      due_date: formDueDate || null,
      tags: formTags.split(",").map((t) => t.trim()).filter((t) => t !== ""),
      progress: 0,
      assignees: toAssigneeIds(formAssignees),
    };
    setIsSaving(true);
    try {
      await onCreate([payload]);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAssignee = (id: string) => {
    setFormAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
    setAssigneeQuery("");
  };

  // --- Batch helpers ---
  const filledBatchCount = batchRows.filter((r) => r.title.trim() !== "").length;
  const addBatchRow = () => {
    if (batchRows.length < 20) {
      setBatchRows((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: "",
          priority: "medium",
          status: "new",
          assigneeId: batchGlobal.chairmanId,
        },
      ]);
    }
  };
  const removeBatchRow = (id: number) => {
    if (batchRows.length > 1) {
      setBatchRows((prev) => prev.filter((r) => r.id !== id));
    }
  };
  const updateBatchRow = (id: number, field: keyof BatchRow, value: string) => {
    setBatchRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };
  const handleBatchCreate = async () => {
    if (isSaving) return;
    const filledRows = batchRows.filter((r) => r.title.trim() !== "");
    if (filledRows.length === 0) return;
    const protocolTag = batchGlobal.number.trim()
      ? `протокол №${batchGlobal.number.trim()}`
      : "протокол";
    const payloads: TaskPayload[] = filledRows.map((row) => {
      const subs = (subRowsMap[row.id] || [])
        .map((s) => s.title.trim())
        .filter(Boolean);
      const description = subs.length
        ? `Подпункты:\n${subs.map((s) => `• ${s}`).join("\n")}`
        : "";
      return {
        title: row.title.trim(),
        description,
        status: row.status,
        priority: row.priority,
        due_date: batchGlobal.date || null,
        tags: ["протокол", protocolTag].filter(
          (t, i, arr) => arr.indexOf(t) === i,
        ),
        progress: 0,
        assignees: toAssigneeIds([row.assigneeId]),
      };
    });
    setIsSaving(true);
    try {
      await onCreate(payloads);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Sub-row helpers ---
  const toggleRowExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };
  const addSubRow = (rowId: number) => {
    setSubRowsMap((prev) => ({
      ...prev,
      [rowId]: [
        ...(prev[rowId] || []),
        { id: Date.now() + Math.floor(Math.random() * 1000), title: "" },
      ],
    }));
  };
  const updateSubRow = (rowId: number, subId: number, title: string) => {
    setSubRowsMap((prev) => ({
      ...prev,
      [rowId]: (prev[rowId] || []).map((s) => (s.id === subId ? { ...s, title } : s)),
    }));
  };
  const removeSubRow = (rowId: number, subId: number) => {
    setSubRowsMap((prev) => ({
      ...prev,
      [rowId]: (prev[rowId] || []).filter((s) => s.id !== subId),
    }));
  };

  const toggleParticipant = (id: string) => {
    setBatchGlobal((prev) => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter((p) => p !== id)
        : [...prev.participants, id],
    }));
    setParticipantsQuery("");
  };

  const filteredColleagues = colleagues.filter(
    (c) =>
      !formAssignees.includes(c.id) &&
      c.name.toLowerCase().includes(assigneeQuery.toLowerCase()),
  );
  const chairmanColleague =
    colleagues.find((c) => c.id === batchGlobal.chairmanId) || null;
  const filteredParticipantOptions = colleagues.filter(
    (c) =>
      !batchGlobal.participants.includes(c.id) &&
      c.name.toLowerCase().includes(participantsQuery.toLowerCase()),
  );
  const secretaryColleague = colleagues.find((c) => c.id === secretaryId) || null;
  const filteredSecretaryOptions = colleagues.filter(
    (c) =>
      c.id !== secretaryId &&
      c.name.toLowerCase().includes(secretaryQuery.toLowerCase()),
  );

  return (
    <motion.main
      key="create"
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="w-full pb-10 relative z-10 flex flex-col gap-8 min-h-screen"
    >
      {/* Create Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
            Назад
          </button>
          <h1 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Новая задача
          </h1>
        </div>
        <button
          onClick={handleCreateTask}
          disabled={isSaving}
          className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 hover:brightness-110 rounded-2xl text-sm font-bold text-white shadow-xl shadow-emerald-200 dark:shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
        >
          <Plus size={18} />
          {isSaving ? "Сохранение..." : "Создать задачу"}
        </button>
      </header>

      {/* Task type segmented control */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Тип
        </span>
        <div className="inline-flex p-1.5 bg-white/50 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl shadow-sm">
          <button
            onClick={() => setTaskType("personal")}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              taskType === "personal"
                ? "text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100",
            )}
          >
            {taskType === "personal" && (
              <motion.div
                layoutId="taskTypePill"
                className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl shadow-lg shadow-emerald-900/10"
              />
            )}
            <span className="relative z-10">Персональная задача</span>
          </button>
          <button
            onClick={() => setTaskType("protocol")}
            className={cn(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
              taskType === "protocol"
                ? "text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100",
            )}
          >
            {taskType === "protocol" && (
              <motion.div
                layoutId="taskTypePill"
                className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl shadow-lg shadow-emerald-900/10"
              />
            )}
            <span className="relative z-10">Протокол</span>
          </button>
        </div>
      </div>

      {/* Content switch */}
      <AnimatePresence mode="wait">
        {taskType === "personal" ? (
          <motion.div
            key="personal-form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left two columns */}
            <div className="lg:col-span-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Название задачи <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => {
                    setFormTitle(e.target.value);
                    if (e.target.value.trim()) setTitleError(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium text-slate-700 dark:text-slate-100",
                    titleError
                      ? "border-red-500 ring-1 ring-red-200"
                      : "border-white/30 dark:border-white/10",
                  )}
                  placeholder="Напр: Оптимизация процесса деплоя"
                />
                {titleError && (
                  <p className="text-[10px] font-bold text-red-500 uppercase">
                    Название обязательно
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Описание
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full h-40 px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium text-slate-700 dark:text-slate-100 resize-none"
                  placeholder="Подробно опишите задачу..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Теги (через запятую)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium text-slate-700 dark:text-slate-100"
                  placeholder="Backend, API, High Priority"
                />
              </div>
            </div>

            {/* Right column */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Приоритет
                </label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as Priority)}
                  className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl outline-none font-medium text-slate-700 dark:text-slate-100"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Статус
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                  className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl outline-none font-medium text-slate-700 dark:text-slate-100"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Срок выполнения
                </label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl outline-none font-medium text-slate-700 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Исполнители
                </label>
                {formAssignees.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formAssignees.map((id) => {
                      const col = colleagues.find((c) => c.id === id)!;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-2 pl-1.5 pr-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full shadow-sm"
                        >
                          <Avatar colleague={col} className="w-6 h-6 text-[9px]" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            {col.name.split(" ")[0]}
                          </span>
                          <button
                            onClick={() => toggleAssignee(id)}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <input
                  type="text"
                  value={assigneeQuery}
                  onChange={(e) => {
                    setAssigneeQuery(e.target.value);
                    setAssigneeOpen(true);
                  }}
                  onFocus={() => setAssigneeOpen(true)}
                  onBlur={() => setTimeout(() => setAssigneeOpen(false), 150)}
                  className="w-full px-4 py-3 bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/30 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-medium text-slate-700 dark:text-slate-100"
                  placeholder="Поиск коллеги..."
                />
                <AnimatePresence>
                  {assigneeOpen && filteredColleagues.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute z-20 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                    >
                      {filteredColleagues.map((col) => (
                        <button
                          key={col.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            toggleAssignee(col.id);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                        >
                          <Avatar colleague={col} className="w-8 h-8 text-[10px]" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {col.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{col.role}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="protocol-form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
          >
            {/* Protocol Batch */}
            <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="w-full flex items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 shrink-0">
                    <ListPlus size={22} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                      Протокольное создание
                    </h2>
                    <p className="text-xs font-medium text-slate-400">
                      Быстрое добавление множества задач с общими параметрами
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 pb-8 pt-2 border-t border-white/20 dark:border-white/10">
                {/* Global settings */}
                <div className="bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  {/* Председатель */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                      Председатель
                    </label>
                    <button
                      type="button"
                      onClick={() => setChairmanSelectOpen((o) => !o)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-left"
                    >
                      {chairmanColleague ? (
                        <span className="inline-flex items-center gap-2.5 min-w-0">
                          <Avatar colleague={chairmanColleague} className="w-7 h-7 text-[9px]" />
                          <span className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {chairmanColleague.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {chairmanColleague.role}
                            </span>
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-slate-400">
                          Выберите председателя...
                        </span>
                      )}
                      <ChevronDown
                        size={16}
                        className={cn(
                          "text-slate-400 shrink-0 transition-transform",
                          chairmanSelectOpen && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {chairmanSelectOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                        >
                          {colleagues.map((col) => (
                            <button
                              key={col.id}
                              type="button"
                              onClick={() => {
                                setBatchGlobal((prev) => ({ ...prev, chairmanId: col.id }));
                                setChairmanSelectOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left",
                                col.id === batchGlobal.chairmanId &&
                                  "bg-emerald-50/60 dark:bg-emerald-900/20",
                              )}
                            >
                              <Avatar colleague={col} className="w-8 h-8 text-[10px]" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {col.name}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">{col.role}</p>
                              </div>
                              {col.id === batchGlobal.chairmanId && (
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Участники */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                      Участники
                    </label>
                    {batchGlobal.participants.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {batchGlobal.participants.map((id) => {
                          const col = colleagues.find((c) => c.id === id)!;
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-2 pl-1.5 pr-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full shadow-sm"
                            >
                              <Avatar colleague={col} className="w-6 h-6 text-[9px]" />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                {col.name.split(" ")[0]}
                              </span>
                              <button
                                onClick={() => toggleParticipant(id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <input
                      type="text"
                      value={participantsQuery}
                      onChange={(e) => {
                        setParticipantsQuery(e.target.value);
                        setParticipantsOpen(true);
                      }}
                      onFocus={() => setParticipantsOpen(true)}
                      onBlur={() => setTimeout(() => setParticipantsOpen(false), 150)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-100"
                      placeholder="Добавить участника..."
                    />
                    <AnimatePresence>
                      {participantsOpen && filteredParticipantOptions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                        >
                          {filteredParticipantOptions.map((col) => (
                            <button
                              key={col.id}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                toggleParticipant(col.id);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                            >
                              <Avatar colleague={col} className="w-8 h-8 text-[10px]" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                  {col.name}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">{col.role}</p>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Дата */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                      Дата
                    </label>
                    <input
                      type="date"
                      value={batchGlobal.date}
                      onChange={(e) => setBatchGlobal({ ...batchGlobal, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-100"
                    />
                  </div>

                  {/* Номер */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-slate-400">
                      Номер
                    </label>
                    <input
                      type="text"
                      value={batchGlobal.number}
                      onChange={(e) => setBatchGlobal({ ...batchGlobal, number: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-100"
                      placeholder="№ протокола"
                    />
                  </div>
                </div>

                {/* Rows table */}
                <div className="overflow-x-auto">
                  <div className="min-w-[700px] flex flex-col gap-3">
                    {/* Header row */}
                    <div className="flex items-center gap-3 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div className="w-8 shrink-0" />
                      <div className="w-8 shrink-0 text-center">#</div>
                      <div className="flex-1">Название задачи</div>
                      <div className="w-36 shrink-0">Приоритет</div>
                      <div className="w-36 shrink-0">Статус</div>
                      <div className="w-44 shrink-0">Исполнитель</div>
                      <div className="w-10 shrink-0" />
                    </div>

                    {batchRows.map((row, idx) => {
                      const isOpen = expandedRows.includes(row.id);
                      const subs = subRowsMap[row.id] || [];
                      return (
                        <div
                          key={row.id}
                          className="rounded-xl overflow-hidden bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/20 dark:border-white/5"
                        >
                          <div className="flex items-center gap-3 px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleRowExpand(row.id)}
                              className="w-8 h-8 shrink-0 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white/60 dark:hover:bg-slate-700 rounded-lg transition-all"
                              aria-label={isOpen ? "Свернуть подпункты" : "Развернуть подпункты"}
                              aria-expanded={isOpen}
                            >
                              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                            <div className="w-8 shrink-0 text-center text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <input
                                type="text"
                                value={row.title}
                                onChange={(e) => updateBatchRow(row.id, "title", e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none"
                                placeholder="Что нужно сделать?"
                              />
                            </div>
                            <div className="w-36 shrink-0">
                              <select
                                value={row.priority}
                                onChange={(e) => updateBatchRow(row.id, "priority", e.target.value)}
                                className="w-full bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 outline-none"
                              >
                                {PRIORITY_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-36 shrink-0">
                              <select
                                value={row.status}
                                onChange={(e) => updateBatchRow(row.id, "status", e.target.value)}
                                className="w-full bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 outline-none"
                              >
                                {STATUS_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-44 shrink-0">
                              <select
                                value={row.assigneeId}
                                onChange={(e) => updateBatchRow(row.id, "assigneeId", e.target.value)}
                                className="w-full bg-transparent border-none text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-0 outline-none"
                              >
                                {colleagues.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-10 shrink-0 text-right">
                              <button
                                onClick={() => removeBatchRow(row.id)}
                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden bg-white/40 dark:bg-slate-900/40 border-t border-slate-200/40 dark:border-white/5"
                              >
                                <div className="pl-16 pr-4 py-3 flex flex-col gap-2">
                                  <AnimatePresence initial={false}>
                                    {subs.map((sub) => (
                                      <motion.div
                                        key={sub.id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -8 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex items-center gap-2 pl-3 border-l-2 border-emerald-400/60 dark:border-emerald-500/50"
                                      >
                                        <input
                                          type="text"
                                          value={sub.title}
                                          onChange={(e) => updateSubRow(row.id, sub.id, e.target.value)}
                                          className="flex-1 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all"
                                          placeholder="Подпункт..."
                                        />
                                        <button
                                          onClick={() => removeSubRow(row.id, sub.id)}
                                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all shrink-0"
                                        >
                                          <X size={14} />
                                        </button>
                                      </motion.div>
                                    ))}
                                  </AnimatePresence>
                                  <button
                                    type="button"
                                    onClick={() => addSubRow(row.id)}
                                    className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors pl-3"
                                  >
                                    <Plus size={14} />
                                    Добавить подпункт
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add row button */}
                <button
                  onClick={addBatchRow}
                  disabled={batchRows.length >= 20}
                  className="w-full mt-4 py-4 border-2 border-dashed border-slate-200 dark:border-white/15 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 transition-all font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={18} />
                  Добавить строку
                </button>

                {/* Signatures card */}
                <div className="mt-8 bg-white/50 dark:bg-slate-800/50 border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 p-5 border-b border-slate-200/40 dark:border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 flex items-center justify-center text-white shadow-md shrink-0">
                      <Pen size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        Подписи
                      </h3>
                      <p className="text-xs font-medium text-slate-400">
                        Электронные цифровые подписи протокола
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {/* Chairman signature */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Председатель
                        </span>
                        {chairmanSigned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 size={12} /> Подписано
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                            Ожидает подписи
                          </span>
                        )}
                      </div>
                      {chairmanColleague ? (
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                          <Avatar colleague={chairmanColleague} className="w-9 h-9 text-[10px]" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {chairmanColleague.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {chairmanColleague.role}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-slate-400 italic">
                          Председатель не выбран
                        </p>
                      )}
                      {chairmanSigned ? (
                        <div className="h-16 flex flex-col items-center justify-center rounded-xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800">
                          <span className="italic text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                            Подпись подтверждена
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{chairmanSigned}</span>
                        </div>
                      ) : (
                        <div className="h-16 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300/70 dark:border-white/15 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          ЭЦП председателя
                        </div>
                      )}
                      {!chairmanSigned && (
                        <button
                          type="button"
                          onClick={() => setChairmanSigned(signTimestamp())}
                          disabled={!chairmanColleague}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                        >
                          <Pen size={13} /> Подписать ЭЦП
                        </button>
                      )}
                    </div>

                    {/* Secretary signature */}
                    <div className="space-y-3 relative">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Секретарь
                        </span>
                        {secretaryColleague &&
                          (secretarySigned ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 size={12} /> Подписано
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                              Ожидает подписи
                            </span>
                          ))}
                      </div>

                      {!secretaryColleague ? (
                        secretaryAdding ? (
                          <div className="relative">
                            <input
                              type="text"
                              autoFocus
                              value={secretaryQuery}
                              onChange={(e) => {
                                setSecretaryQuery(e.target.value);
                                setSecretaryOpen(true);
                              }}
                              onFocus={() => setSecretaryOpen(true)}
                              onBlur={() => setTimeout(() => setSecretaryOpen(false), 150)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all text-sm font-medium text-slate-700 dark:text-slate-100"
                              placeholder="Выберите секретаря..."
                            />
                            <AnimatePresence>
                              {secretaryOpen && filteredSecretaryOptions.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  className="absolute z-30 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto"
                                >
                                  {filteredSecretaryOptions.map((col) => (
                                    <button
                                      key={col.id}
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setSecretaryId(col.id);
                                        setSecretaryAdding(false);
                                        setSecretaryQuery("");
                                        setSecretaryOpen(false);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                    >
                                      <Avatar colleague={col} className="w-8 h-8 text-[10px]" />
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                          {col.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 truncate">
                                          {col.role}
                                        </p>
                                      </div>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSecretaryAdding(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all"
                          >
                            <Plus size={14} /> Добавить секретаря
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10">
                          <Avatar colleague={secretaryColleague} className="w-9 h-9 text-[10px]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {secretaryColleague.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {secretaryColleague.role}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setSecretaryId("");
                              setSecretarySigned(null);
                            }}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all shrink-0"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      )}

                      {secretaryColleague &&
                        (secretarySigned ? (
                          <div className="h-16 flex flex-col items-center justify-center rounded-xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-200/60 dark:border-emerald-800">
                            <span className="italic text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                              Подпись подтверждена
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              {secretarySigned}
                            </span>
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300/70 dark:border-white/15 text-slate-400 text-xs font-bold uppercase tracking-wider">
                            ЭЦП секретаря
                          </div>
                        ))}
                      {secretaryColleague && !secretarySigned && (
                        <button
                          type="button"
                          onClick={() => setSecretarySigned(signTimestamp())}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <Pen size={13} /> Подписать ЭЦП
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Batch footer */}
                <div className="mt-6 pt-6 border-t border-white/20 dark:border-white/10 flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Заполнено задач:{" "}
                    <span className="text-slate-900 dark:text-slate-100 font-bold">
                      {filledBatchCount}
                    </span>
                  </p>
                  <button
                    onClick={handleBatchCreate}
                    disabled={filledBatchCount === 0 || isSaving}
                    className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                  >
                    {isSaving ? "Сохранение..." : "Создать протокол"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
};
