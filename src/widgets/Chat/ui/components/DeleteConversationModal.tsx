import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Trash, X, MessageCircleOff, AlertTriangle } from "lucide-react";
import { PaperShredder } from "./PaperShredder";

interface DeleteConversationModalProps {
  contactName: string;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onCancel: () => void;
  isDark: boolean;
  title: string;
  descPrefix: string;
  deleteForMeLabel: string;
  deleteForMeDesc: string;
  deleteForEveryoneLabel: string;
  deleteForEveryoneDesc: string;
  cancelLabel: string;
  deletingForMeLabel: string;
  deletingForEveryoneLabel: string;
}

export const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  contactName,
  onDeleteForMe,
  onDeleteForEveryone,
  onCancel,
  isDark,
  title,
  descPrefix,
  deleteForMeLabel,
  deleteForMeDesc,
  deleteForEveryoneLabel,
  deleteForEveryoneDesc,
  cancelLabel,
  deletingForMeLabel,
  deletingForEveryoneLabel,
}) => {
  const [phase, setPhase] = useState<"choice" | "shredding">("choice");
  const [deleteMode, setDeleteMode] = useState<"me" | "everyone" | null>(null);

  const onDeleteForMeRef = useRef(onDeleteForMe);
  onDeleteForMeRef.current = onDeleteForMe;

  const onDeleteForEveryoneRef = useRef(onDeleteForEveryone);
  onDeleteForEveryoneRef.current = onDeleteForEveryone;

  const handleDelete = (mode: "me" | "everyone") => {
    setDeleteMode(mode);
    setPhase("shredding");
  };

  const handleShredComplete = () => {
    if (deleteMode === "me") {
      onDeleteForMeRef.current();
    } else if (deleteMode === "everyone") {
      onDeleteForEveryoneRef.current();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "var(--th-scrim)",
        backdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl bg-[var(--th-menu-bg)] border border-[var(--th-menu-border)]"
        style={{
          boxShadow: "0 20px 60px rgb(var(--th-accent-rgb) / 0.25)",
        }}
      >
        <div
          className="flex items-center gap-3 px-5 py-4 border-b border-[var(--th-divider)]"
        >
          <div className="w-9 h-9 rounded-full bg-[rgb(var(--th-danger-rgb)/0.2)] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-[rgb(var(--th-danger-rgb))]" />
          </div>
          <div>
            <h3
              className="font-semibold text-sm text-[var(--th-text)]"
            >
              {title}
            </h3>
            <p
              className="text-xs mt-0.5 text-[var(--th-text-muted)]"
            >
              {contactName}
            </p>
          </div>
          {phase === "choice" && (
            <button
              onClick={onCancel}
              className="ml-auto w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text-muted)]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="px-5 py-5 space-y-4">
          {phase === "choice" && (
            <div
              className="rounded-xl px-4 py-3 border bg-[var(--th-chip-bg)] border-[var(--th-panel-border)]"
            >
              <p
                className="text-xs leading-relaxed text-[var(--th-text-muted)]"
              >
                {descPrefix}{" "}
                <strong className="text-[var(--th-text)]">
                  {contactName}
                </strong>
                .
              </p>
            </div>
          )}

          {phase === "shredding" && (
            <div
              className="rounded-xl px-4 py-3 border bg-[var(--th-chip-bg)] border-[var(--th-panel-border)]"
            >
              <PaperShredder onComplete={handleShredComplete} isDark={isDark} />
            </div>
          )}

          {phase === "shredding" && (
            <div
              className="flex items-center justify-center gap-2 text-[var(--th-text-muted)]"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-4 h-4 rounded-full border-2 border-[rgb(var(--th-accent-rgb))] border-t-transparent"
              />
              <span className="text-xs font-medium">
                {deleteMode === "everyone"
                  ? deletingForEveryoneLabel
                  : deletingForMeLabel}
              </span>
            </div>
          )}

          {phase === "choice" && (
            <div className="space-y-2">
              <button
                onClick={() => handleDelete("me")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out border bg-[var(--th-chip-bg)] hover:bg-[var(--th-hover-bg-strong)] text-[var(--th-text)] border-[var(--th-panel-border)]"
              >
                <MessageCircleOff className="w-4 h-4 text-[var(--th-accent-text)] flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{deleteForMeLabel}</p>
                  <p
                    className="text-xs font-normal text-[var(--th-text-faint)]"
                  >
                    {deleteForMeDesc}
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleDelete("everyone")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-[rgb(var(--th-danger-rgb)/0.15)] hover:bg-[rgb(var(--th-danger-rgb)/0.25)] text-[rgb(var(--th-danger-rgb))] transition-all duration-200 ease-in-out border border-[rgb(var(--th-danger-rgb)/0.3)]"
              >
                <Trash className="w-4 h-4 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{deleteForEveryoneLabel}</p>
                  <p className="text-xs font-normal text-[rgb(var(--th-danger-rgb)/0.75)]">
                    {deleteForEveryoneDesc}
                  </p>
                </div>
              </button>

              <button
                onClick={onCancel}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg)]"
              >
                {cancelLabel}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
