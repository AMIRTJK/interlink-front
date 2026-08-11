import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "../../../../lib/utils";

const OPTION_HEIGHT = 30;
const PANEL_MAX_HEIGHT = 240;
const PANEL_GAP = 4;

interface IProps<T extends string> {
  id?: string;
  value: T;
  options: { value: T; label: string }[];
  disabled?: boolean;
  onChange: (value: T) => void;
}

interface IPanelPosition {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
}

// Список открывается порталом в body с фиксированным позиционированием: тело
// диалога прокручивается (overflow-y-auto) и обрезало бы обычный absolute-слой.
const positionOf = (
  trigger: HTMLElement,
  optionCount: number,
): IPanelPosition => {
  const rect = trigger.getBoundingClientRect();
  const height = Math.min(optionCount * OPTION_HEIGHT + 8, PANEL_MAX_HEIGHT);
  const fitsBelow = window.innerHeight - rect.bottom > height + PANEL_GAP;
  return {
    left: rect.left,
    width: rect.width,
    ...(fitsBelow
      ? { top: rect.bottom + PANEL_GAP }
      : { bottom: window.innerHeight - rect.top + PANEL_GAP }),
  };
};

export const SelectBox = <T extends string>({
  id,
  value,
  options,
  disabled,
  onChange,
}: IProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<IPanelPosition | null>(null);
  const [highlighted, setHighlighted] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  const open = () => {
    const trigger = triggerRef.current;
    if (!trigger || disabled) return;
    setPosition(positionOf(trigger, options.length));
    setHighlighted(Math.max(0, options.findIndex((o) => o.value === value)));
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const pick = (index: number) => {
    const option = options[index];
    setIsOpen(false);
    if (option && option.value !== value) onChange(option.value);
  };

  // Пересчёт до отрисовки: панель не должна «прыгать» на первом кадре.
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    setPosition(positionOf(triggerRef.current, options.length));
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      close();
    };
    // Клавиатуру слушаем на фазе перехвата и гасим событие: иначе Escape дошёл бы
    // до обработчика диалога «Абзац» и закрыл его целиком вместо списка.
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = ["Escape", "ArrowDown", "ArrowUp", "Home", "End", "Enter", " "];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") return close();
      if (e.key === "Enter" || e.key === " ") return pick(highlighted);
      setHighlighted((prev) => {
        if (e.key === "Home") return 0;
        if (e.key === "End") return options.length - 1;
        const step = e.key === "ArrowDown" ? 1 : -1;
        return (prev + step + options.length) % options.length;
      });
    };
    // Панель спозиционирована фиксированно — при прокрутке страницы или холста
    // она бы «отклеилась» от поля, поэтому просто закрываем её.
    const handleViewportChange = () => close();

    // Без списка зависимостей намеренно: обработчики читают актуальные
    // highlighted/options, а перерегистрация случается только при открытом
    // списке и его перерисовке (наведение, стрелки) — это дёшево.
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("resize", handleViewportChange);
    document.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", handleViewportChange);
      document.removeEventListener("scroll", handleViewportChange, true);
    };
  });

  return (
    <>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={(e) => {
          // Стрелки на закрытом поле раскрывают список — как в нативном селекте.
          if (isOpen || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
          e.preventDefault();
          open();
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors focus:outline-none",
          disabled
            ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-600"
            : cn(
                "cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
                isOpen && "border-blue-400 dark:border-blue-500",
              ),
        )}
      >
        <span className="truncate">{selected?.label ?? ""}</span>
        <ChevronDown
          size={12}
          className={cn(
            "flex-shrink-0 text-slate-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && position && (
            <motion.div
              ref={panelRef}
              role="listbox"
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              style={{ position: "fixed", ...position, maxHeight: PANEL_MAX_HEIGHT }}
              className="z-[10000] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 font-sans shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
            >
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => pick(index)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-left text-xs transition-colors",
                    option.value === value
                      ? "font-semibold text-blue-700 dark:text-blue-400"
                      : "text-slate-600 dark:text-zinc-300",
                    index === highlighted &&
                      "bg-slate-100 dark:bg-zinc-700/60",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                    <Check size={12} className="flex-shrink-0" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};
