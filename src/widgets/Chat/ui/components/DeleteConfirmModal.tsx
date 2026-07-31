import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, X, MessageCircleOff, Trash } from "lucide-react";
import { PaperShredder } from "./PaperShredder";

interface DeleteConfirmModalProps {
  msgText: string;
  isMe: boolean;
  onDeleteForMe: () => void;
  onDeleteForEveryone: () => void;
  onCancel: () => void;
  isDark: boolean;
  title: string;
  subtitle: string;
  deleteForMeLabel: string;
  deleteForMeDesc: string;
  deleteForEveryoneLabel: string;
  deleteForEveryoneDesc: string;
  cancelLabel: string;
  deletingForMeLabel: string;
  deletingForEveryoneLabel: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  msgText,
  isMe,
  onDeleteForMe,
  onDeleteForEveryone,
  onCancel,
  isDark,
  title,
  subtitle,
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

  const handleDelete = (mode: "me" | "everyone") => {
    setDeleteMode(mode);
    setPhase("shredding");
  };

  const handleShredComplete = () => {
    if (deleteMode === "me") onDeleteForMe();
    else if (deleteMode === "everyone") onDeleteForEveryone();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
        backdropFilter: "blur(20px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDark ? "backdrop-blur-2xl bg-white/10 border border-white/20" : "backdrop-blur-2xl bg-white/80 border border-white/30"}`}
        style={{
          boxShadow: isDark
            ? "0 20px 60px rgba(139,92,246,0.4)"
            : "0 20px 60px rgba(139,92,246,0.1)",
        }}
      >
        <div
          className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? "border-white/10" : "border-black/5"}`}
        >
          <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h3>
            <p
              className={`text-xs mt-0.5 ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {subtitle}
            </p>
          </div>
          {phase === "choice" && (
            <button
              onClick={onCancel}
              className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="px-5 py-5 space-y-4">
          {phase === "choice" && (
            <div
              className={`rounded-xl px-4 py-3 border ${isDark ? "bg-white/8 border-white/10" : "bg-black/5 border-black/10"}`}
            >
              <p
                className={`text-xs leading-relaxed line-clamp-3 ${isDark ? "text-white/60" : "text-gray-600"}`}
              >
                {msgText || "Voice message"}
              </p>
            </div>
          )}
          {phase === "shredding" && (
            <div
              className={`rounded-xl px-4 py-3 border ${isDark ? "bg-white/8 border-white/10" : "bg-black/5 border-black/10"}`}
            >
              <PaperShredder onComplete={handleShredComplete} isDark={isDark} />
            </div>
          )}
          {phase === "shredding" && (
            <div
              className={`flex items-center justify-center gap-2 ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent"
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out border ${isDark ? "bg-white/8 hover:bg-white/15 text-white/80 border-white/10 hover:border-white/20" : "bg-black/5 hover:bg-black/8 text-gray-700 border-black/10 hover:border-black/15"}`}
              >
                <MessageCircleOff className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">{deleteForMeLabel}</p>
                  <p
                    className={`text-xs font-normal ${isDark ? "text-white/40" : "text-gray-400"}`}
                  >
                    {deleteForMeDesc}
                  </p>
                </div>
              </button>
              {isMe && (
                <button
                  onClick={() => handleDelete("everyone")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-red-500/15 hover:bg-red-500/25 text-red-600 transition-all duration-200 ease-in-out border border-red-500/30"
                >
                  <Trash className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold">{deleteForEveryoneLabel}</p>
                    <p className="text-xs font-normal text-red-500/70">
                      {deleteForEveryoneDesc}
                    </p>
                  </div>
                </button>
              )}
              <button
                onClick={onCancel}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${isDark ? "text-white/40 hover:bg-white/8" : "text-gray-500 hover:bg-black/5"}`}
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
