import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import type { TChatMemberRole } from "../../model";
import { CHAT_ROLE_LABELS } from "../../model/constants";

// Выбор роли участника. Нативный <select> здесь не годится: его выпадающий
// список рисует ОС по системной теме и в тёмной теме он остаётся светлым —
// пункты сливаются с фоном. Рисуем собственный поповер в стиле чата.

/** Владельца в списке нет: роль владельца не назначают, она переходит с беседой. */
const ROLE_OPTIONS: TChatMemberRole[] = ["admin", "member"];

interface IProps {
  value: TChatMemberRole;
  onChange: (role: TChatMemberRole) => void;
  isDark: boolean;
  /** Имя участника — уходит в aria-label, иначе кнопка безымянная для скринридера. */
  memberName: string;
}

export const RoleSelect = ({ value, onChange, isDark, memberName }: IProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const currentLabel = CHAT_ROLE_LABELS[value] ?? CHAT_ROLE_LABELS.member;

  return (
    <div ref={rootRef} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Роль участника ${memberName}: ${currentLabel}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-all duration-200 ${
          isDark
            ? "bg-[var(--th-chip-bg)] text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)]"
            : "bg-[var(--th-chip-bg)] text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)]"
        }`}
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 top-full mt-1 z-40 min-w-[140px] rounded-xl overflow-hidden py-1 ${
              isDark
                ? "bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)]"
                : "bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)]"
            }`}
            style={{
              boxShadow: isDark
                ? "0 12px 32px rgb(var(--th-shadow-rgb) / 0.5)"
                : "0 12px 32px rgb(var(--th-accent-rgb) / 0.15)",
            }}
          >
            {ROLE_OPTIONS.map((role) => {
              const isSelected = role === value;
              const label = CHAT_ROLE_LABELS[role];
              return (
                <li key={role} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (!isSelected) onChange(role);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left transition-colors duration-150 ${
                      isDark
                        ? "text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)]"
                        : "text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)]"
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected && (
                      <Check
                        className="w-3 h-3 text-[var(--th-accent-text)]"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
