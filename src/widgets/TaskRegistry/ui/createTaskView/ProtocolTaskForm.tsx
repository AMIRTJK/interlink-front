import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ListPlus,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Trash2,
  Pen,
} from "lucide-react";
import { cn } from "@shared/lib";
import type {
  BatchRow,
  Colleague,
  SubRow,
} from "../../model/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../model/constants";
import { signTimestamp } from "../../lib/helpers";
import { Avatar } from "../Avatar";

interface IProps {
  colleagues: Colleague[];
  batchGlobal: {
    chairmanId: string;
    participants: string[];
    date: string;
    number: string;
  };
  onBatchGlobalChange: (val: {
    chairmanId: string;
    participants: string[];
    date: string;
    number: string;
  }) => void;
  participantsQuery: string;
  onParticipantsQueryChange: (val: string) => void;
  participantsOpen: boolean;
  onParticipantsOpenChange: (open: boolean) => void;
  onToggleParticipant: (id: string) => void;
  batchRows: BatchRow[];
  onAddBatchRow: () => void;
  onRemoveBatchRow: (id: number) => void;
  onUpdateBatchRow: (id: number, field: keyof BatchRow, value: string) => void;
  subRowsMap: Record<number, SubRow[]>;
  expandedRows: number[];
  onToggleRowExpand: (id: number) => void;
  onAddSubRow: (rowId: number) => void;
  onUpdateSubRow: (rowId: number, subId: number, title: string) => void;
  onRemoveSubRow: (rowId: number, subId: number) => void;
  chairmanSelectOpen: boolean;
  onChairmanSelectOpenChange: (open: boolean) => void;
  secretaryId: string;
  onSecretaryIdChange: (id: string) => void;
  secretaryAdding: boolean;
  onSecretaryAddingChange: (adding: boolean) => void;
  secretaryQuery: string;
  onSecretaryQueryChange: (val: string) => void;
  secretaryOpen: boolean;
  onSecretaryOpenChange: (open: boolean) => void;
  chairmanSigned: string | null;
  onChairmanSignedChange: (val: string | null) => void;
  secretarySigned: string | null;
  onSecretarySignedChange: (val: string | null) => void;
  filledBatchCount: number;
  isSaving: boolean;
  onBatchCreate: () => void;
}

export function ProtocolTaskForm({
  colleagues,
  batchGlobal,
  onBatchGlobalChange,
  participantsQuery,
  onParticipantsQueryChange,
  participantsOpen,
  onParticipantsOpenChange,
  onToggleParticipant,
  batchRows,
  onAddBatchRow,
  onRemoveBatchRow,
  onUpdateBatchRow,
  subRowsMap,
  expandedRows,
  onToggleRowExpand,
  onAddSubRow,
  onUpdateSubRow,
  onRemoveSubRow,
  chairmanSelectOpen,
  onChairmanSelectOpenChange,
  secretaryId,
  onSecretaryIdChange,
  secretaryAdding,
  onSecretaryAddingChange,
  secretaryQuery,
  onSecretaryQueryChange,
  secretaryOpen,
  onSecretaryOpenChange,
  chairmanSigned,
  onChairmanSignedChange,
  secretarySigned,
  onSecretarySignedChange,
  filledBatchCount,
  isSaving,
  onBatchCreate,
}: IProps) {
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
    <motion.div
      key="protocol-form"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25 }}
    >
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
                onClick={() => onChairmanSelectOpenChange(!chairmanSelectOpen)}
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
                          onBatchGlobalChange({ ...batchGlobal, chairmanId: col.id });
                          onChairmanSelectOpenChange(false);
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
                          onClick={() => onToggleParticipant(id)}
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
                  onParticipantsQueryChange(e.target.value);
                  onParticipantsOpenChange(true);
                }}
                onFocus={() => onParticipantsOpenChange(true)}
                onBlur={() => setTimeout(() => onParticipantsOpenChange(false), 150)}
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
                          onToggleParticipant(col.id);
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
                onChange={(e) => onBatchGlobalChange({ ...batchGlobal, date: e.target.value })}
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
                onChange={(e) => onBatchGlobalChange({ ...batchGlobal, number: e.target.value })}
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
                        onClick={() => onToggleRowExpand(row.id)}
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
                          onChange={(e) => onUpdateBatchRow(row.id, "title", e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-800 dark:text-slate-100 outline-none"
                          placeholder="Что нужно сделать?"
                        />
                      </div>
                      <div className="w-36 shrink-0">
                        <select
                          value={row.priority}
                          onChange={(e) => onUpdateBatchRow(row.id, "priority", e.target.value)}
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
                          onChange={(e) => onUpdateBatchRow(row.id, "status", e.target.value)}
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
                          onChange={(e) => onUpdateBatchRow(row.id, "assigneeId", e.target.value)}
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
                          onClick={() => onRemoveBatchRow(row.id)}
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
                                    onChange={(e) => onUpdateSubRow(row.id, sub.id, e.target.value)}
                                    className="flex-1 bg-white/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/30 outline-none transition-all"
                                    placeholder="Подпункт..."
                                  />
                                  <button
                                    onClick={() => onRemoveSubRow(row.id, sub.id)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all shrink-0"
                                  >
                                    <X size={14} />
                                  </button>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                            <button
                              type="button"
                              onClick={() => onAddSubRow(row.id)}
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
            onClick={onAddBatchRow}
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
                    onClick={() => onChairmanSignedChange(signTimestamp())}
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
                          onSecretaryQueryChange(e.target.value);
                          onSecretaryOpenChange(true);
                        }}
                        onFocus={() => onSecretaryOpenChange(true)}
                        onBlur={() => setTimeout(() => onSecretaryOpenChange(false), 150)}
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
                                  onSecretaryIdChange(col.id);
                                  onSecretaryAddingChange(false);
                                  onSecretaryQueryChange("");
                                  onSecretaryOpenChange(false);
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
                      onClick={() => onSecretaryAddingChange(true)}
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
                        onSecretaryIdChange("");
                        onSecretarySignedChange(null);
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
                    onClick={() => onSecretarySignedChange(signTimestamp())}
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
              onClick={onBatchCreate}
              disabled={filledBatchCount === 0 || isSaving}
              className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
            >
              {isSaving ? "Сохранение..." : "Создать протокол"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
