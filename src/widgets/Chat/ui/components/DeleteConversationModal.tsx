import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Trash, X } from "lucide-react";

interface DeleteConversationModalProps {
  contactName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDark: boolean;
  title: string;
  descPrefix: string;
  deleteAllLabel: string;
  cancelLabel: string;
  shreddingLabel: string;
}

export const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  contactName,
  onConfirm,
  onCancel,
  isDark,
  title,
  descPrefix,
  deleteAllLabel,
  cancelLabel,
  shreddingLabel,
}) => {
  const [shredding, setShredding] = useState(false);
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

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
          <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center">
            <Trash className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {title}
            </h3>
            <p
              className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {contactName}
            </p>
          </div>
          <button
            onClick={onCancel}
            className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50" : "hover:bg-black/5 text-gray-500"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          {shredding ? (
            <div className="space-y-3">
              <div
                className="flex gap-0.5 overflow-hidden rounded-xl"
                style={{ height: "64px" }}
              >
                {Array.from({ length: 16 }, (_, i) => (
                  <motion.div
                    key={`cs-${i}`}
                    initial={{ y: 0 }}
                    animate={{
                      y: 80,
                      rotate: (i % 2 === 0 ? 1 : -1) * ((i * 3 + 5) % 15),
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.03,
                      ease: [0.36, 0, 0.66, -0.56],
                    }}
                    className="flex-1 rounded-b-sm bg-gradient-to-b from-violet-500/40 to-fuchsia-500/30"
                  />
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 py-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="w-4 h-4 rounded-full border-2 border-violet-400 border-t-transparent"
                  onAnimationStart={() =>
                    setTimeout(() => onConfirmRef.current(), 900)
                  }
                />
                <span
                  className={`text-xs font-medium ${isDark ? "text-white/50" : "text-gray-500"}`}
                >
                  {shreddingLabel}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p
                className={`text-sm leading-relaxed ${isDark ? "text-white/70" : "text-gray-600"}`}
              >
                {descPrefix}{" "}
                <strong className={isDark ? "text-white" : "text-gray-900"}>
                  {contactName}
                </strong>
                .
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onCancel}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ease-in-out ${isDark ? "bg-white/10 text-white/70 hover:bg-white/15" : "bg-black/5 text-gray-600 hover:bg-black/8"}`}
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={() => setShredding(true)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white transition-all duration-200 ease-in-out"
                >
                  {deleteAllLabel}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
