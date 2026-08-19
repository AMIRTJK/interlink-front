import { Pen, Plus, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Colleague } from "../../../model/types";
import { signTimestamp } from "../../../lib/helpers";

interface IProps {
  colleagues: Colleague[];
  chairmanColleague: Colleague | null;
  chairmanSigned: string | null;
  onChairmanSignedChange: (val: string | null) => void;
  secretaryColleague: Colleague | null;
  secretarySigned: string | null;
  onSecretarySignedChange: (val: string | null) => void;
  secretaryId: string;
  onSecretaryIdChange: (id: string) => void;
  secretaryAdding: boolean;
  onSecretaryAddingChange: (adding: boolean) => void;
  secretaryQuery: string;
  onSecretaryQueryChange: (val: string) => void;
  secretaryOpen: boolean;
  onSecretaryOpenChange: (open: boolean) => void;
}

export function ProtocolSignatures({
  colleagues,
  chairmanColleague,
  chairmanSigned,
  onChairmanSignedChange,
  secretaryColleague,
  secretarySigned,
  onSecretarySignedChange,
  secretaryId,
  onSecretaryIdChange,
  secretaryAdding,
  onSecretaryAddingChange,
  secretaryQuery,
  onSecretaryQueryChange,
  secretaryOpen,
  onSecretaryOpenChange,
}: IProps) {
  const filteredSecretaryOptions = colleagues.filter(
    (c) =>
      c.id !== secretaryId &&
      c.name.toLowerCase().includes(secretaryQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Card 3: ЭЦП Руководителя */}
      <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10b981] flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
              <Pen size={18} />
            </div>
            <h3 className="text-lg font-black text-[#1e2548] dark:text-slate-100 tracking-tight">
              ЭЦП Руководителя
            </h3>
          </div>
          {chairmanSigned ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-extrabold text-[9px] uppercase tracking-wider">
              <CheckCircle2 size={12} /> Подписано
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-[9px] uppercase tracking-wider">
              Ожидает подписи
            </span>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] block">
            ПРЕДСЕДАТЕЛЬ
          </label>

          {chairmanColleague ? (
            <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-4 flex items-center gap-3 shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
              <span className="w-6 h-6 rounded-full bg-[#ec4899] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                {chairmanColleague.initials || "AS"}
              </span>
              <span className="text-xs font-bold text-[#1e2548] dark:text-slate-100">
                {chairmanColleague.name}
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#636e9c] shadow-[0_4px_16px_rgba(100,105,240,0.06)] cursor-pointer hover:bg-white flex items-center justify-center gap-1.5">
              <Plus size={14} />
              <span>Добавить</span>
            </div>
          )}

          {chairmanSigned ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center space-y-1">
              <p className="text-xs font-bold text-emerald-700">
                Подпись подтверждена
              </p>
              <p className="text-[10px] text-slate-400">{chairmanSigned}</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#9aa2c8] uppercase tracking-wider shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
              ЭЦП ПРЕДСЕДАТЕЛЯ
            </div>
          )}

          {!chairmanSigned && (
            <button
              type="button"
              onClick={() => onChairmanSignedChange(signTimestamp())}
              disabled={!chairmanColleague}
              className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-200/60 transition-all cursor-pointer flex items-center gap-2"
            >
              <Pen size={13} />
              <span>Подписать ЭЦП</span>
            </button>
          )}
        </div>
      </div>

      {/* Card 4: ЭЦП Секретаря */}
      <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-white/10 rounded-[2.5rem] p-7 shadow-[0_20px_60px_-10px_rgba(100,105,240,0.16)] dark:shadow-none space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#10b981] flex items-center justify-center text-white shadow-md shadow-emerald-200 shrink-0">
              <Pen size={18} />
            </div>
            <h3 className="text-lg font-black text-[#1e2548] dark:text-slate-100 tracking-tight">
              ЭЦП Секретаря
            </h3>
          </div>
          {secretarySigned ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-extrabold text-[9px] uppercase tracking-wider">
              <CheckCircle2 size={12} /> Подписано
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-extrabold text-[9px] uppercase tracking-wider">
              Ожидает подписи
            </span>
          )}
        </div>

        <div className="space-y-3 relative">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#636e9c] block">
            СЕКРЕТАРЬ
          </label>

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
                  onBlur={() =>
                    setTimeout(() => onSecretaryOpenChange(false), 150)
                  }
                  className="w-full px-5 py-3.5 bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl outline-none text-xs font-semibold text-[#1e2548] placeholder:text-[#9aa2c8] shadow-[0_4px_16px_rgba(100,105,240,0.06)]"
                  placeholder="Выберите секретаря..."
                />
                <AnimatePresence>
                  {secretaryOpen && filteredSecretaryOptions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-48 overflow-y-auto"
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
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#ec4899] text-white flex items-center justify-center text-[9px] font-black shrink-0">
                            {col.initials || "AS"}
                          </span>
                          <span className="text-xs font-bold text-[#1e2548]">
                            {col.name}
                          </span>
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
                className="w-full bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#636e9c] shadow-[0_4px_16px_rgba(100,105,240,0.06)] cursor-pointer hover:bg-white flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Добавить</span>
              </button>
            )
          ) : (
            <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#ec4899] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                  {secretaryColleague.initials || "AS"}
                </span>
                <span className="text-xs font-bold text-[#1e2548]">
                  {secretaryColleague.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSecretaryIdChange("");
                  onSecretarySignedChange(null);
                }}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {secretarySigned ? (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl text-center space-y-1">
              <p className="text-xs font-bold text-emerald-700">
                Подпись подтверждена
              </p>
              <p className="text-[10px] text-slate-400">{secretarySigned}</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-white/95 to-[#d9e0f2]/40 border border-white/90 rounded-2xl p-5 text-center text-xs font-bold text-[#9aa2c8] uppercase tracking-wider shadow-[0_4px_16px_rgba(100,105,240,0.06)]">
              ЭЦП ПРЕДСЕДАТЕЛЯ
            </div>
          )}

          {secretaryColleague && !secretarySigned && (
            <button
              type="button"
              onClick={() => onSecretarySignedChange(signTimestamp())}
              className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-200/60 transition-all cursor-pointer flex items-center gap-2"
            >
              <Pen size={13} />
              <span>Подписать ЭЦП</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
