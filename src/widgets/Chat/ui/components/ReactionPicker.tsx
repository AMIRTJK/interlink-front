import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { QUICK_REACTIONS, EMOJI_CATEGORY_EMOJIS } from "../../model";

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  isMe: boolean;
  isDark: boolean;
  msgId?: string;
  buttonRect?: DOMRect | null;
}

const ALL_EMOJIS = EMOJI_CATEGORY_EMOJIS.flat();

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onSelect,
  onClose,
  isMe,
  isDark,
  msgId,
  buttonRect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 12, left: 12 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  useLayoutEffect(() => {
    const targetRect =
      buttonRect ??
      (msgId ? document.getElementById(`chat-msg-${msgId}`)?.getBoundingClientRect() : null);

    const pickerWidth = ref.current?.offsetWidth || 270;
    const pickerHeight = ref.current?.offsetHeight || (isExpanded ? 220 : 48);
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

    let leftPos = 12;
    let topPos = 12;

    if (targetRect) {
      if (isMe) {
        leftPos = targetRect.right - pickerWidth;
      } else {
        leftPos = targetRect.left;
      }

      // Пытаемся расположить по умолчанию сверху цели
      topPos = targetRect.top - pickerHeight - 8;

      // Если вылезает за верхнюю границу экрана — выводим снизу цели
      if (topPos < 12) {
        topPos = targetRect.bottom + 8;
      }
    } else {
      leftPos = (viewportWidth - pickerWidth) / 2;
      topPos = (viewportHeight - pickerHeight) / 2;
    }

    // Жесткое ограничение в пределах экрана (body) по всем 4 сторонам
    leftPos = Math.max(12, Math.min(leftPos, viewportWidth - pickerWidth - 12));
    topPos = Math.max(12, Math.min(topPos, viewportHeight - pickerHeight - 12));

    setPos({ top: topPos, left: leftPos });
  }, [buttonRect, msgId, isMe, isExpanded]);

  const portalContent = (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="fixed flex flex-col rounded-2xl p-1 z-[9999] backdrop-blur-2xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)]"
      style={{
        left: pos.left,
        top: pos.top,
        boxShadow: "0 8px 30px rgb(var(--th-accent-rgb) / 0.3)",
      }}
    >
      <div className="flex items-center gap-0.5">
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose?.();
            }}
            className="w-8 h-8 flex items-center justify-center text-lg rounded-full transition-all duration-150 ease-in-out hover:scale-125 hover:bg-[var(--th-hover-bg-strong)]"
          >
            <span>{emoji}</span>
          </button>
        ))}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          title={isExpanded ? "Свернуть" : "Все смайлики"}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150 ease-in-out text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)] hover:text-[var(--th-text)]"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t mt-1 pt-1 border-[var(--th-divider)]"
          >
            <div className="grid grid-cols-7 gap-1 p-1 max-h-40 overflow-y-auto max-w-[240px]">
              {ALL_EMOJIS.map((emoji, idx) => (
                <button
                  key={`${emoji}-${idx}`}
                  onClick={() => {
                    onSelect(emoji);
                    onClose?.();
                  }}
                  className="w-7 h-7 flex items-center justify-center text-base rounded-lg transition-all duration-150 ease-in-out hover:scale-120 hover:bg-[var(--th-hover-bg-strong)]"
                >
                  <span>{emoji}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return typeof document !== "undefined"
    ? createPortal(portalContent, document.body)
    : portalContent;
};
