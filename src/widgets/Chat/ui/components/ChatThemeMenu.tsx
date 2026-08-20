import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { CHAT_THEMES } from "../../model/chatThemes";
import { Translations } from "../../lib/translations";
import { setChatTheme, useChatThemeId } from "../../lib/chatThemeStore";

// Переключатель оформления чата. Живёт рядом с переключателем раскладки — там же,
// где пользователь уже настраивает вид окна, поэтому отдельного экрана настроек
// оформлению не нужно. Один компонент на все оформления: меняется только тон
// кнопки, потому что в классическом она стоит на градиентной шапке, а в
// современном — на светлой панели.
//
// Список рисуется порталом в body с координатами от кнопки: блок управления и
// панель бесед узкие и обрезают содержимое, а прижатый к краю список вылезал бы
// за окно чата.

const MENU_WIDTH = 240;
/** Зазор до края экрана и до самой кнопки. */
const EDGE_GAP = 8;

interface IProps {
  t: Translations;
  /** Тон кнопки: на заливке акцента или на нейтральной поверхности. */
  tone?: "accent" | "surface";
  /** Куда раскрывать список — вниз (панель сверху) или вверх (панель снизу). */
  placement?: "bottom" | "top";
}

const TONE_CLASS: Record<"accent" | "surface", string> = {
  accent:
    "text-[var(--th-on-accent-muted)] hover:bg-[rgb(var(--th-on-accent-rgb)/0.15)]",
  surface:
    "text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg)] hover:text-[var(--th-text)]",
};

/** Координаты списка: прижат к правому краю кнопки, но не выходит за экран. */
const getMenuPosition = (rect: DOMRect, placement: "bottom" | "top") => {
  const maxLeft = window.innerWidth - MENU_WIDTH - EDGE_GAP;
  const left = Math.min(Math.max(rect.right - MENU_WIDTH, EDGE_GAP), maxLeft);

  return placement === "top"
    ? { left, bottom: window.innerHeight - rect.top + EDGE_GAP }
    : { left, top: rect.bottom + EDGE_GAP };
};

export const ChatThemeMenu = ({
  t,
  tone = "accent",
  placement = "bottom",
}: IProps) => {
  const themeId = useChatThemeId();
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setButtonRect(null), []);

  useEffect(() => {
    if (!buttonRect) return;

    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    // Координаты сняты один раз: при прокрутке или смене размера окна список
    // отвязался бы от кнопки, поэтому просто закрываем его.
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [buttonRect, close]);

  const menu = (
    <AnimatePresence>
      {buttonRect && (
        <motion.div
          ref={menuRef}
          role="menu"
          initial={{ opacity: 0, y: placement === "top" ? 8 : -8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: placement === "top" ? 8 : -8, scale: 0.96 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="fixed z-[9999] rounded-2xl overflow-hidden backdrop-blur-2xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)]"
          style={{
            width: MENU_WIDTH,
            ...getMenuPosition(buttonRect, placement),
            boxShadow: "0 12px 40px rgb(var(--th-shadow-rgb) / 0.25)",
          }}
        >
          <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--th-text-faint)]">
            {t.appearance}
          </p>
          {CHAT_THEMES.map((theme) => {
            const isActive = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setChatTheme(theme.id);
                  close();
                }}
                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-[var(--th-hover-bg)]"
                style={isActive ? { background: "var(--th-active-bg)" } : undefined}
              >
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold truncate text-[var(--th-text)]">
                    {t[theme.labelKey]}
                  </span>
                  <span className="block text-[11px] leading-snug text-[var(--th-text-faint)]">
                    {t[theme.descriptionKey]}
                  </span>
                </span>
                {isActive && (
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--th-accent-text)]" />
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        // Прямоугольник снимаем с ref, а не с currentTarget: обновление
        // состояния может выполниться после обработчика, и currentTarget к тому
        // моменту уже сброшен.
        onClick={() =>
          setButtonRect((prev) =>
            prev ? null : (buttonRef.current?.getBoundingClientRect() ?? null),
          )
        }
        aria-label={t.appearance}
        aria-haspopup="menu"
        aria-expanded={!!buttonRect}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${TONE_CLASS[tone]}`}
      >
        <Palette className="w-4.5 h-4.5" />
      </button>
      {typeof document !== "undefined"
        ? createPortal(menu, document.body)
        : menu}
    </>
  );
};
