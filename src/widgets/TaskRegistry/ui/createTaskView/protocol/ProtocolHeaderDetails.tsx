import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown, CheckCircle2, X, Search } from "lucide-react";
import { DatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import { cn } from "@shared/lib";
import { Tooltip } from "@shared/ui";
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
  const [chairmanSearch, setChairmanSearch] = React.useState("");
  const chairmanRef = React.useRef<HTMLDivElement>(null);
  const participantsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (chairmanRef.current && !chairmanRef.current.contains(target)) {
        onChairmanSelectOpenChange(false);
      }
      if (participantsRef.current && !participantsRef.current.contains(target)) {
        onParticipantsOpenChange(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onChairmanSelectOpenChange, onParticipantsOpenChange]);

  const chairmanColleague =
    colleagues.find((c) => c.id === batchGlobal.chairmanId) || null;

  const filteredChairmanOptions = colleagues.filter(
    (c) =>
      c.name.toLowerCase().includes(chairmanSearch.toLowerCase()) ||
      (c.role && c.role.toLowerCase().includes(chairmanSearch.toLowerCase())),
  );

  const filteredParticipantOptions = colleagues.filter(
    (c) =>
      !batchGlobal.participants.includes(c.id) &&
      (c.name.toLowerCase().includes(participantsQuery.toLowerCase()) ||
        (c.role && c.role.toLowerCase().includes(participantsQuery.toLowerCase()))),
  );

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-6 relative",
        chairmanSelectOpen || participantsOpen ? "z-30" : "z-10",
      )}
    >
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* ПРЕДСЕДАТЕЛЬ */}
        <div ref={chairmanRef} className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block h-3.5">
            ПРЕДСЕДАТЕЛЬ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Tooltip title={!chairmanSelectOpen && chairmanColleague ? `${chairmanColleague.name} — ${chairmanColleague.role || "Сотрудник"}` : undefined}>
              <button
                type="button"
                onClick={() => onChairmanSelectOpenChange(!chairmanSelectOpen)}
                className="w-full h-12 flex items-center justify-between gap-2 px-4 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl shadow-[0_4px_16px_rgba(100,105,240,0.06)] outline-none text-left cursor-pointer"
              >
                {chairmanColleague ? (
                  <span className="inline-flex items-center gap-2.5 min-w-0 flex-1">
                    <Avatar colleague={chairmanColleague} className="w-6 h-6 text-[9px]" allowPreview={false} />
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
                    "text-[#9aa2c8] shrink-0 transition-transform duration-200",
                    chairmanSelectOpen && "rotate-180",
                  )}
                />
              </button>
            </Tooltip>

            <AnimatePresence>
              {chairmanSelectOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-64 flex flex-col"
                >
                  <div className="p-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/70 dark:bg-slate-800/70">
                    <div className="relative">
                      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Поиск председателя..."
                        value={chairmanSearch}
                        onChange={(e) => setChairmanSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200/80 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100/60 dark:divide-white/5">
                    {filteredChairmanOptions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Сотрудник не найден</div>
                    ) : (
                      filteredChairmanOptions.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            onBatchGlobalChange({
                              ...batchGlobal,
                              chairmanId: col.id,
                            });
                            onChairmanSelectOpenChange(false);
                            setChairmanSearch("");
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left cursor-pointer",
                            col.id === batchGlobal.chairmanId && "bg-emerald-50/70 dark:bg-emerald-950/20",
                          )}
                        >
                          <Avatar colleague={col} className="w-7 h-7 text-[10px]" allowPreview={false} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {col.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {col.role || "Сотрудник"}
                            </p>
                          </div>
                          {col.id === batchGlobal.chairmanId && (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-500 shrink-0"
                            />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* УЧАСТНИКИ */}
        <div ref={participantsRef} className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block h-3.5">
            УЧАСТНИКИ ({batchGlobal.participants.length})
          </label>
          <div className="relative">
            <input
              type="text"
              value={participantsQuery}
              onChange={(e) => {
                onParticipantsQueryChange(e.target.value);
                onParticipantsOpenChange(true);
              }}
              onFocus={() => onParticipantsOpenChange(true)}
              onClick={() => onParticipantsOpenChange(true)}
              className="w-full h-12 pl-4 pr-10 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] dark:text-slate-100 placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
              placeholder="Добавить участника..."
            />
            <Search
              size={14}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9aa2c8] pointer-events-none"
            />

            <AnimatePresence>
              {participantsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-64 flex flex-col"
                >
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-100/60 dark:divide-white/5">
                    {filteredParticipantOptions.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        {participantsQuery.trim()
                          ? "Сотрудник не найден"
                          : "Все доступные сотрудники уже добавлены"}
                      </div>
                    ) : (
                      filteredParticipantOptions.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onToggleParticipant(col.id);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left cursor-pointer"
                        >
                          <Avatar colleague={col} className="w-7 h-7 text-[10px]" allowPreview={false} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {col.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              {col.role || "Сотрудник"}
                            </p>
                          </div>
                          <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100">
                            + Добавить
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected participants badges placed below input */}
          {batchGlobal.participants.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {batchGlobal.participants.map((id) => {
                const col = colleagues.find((c) => c.id === id);
                if (!col) return null;
                return (
                  <Tooltip key={id} title={`${col.name} — ${col.role || "Сотрудник"}`}>
                    <span className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 rounded-full shadow-2xs text-xs font-bold text-[#1e2548] dark:text-slate-100">
                      <Avatar colleague={col} className="w-5 h-5 text-[8px]" allowPreview={false} />
                      <span className="truncate max-w-[140px]">{col.name}</span>
                      <button
                        type="button"
                        onClick={() => onToggleParticipant(id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* ДАТА */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block h-3.5">
            ДАТА <span className="text-red-500">*</span>
          </label>
          <ConfigProvider
            theme={{
              token: {
                borderRadius: 16,
                controlHeight: 48,
                fontSize: 12,
                colorPrimary: "#3373e5",
              },
            }}
          >
            <DatePicker
              value={batchGlobal.date ? dayjs(batchGlobal.date) : null}
              onChange={(d) =>
                onBatchGlobalChange({
                  ...batchGlobal,
                  date: d ? d.format("YYYY-MM-DD") : "",
                })
              }
              format="DD.MM.YYYY"
              placeholder="Выберите дату"
              allowClear
              placement="bottomLeft"
              className="w-full h-12 px-4 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 border border-white/90 dark:border-white/10 rounded-2xl text-xs font-semibold text-[#1e2548] dark:text-slate-100 shadow-[0_4px_16px_rgba(100,105,240,0.06)] [&_.ant-picker-input_input]:text-xs! [&_.ant-picker-input_input]:font-semibold!"
            />
          </ConfigProvider>
        </div>

        {/* НОМЕР */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] dark:text-purple-300/60 block h-3.5">
            НОМЕР
          </label>
          <input
            type="text"
            value={batchGlobal.number}
            onChange={(e) =>
              onBatchGlobalChange({ ...batchGlobal, number: e.target.value })
            }
            className="w-full h-12 px-4 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
            placeholder="№ протокола"
          />
        </div>
      </div>
    </div>
  );
}
