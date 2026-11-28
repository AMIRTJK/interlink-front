import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, FileType } from "lucide-react";

import { cn } from "../../../lib/utils";
import type { ILetterTypeOption } from "./model";

interface IProps {
  letterType: string | null;
  setLetterType: Dispatch<SetStateAction<string | null>>;
  showLetterTypeDropdown: boolean;
  setShowLetterTypeDropdown: Dispatch<SetStateAction<boolean>>;
  letterTypeOptions: ILetterTypeOption[];
}

export const LetterTypeSelect = ({
  letterType,
  setLetterType,
  showLetterTypeDropdown,
  setShowLetterTypeDropdown,
  letterTypeOptions,
}: IProps) => (
  <div className="relative flex-1">
    <button
      type="button"
      onClick={() => setShowLetterTypeDropdown((v) => !v)}
      onBlur={() =>
        setTimeout(() => setShowLetterTypeDropdown(false), 150)
      }
      className={cn(
        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
        letterType
          ? "bg-th-accent-50 border-th-accent-200 text-th-accent-800 dark:bg-th-accent-900/35 dark:text-th-accent-400 dark:border-th-accent-800/50"
          : "bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600",
      )}
    >
      <div className="flex items-center gap-2">
        <FileType
          size={15}
          className={
            letterType ? "text-th-accent-500" : "text-slate-400"
          }
        />
        {letterType ? (
          <span>
            <span className="font-semibold">
              {letterTypeOptions.find(
                (o) => o.value === letterType,
              )?.label ?? letterType}
            </span>
            <span className="text-th-accent-500 text-xs ml-2">
              —{" "}
              {
                letterTypeOptions.find(
                  (o) => o.value === letterType,
                )?.desc
              }
            </span>
          </span>
        ) : (
          <span>Выберите тип документа...</span>
        )}
      </div>
      <ChevronDown
        size={15}
        className={cn(
          "transition-transform",
          showLetterTypeDropdown && "rotate-180",
        )}
      />
    </button>
    <AnimatePresence>
      {showLetterTypeDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-[80] overflow-y-auto max-h-[180px] py-1"
        >
          {letterTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onMouseDown={() => {
                setLetterType(opt.value);
                setShowLetterTypeDropdown(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                letterType === opt.value && "bg-slate-50",
              )}
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500">
                  {opt.desc}
                </p>
              </div>
              {letterType === opt.value && (
                <Check size={12} className="text-slate-400" />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
