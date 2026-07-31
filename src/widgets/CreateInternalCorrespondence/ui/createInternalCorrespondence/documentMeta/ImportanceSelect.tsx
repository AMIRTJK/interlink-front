import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Flag } from "lucide-react";

import { cn } from "../../../lib/utils";
import { IMPORTANCE_DOT } from "../../../lib/constants";
import type { ImportanceLevel } from "../../../types";
import type { IImportanceOption } from "./model";

interface IProps {
  importance: ImportanceLevel;
  setImportance: Dispatch<SetStateAction<ImportanceLevel>>;
  showImportanceDropdown: boolean;
  setShowImportanceDropdown: Dispatch<SetStateAction<boolean>>;
  importanceOptions: IImportanceOption[];
  selectedImportance: IImportanceOption;
}

export const ImportanceSelect = ({
  importance,
  setImportance,
  showImportanceDropdown,
  setShowImportanceDropdown,
  importanceOptions,
  selectedImportance,
}: IProps) => (
  <div className="relative flex-shrink-0">
    <button
      type="button"
      onClick={() => setShowImportanceDropdown((v) => !v)}
      onBlur={() =>
        setTimeout(() => setShowImportanceDropdown(false), 150)
      }
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
        selectedImportance.badgeBg,
        selectedImportance.badgeBorder,
        selectedImportance.badgeText,
      )}
    >
      <Flag size={14} className={selectedImportance.flagFill} />
      <span>{selectedImportance.label}</span>
      <ChevronDown
        size={13}
        className={cn(
          "transition-transform",
          showImportanceDropdown && "rotate-180",
        )}
      />
    </button>
    <AnimatePresence>
      {showImportanceDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-[80] overflow-hidden py-1 min-w-[220px]"
        >
          {importanceOptions.map((opt) => (
            <button
              key={opt.value}
              onMouseDown={() => {
                setImportance(opt.value);
                setShowImportanceDropdown(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50",
                importance === opt.value && "bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 border",
                  IMPORTANCE_DOT[opt.value],
                )}
              />
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    opt.badgeText,
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-slate-400">
                  {opt.desc}
                </p>
              </div>
              {importance === opt.value && (
                <Check
                  size={13}
                  className="text-slate-400 flex-shrink-0"
                />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
