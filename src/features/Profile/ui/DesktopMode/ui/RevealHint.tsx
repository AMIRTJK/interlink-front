import type { Ref } from "react";
import { motion } from "framer-motion";
import { LOCK_TEXTS } from "../lockModel";

interface IProps {
  isDark: boolean;
  onReveal: () => void;
  // AnimatePresence в режиме popLayout измеряет уходящий элемент через ref.
  ref?: Ref<HTMLButtonElement>;
}

export const RevealHint = ({ isDark, onReveal, ref }: IProps) => (
  <motion.button
    ref={ref}
    type="button"
    onClick={onReveal}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    /* Исчезает мгновенно: иначе текст просвечивает сквозь проявляющуюся стеклянную карточку. */
    exit={{ opacity: 0, transition: { duration: 0 } }}
    transition={{ duration: 0.4 }}
    className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-medium tracking-[0.14em] uppercase cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-amber-300/70 ${isDark ? "text-white/55 hover:text-white/90" : "text-slate-600 hover:text-slate-900"}`}
  >
    <span className="block motion-safe:animate-pulse">{LOCK_TEXTS.revealHint}</span>
  </motion.button>
);
