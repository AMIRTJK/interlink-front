import { useState, type FormEvent, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { TOPIC_TITLE_MAX_LENGTH } from "../../../api/topics";
import { TOPIC_TEXTS } from "./model";

// Поле названия топика — одно и для создания, и для переименования.

interface IProps {
  initialTitle?: string;
  isSaving: boolean;
  onSubmit: (title: string) => void;
  onCancel: () => void;
}

export const TopicNameForm = ({ initialTitle = "", isSaving, onSubmit, onCancel }: IProps) => {
  const [title, setTitle] = useState(initialTitle);
  const trimmed = title.trim();
  const canSubmit = !!trimmed && trimmed !== initialTitle.trim() && !isSaving;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) onSubmit(trimmed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCancel();
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-4 sm:px-6 pb-2"
    >
      <input
        autoFocus
        type="text"
        value={title}
        maxLength={TOPIC_TITLE_MAX_LENGTH}
        placeholder={TOPIC_TEXTS.createPlaceholder}
        aria-label={TOPIC_TEXTS.createPlaceholder}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 min-w-0 h-8 rounded-lg px-3 text-xs font-medium outline-none border bg-[var(--th-input-bg)] border-[var(--th-input-border)] text-[var(--th-text)] placeholder:text-[var(--th-text-faint)] focus:border-[var(--th-accent-border)]"
      />
      <Tooltip title={TOPIC_TEXTS.save}>
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label={TOPIC_TEXTS.save}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 bg-[rgb(var(--th-accent-rgb))] text-[var(--th-on-accent)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
        </button>
      </Tooltip>
      <Tooltip title={TOPIC_TEXTS.cancel}>
        <button
          type="button"
          onClick={onCancel}
          aria-label={TOPIC_TEXTS.cancel}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg-strong)]"
        >
          <X className="w-4 h-4" />
        </button>
      </Tooltip>
    </motion.form>
  );
};
