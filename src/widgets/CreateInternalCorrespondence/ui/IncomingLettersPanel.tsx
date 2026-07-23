import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Plus, X, Check } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { IncomingLetterSelectModal } from "./IncomingLetterSelectModal";

interface IProps {
  isOpen: boolean;
  hideTab?: boolean;
  openLeft?: boolean;
  onOpen: () => void;
  onClose: () => void;
  attachedLetters: any[];
  onAddLetter: (letter: any) => void;
  onRemoveLetter: (id: string | number) => void;
  onSaveLetters: () => void;
  docId?: string | number;
}

export const IncomingLettersPanel = ({
  isOpen,
  hideTab,
  openLeft = true,
  onOpen,
  onClose,
  attachedLetters,
  onAddLetter,
  onRemoveLetter,
  onSaveLetters,
  docId,
}: IProps) => {
  const [showSelectModal, setShowSelectModal] = useState(false);

  return (
    <>
      {!hideTab && (
        <div
          className="absolute z-20"
          style={openLeft ? { left: -36, top: 10 } : { right: -36, top: 10 }}
        >
          <motion.button
            onClick={isOpen ? onClose : onOpen}
            className={cn(
              "bg-white border border-slate-200 shadow-md px-2 py-3 h-[160px] cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
              openLeft ? "border-r-0 rounded-l-xl" : "border-l-0 rounded-r-xl",
              isOpen ? "bg-slate-50" : "hover:bg-slate-50",
            )}
            aria-label="Входящие письма"
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-blue-500" />
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
              Входящие письма
            </span>
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: openLeft ? 12 : -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: openLeft ? 12 : -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 w-[320px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
            style={{
              ...(openLeft
                ? { right: "calc(100% + 12px)" }
                : { left: "calc(100% + 12px)" }),
              maxHeight: "var(--icc-panel-max-h, 70vh)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-slate-800">
                  Входящие письма
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 ml-2 font-medium">
                  {attachedLetters.length}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Закрыть панель входящих писем"
              >
                <X size={15} />
              </button>
            </div>

            <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center gap-2 flex-shrink-0">
              <span className="text-xs text-slate-500 font-medium truncate min-w-0 flex-1">
                Прикрепленные письма
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <If is={attachedLetters.length > 0}>
                  <button
                    type="button"
                    onClick={onSaveLetters}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Check size={12} />
                    <span>Сохранить</span>
                  </button>
                </If>
                <If is={!!docId}>
                  <button
                    type="button"
                    onClick={() => setShowSelectModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus size={12} />
                    <span>Добавить</span>
                  </button>
                </If>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 min-h-0">
              <If is={attachedLetters.length === 0}>
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <Mail size={15} />
                  <span>Нет прикрепленных писем</span>
                </div>
              </If>
              <If is={attachedLetters.length > 0}>
                {attachedLetters.map((letter, idx) => (
                  <div
                    key={letter.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/40 p-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs font-bold text-slate-300 w-4 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-blue-100 text-blue-700">
                        <Mail size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {letter.subject}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          {letter.sender}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          №{letter.regNumber} • {letter.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveLetter(letter.id)}
                        className="text-slate-300 hover:text-rose-400 transition-colors flex-shrink-0 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </If>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <IncomingLetterSelectModal
        open={showSelectModal}
        onClose={() => setShowSelectModal(false)}
        attachedLetters={attachedLetters}
        onAddLetter={onAddLetter}
        docId={docId}
      />
    </>
  );
};
