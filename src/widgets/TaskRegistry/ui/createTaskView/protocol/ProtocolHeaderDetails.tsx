import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, CheckCircle2, X, Search, Calendar } from "lucide-react";
import { cn } from "@shared/lib";
import type { Colleague } from "../../../model/types";
import { Avatar } from "../../Avatar";

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
  chairmanSelectOpen: boolean;
  onChairmanSelectOpenChange: (open: boolean) => void;
}

export function ProtocolHeaderDetails({
  colleagues,
  batchGlobal,
  onBatchGlobalChange,
  participantsQuery,
  onParticipantsQueryChange,
  participantsOpen,
  onParticipantsOpenChange,
  onToggleParticipant,
  chairmanSelectOpen,
  onChairmanSelectOpenChange,
}: IProps) {
  const chairmanColleague =
    colleagues.find((c) => c.id === batchGlobal.chairmanId) || null;

  const filteredParticipantOptions = colleagues.filter(
    (c) =>
      !batchGlobal.participants.includes(c.id) &&
      c.name.toLowerCase().includes(participantsQuery.toLowerCase()),
  );

  return (
    <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-6">
      {/* Title Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#10b981] flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
          <FileText size={18} />
        </div>
        <h2 className="text-lg font-black text-[#1e2548] dark:text-slate-100 tracking-tight">
          Детальная информация
        </h2>
      </div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ПРЕДСЕДАТЕЛЬ */}
        <div className="space-y-1.5 relative">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
            ПРЕДСЕДАТЕЛЬ <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => onChairmanSelectOpenChange(!chairmanSelectOpen)}
            className="w-full flex items-center justify-between gap-2 px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl shadow-[0_4px_16px_rgba(100,105,240,0.06)] outline-none text-left cursor-pointer"
          >
            {chairmanColleague ? (
              <span className="inline-flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-[#ec4899] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                  {chairmanColleague.initials || "AS"}
                </span>
                <span className="text-xs font-bold text-[#1e2548] dark:text-slate-100 truncate">
                  {chairmanColleague.name}
                </span>
              </span>
            ) : (
              <span className="text-xs font-medium text-[#9aa2c8]">
                Выберите председателя...
              </span>
            )}
            <ChevronDown
              size={15}
              className={cn(
                "text-[#9aa2c8] shrink-0 transition-transform",
                chairmanSelectOpen && "rotate-180",
              )}
            />
          </button>

          <AnimatePresence>
            {chairmanSelectOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto"
              >
                {colleagues.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      onBatchGlobalChange({
                        ...batchGlobal,
                        chairmanId: col.id,
                      });
                      onChairmanSelectOpenChange(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer",
                      col.id === batchGlobal.chairmanId && "bg-emerald-50/60",
                    )}
                  >
                    <Avatar colleague={col} className="w-6 h-6 text-[9px]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {col.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {col.role}
                      </p>
                    </div>
                    {col.id === batchGlobal.chairmanId && (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-500 shrink-0"
                      />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* УЧАСТНИКИ */}
        <div className="space-y-1.5 relative">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
            УЧАСТНИКИ
          </label>
          {batchGlobal.participants.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {batchGlobal.participants.map((id) => {
                const col = colleagues.find((c) => c.id === id);
                if (!col) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 bg-white dark:bg-slate-800 border border-[#3373e5]/20 dark:border-white/10 rounded-full shadow-2xs text-xs font-bold text-[#1e2548]"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#ec4899] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                      {col.initials || "AS"}
                    </span>
                    <span>{col.name.split(" ")[0]}</span>
                    <button
                      type="button"
                      onClick={() => onToggleParticipant(id)}
                      className="text-[#9aa2c8] hover:text-rose-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={participantsQuery}
              onChange={(e) => {
                onParticipantsQueryChange(e.target.value);
                onParticipantsOpenChange(true);
              }}
              onFocus={() => onParticipantsOpenChange(true)}
              onBlur={() =>
                setTimeout(() => onParticipantsOpenChange(false), 150)
              }
              className="w-full pl-5 pr-10 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
              placeholder="Добавить участника..."
            />
            <Search
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa2c8] pointer-events-none"
            />
          </div>

          <AnimatePresence>
            {participantsOpen && filteredParticipantOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto"
              >
                {filteredParticipantOptions.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onToggleParticipant(col.id);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left cursor-pointer"
                  >
                    <Avatar colleague={col} className="w-6 h-6 text-[9px]" />
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

        {/* ДАТА */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
            ДАТА <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa2c8] pointer-events-none"
            />
            <input
              type="date"
              value={batchGlobal.date}
              onChange={(e) =>
                onBatchGlobalChange({ ...batchGlobal, date: e.target.value })
              }
              className="w-full pl-10 pr-4 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
            />
          </div>
        </div>

        {/* НОМЕР */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block">
            НОМЕР
          </label>
          <input
            type="text"
            value={batchGlobal.number}
            onChange={(e) =>
              onBatchGlobalChange({ ...batchGlobal, number: e.target.value })
            }
            className="w-full px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
            placeholder="№ протокола"
          />
        </div>
      </div>
    </div>
  );
}
