import { Plus, Trash2, Paperclip, ChevronDown, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select } from "antd";
import type { BatchRow, Colleague, SubRow } from "../../../model/types";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "../../../model/constants";

interface IProps {
  colleagues: Colleague[];
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
}

export function ProtocolAgendaTable({
  colleagues,
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
}: IProps) {
  return (
    <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-5">
      {/* Title Header with Add Row Button */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-[#1e2548] dark:text-slate-100 tracking-tight">
          ПОВЕСТКА ДНЯ И РЕШЕНИЯ
        </h2>
        <button
          type="button"
          onClick={onAddBatchRow}
          disabled={batchRows.length >= 20}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e6f4ea] hover:bg-[#d2ebd7] dark:bg-emerald-950/40 border border-[#10b981]/30 text-[#10b981] dark:text-emerald-400 font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
        >
          <Plus size={14} />
          <span>Добавить строку</span>
        </button>
      </div>

      {/* Table Section */}
      <div className="space-y-3">
        {/* Table Sub-Header Bar */}
        <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl px-5 py-2.5 flex items-center text-[10px] font-black uppercase text-[#636e9c] dark:text-slate-400 tracking-wider shadow-[0_4px_16px_rgba(100,105,240,0.04)]">
          <div className="w-10 shrink-0">№</div>
          <div className="flex-1">ПОСТАВЛЕННАЯ ЗАДАЧА / ВОПРОС</div>
          <div className="w-32 shrink-0 text-center">ПРИОРИТЕТ</div>
          <div className="w-28 shrink-0 text-center">СТАТУС</div>
          <div className="w-44 shrink-0 text-center">ИСПОЛНИТЕЛЬ</div>
          <div className="w-16 shrink-0 text-center">ДЕЙСТВИЯ</div>
        </div>

        {/* Rows */}
        {batchRows.map((row, idx) => {
          const isOpen = expandedRows.includes(row.id);
          const subs = subRowsMap[row.id] || [];
          const assignedCol = colleagues.find((c) => c.id === row.assigneeId);

          return (
            <div key={row.id} className="space-y-2">
              <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl px-4 py-3 shadow-[0_4px_16px_rgba(100,105,240,0.06)] flex items-center gap-3 text-xs font-semibold text-[#1e2548]">
                {/* Expand Toggle */}
                <button
                  type="button"
                  onClick={() => onToggleRowExpand(row.id)}
                  className="text-[#9aa2c8] hover:text-[#3373e5] transition-colors cursor-pointer"
                >
                  {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Index */}
                <div className="w-6 shrink-0 font-bold text-[#636e9c]">
                  {idx + 1}
                </div>

                {/* Title Input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={row.title}
                    onChange={(e) =>
                      onUpdateBatchRow(row.id, "title", e.target.value)
                    }
                    className="w-full bg-transparent border-none outline-none text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8]"
                    placeholder="Что нужно сделать?"
                  />
                </div>

                {/* Priority Badge Select */}
                <div className="w-36 shrink-0">
                  <Select
                    value={row.priority}
                    onChange={(val) =>
                      onUpdateBatchRow(row.id, "priority", val)
                    }
                    options={PRIORITY_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    size="small"
                    className="w-full text-xs font-bold [&_.ant-select-selector]:bg-amber-50! dark:[&_.ant-select-selector]:bg-amber-950/40! [&_.ant-select-selector]:border-amber-200! dark:[&_.ant-select-selector]:border-amber-800/60! [&_.ant-select-selection-item]:text-amber-700! dark:[&_.ant-select-selection-item]:text-amber-400! [&_.ant-select-selector]:rounded-full!"
                  />
                </div>

                {/* Status Badge Select */}
                <div className="w-32 shrink-0">
                  <Select
                    value={row.status}
                    onChange={(val) =>
                      onUpdateBatchRow(row.id, "status", val)
                    }
                    options={STATUS_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    size="small"
                    className="w-full text-xs font-bold [&_.ant-select-selector]:bg-blue-50! dark:[&_.ant-select-selector]:bg-blue-950/40! [&_.ant-select-selector]:border-blue-200! dark:[&_.ant-select-selector]:border-blue-800/60! [&_.ant-select-selection-item]:text-blue-600! dark:[&_.ant-select-selection-item]:text-blue-400! [&_.ant-select-selector]:rounded-full!"
                  />
                </div>

                {/* Assignee Badge Select */}
                <div className="w-48 shrink-0">
                  <div className="relative flex items-center">
                    <Select
                      value={row.assigneeId}
                      onChange={(val) =>
                        onUpdateBatchRow(row.id, "assigneeId", val)
                      }
                      options={colleagues.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                      size="small"
                      className="w-full pl-6 text-xs font-bold [&_.ant-select-selector]:bg-white! dark:[&_.ant-select-selector]:bg-slate-800! [&_.ant-select-selector]:border-[#3373e5]/20! dark:[&_.ant-select-selector]:border-white/10! [&_.ant-select-selection-item]:text-[#1e2548]! dark:[&_.ant-select-selection-item]:text-slate-100! [&_.ant-select-selector]:rounded-full!"
                    />
                    <span className="absolute left-1.5 w-4 h-4 rounded-full bg-[#ec4899] text-white flex items-center justify-center text-[8px] font-black pointer-events-none z-10">
                      {assignedCol?.initials || "AS"}
                    </span>
                  </div>
                </div>

                {/* Action Icons */}
                <div className="w-16 shrink-0 flex items-center justify-center gap-2 text-[#9aa2c8]">
                  <button
                    type="button"
                    className="hover:text-[#3373e5] transition-colors cursor-pointer"
                    title="Прикрепить файл"
                  >
                    <Paperclip size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveBatchRow(row.id)}
                    className="hover:text-rose-600 transition-colors cursor-pointer text-rose-400"
                    title="Удалить строку"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Sub-rows */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-10 space-y-2"
                  >
                    {subs.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center gap-2 p-2 bg-white/70 dark:bg-slate-800/70 border border-[#3373e5]/15 rounded-xl text-xs"
                      >
                        <input
                          type="text"
                          value={sub.title}
                          onChange={(e) =>
                            onUpdateSubRow(row.id, sub.id, e.target.value)
                          }
                          className="flex-1 bg-transparent outline-none text-xs font-semibold text-[#1e2548]"
                          placeholder="Подпункт..."
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveSubRow(row.id, sub.id)}
                          className="text-rose-400 hover:text-rose-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => onAddSubRow(row.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981] hover:underline"
                    >
                      <Plus size={13} />
                      <span>Добавить подпункт</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
