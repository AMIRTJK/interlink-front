import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bold,
  ChevronDown,
  Heading1,
  Heading2,
  Highlighter,
  Italic,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";

import { TBtn } from "../../TBtn";
import { cn } from "../../../lib/utils";
import { FONT_SIZES } from "../../../lib/constants";

interface IProps {
  isReadOnly: boolean;
  canUndo: boolean;
  canRedo: boolean;
  undoEdit: () => void;
  redoEdit: () => void;
  activeFmt: Record<string, boolean>;
  execCmd: (command: string, value?: string) => void;
  fontSize: string;
  showFontSizeDropdown: boolean;
  setShowFontSizeDropdown: Dispatch<SetStateAction<boolean>>;
  handleFontSize: (size: string) => void;
}

export const ToolbarFormatGroup = ({
  isReadOnly,
  canUndo,
  canRedo,
  undoEdit,
  redoEdit,
  activeFmt,
  execCmd,
  fontSize,
  showFontSizeDropdown,
  setShowFontSizeDropdown,
  handleFontSize,
}: IProps) => (
  <>
    <TBtn
      disabled={isReadOnly || !canUndo}
      onMouseDown={(e) => {
        e.preventDefault();
        undoEdit();
      }}
      title="Отменить (Ctrl+Z)"
    >
      <Undo size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly || !canRedo}
      onMouseDown={(e) => {
        e.preventDefault();
        redoEdit();
      }}
      title="Повторить (Ctrl+Y)"
    >
      <Redo size={14} />
    </TBtn>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.h1}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("formatBlock", "h1");
      }}
      title="Заголовок 1"
    >
      <Heading1 size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.h2}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("formatBlock", "h2");
      }}
      title="Заголовок 2"
    >
      <Heading2 size={14} />
    </TBtn>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <div className="relative flex-shrink-0">
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          if (isReadOnly) return;
          setShowFontSizeDropdown((v) => !v);
        }}
        disabled={isReadOnly}
        className={cn(
          "flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium transition-colors border",
          isReadOnly
            ? "text-slate-300 border-slate-100 bg-slate-50 cursor-not-allowed"
            : "text-slate-600 hover:bg-slate-100 border-slate-200 bg-white",
        )}
      >
        <span>{fontSize ? `${fontSize}px` : "—"}</span>
        <ChevronDown
          size={10}
          className={cn(
            "transition-transform",
            showFontSizeDropdown && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {showFontSizeDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1 min-w-[72px]"
          >
            {FONT_SIZES.map((s) => (
              <button
                key={s}
                onMouseDown={() => handleFontSize(s)}
                className={cn(
                  "w-full px-3 py-1.5 text-xs font-mono text-left hover:bg-slate-50 transition-colors",
                  fontSize === s &&
                    "bg-blue-50 text-blue-700 font-bold",
                )}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    <div className="w-px h-5 bg-slate-200 mx-1 flex-shrink-0" />
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.bold}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("bold");
      }}
      title="Жирный"
    >
      <Bold size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.italic}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("italic");
      }}
      title="Курсив"
    >
      <Italic size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.underline}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("underline");
      }}
      title="Подчёркнутый"
    >
      <Underline size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      active={activeFmt.strikeThrough}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("strikeThrough");
      }}
      title="Зачёркнутый"
    >
      <Strikethrough size={14} />
    </TBtn>
    <TBtn
      disabled={isReadOnly}
      onMouseDown={(e) => {
        e.preventDefault();
        execCmd("hiliteColor", "#fef08a");
      }}
      title="Выделить"
    >
      <Highlighter size={14} />
    </TBtn>
  </>
);
