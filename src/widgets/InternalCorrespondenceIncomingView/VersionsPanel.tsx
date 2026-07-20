import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { cn } from "@shared/lib";

export const VersionsPanel = ({
  isOpen,
  hideTab,
  onOpen,
  onClose,
  versions = [],
  activeVersionId,
  onSelectVersion,
}: {
  isOpen: boolean;
  hideTab?: boolean;
  onOpen: () => void;
  onClose: () => void;
  versions?: any[];
  activeVersionId: number | string | null;
  onSelectVersion: (versionId: number | string) => void;
}) => {
  return (
    <>
      {!hideTab && (
        <div
          className="absolute z-20"
          style={{ left: -33, top: 190 }}
        >
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={cn(
              "bg-white border border-slate-200 border-r-0 rounded-l-xl shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50",
            )}
            aria-label="История версий"
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-amber-500" />
            <span
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                fontSize: 11,
                fontWeight: 600,
                color: "#475569",
                letterSpacing: "0.08em",
              }}
            >
              История версий
            </span>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 w-[320px] h-[520px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
            style={{
              right: "calc(100% + 12px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-slate-800">
                  Версии документа
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 ml-2 font-medium">
                  {versions.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700"
                aria-label="Закрыть панель версий"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
              {versions.map((v, idx) => {
                const author = v.author || {};
                const authorName = author.full_name || "Неизвестный автор";
                const isActive = String(v.id) === String(activeVersionId) 
                  || (activeVersionId === null && idx === versions.length - 1);
                
                const d = new Date(v.created_at);
                const pad = (n: number) => String(n).padStart(2, "0");
                const dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

                return (
                  <motion.div
                    key={v.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: idx * 0.05,
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    onClick={() => onSelectVersion(v.id)}
                    className={cn(
                      "rounded-xl p-3 flex flex-col gap-1.5 border transition-all cursor-pointer",
                      isActive
                        ? "bg-blue-50/50 border-blue-200 shadow-sm"
                        : "bg-slate-50 border-slate-100 hover:bg-slate-100/75 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-bold",
                        isActive ? "text-blue-700" : "text-slate-700"
                      )}>
                        Версия {v.version}
                      </span>
                      {isActive && (
                        <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
                          <Check size={9} className="text-blue-600" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-snug">
                      {authorName}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>{dateStr}</span>
                      {v.is_selected && (
                        <span className="text-green-600 font-semibold uppercase tracking-wider text-[8px] bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                          Для подписи
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
