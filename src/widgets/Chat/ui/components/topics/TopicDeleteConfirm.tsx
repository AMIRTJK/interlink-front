import { motion } from "framer-motion";
import { TOPIC_TEXTS } from "./model";

// Подтверждение удаления прямо под вкладками: модалка ради одного «да/нет»
// в выезжающем окне чата перекрыла бы саму беседу.

interface IProps {
  title: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TopicDeleteConfirm = ({ title, isDeleting, onConfirm, onCancel }: IProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15 }}
    role="alertdialog"
    aria-label={TOPIC_TEXTS.removeConfirm(title)}
    className="mx-4 sm:mx-6 mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-2 border bg-[rgb(var(--th-danger-rgb)/0.08)] border-[rgb(var(--th-danger-rgb)/0.3)]"
  >
    <div className="flex-1 min-w-[10rem]">
      <p className="text-xs font-semibold text-[var(--th-text)]">{TOPIC_TEXTS.removeConfirm(title)}</p>
      <p className="text-[11px] text-[var(--th-text-muted)]">{TOPIC_TEXTS.removeHint}</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        autoFocus
        onClick={onCancel}
        className="h-7 px-3 rounded-lg text-xs font-medium transition-colors duration-200 text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)]"
      >
        {TOPIC_TEXTS.cancel}
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isDeleting}
        className="h-7 px-3 rounded-lg text-xs font-semibold text-white transition-opacity duration-200 bg-[rgb(var(--th-danger-rgb))] hover:opacity-90 disabled:opacity-50"
      >
        {TOPIC_TEXTS.removeAction}
      </button>
    </div>
  </motion.div>
);
