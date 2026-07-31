import React from "react";
import { motion } from "framer-motion";
import { Forward, X } from "lucide-react";
import { Message, mockContacts as contacts } from "../../model";
import { Translations } from "../../lib/translations";

interface ForwardModalProps {
  message: Message;
  isDark: boolean;
  t: Translations;
  onForwardSend: (targetContactId: string) => void;
  onClose: () => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({
  message,
  isDark,
  t,
  onForwardSend,
  onClose,
}) => (
  <motion.div
    onClick={onClose}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{
      background: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.25)",
      backdropFilter: "blur(20px)",
    }}
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className={`w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden ${isDark ? "bg-[#150e28]/95 border border-white/10 backdrop-blur-xl text-white" : "bg-white border border-gray-200 text-gray-800 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.15)]"}`}
      style={{
        boxShadow: isDark
          ? "0 20px 60px rgba(139,92,246,0.4)"
          : "0 15px 40px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? "border-white/10" : "border-gray-100"}`}
      >
        <div className="flex items-center gap-2">
          <Forward className="w-4 h-4 text-violet-300" />
          <h3
            className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
          >
            {t.forwardMessage}
          </h3>
        </div>
        <button
          onClick={onClose}
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/15 text-white/50 hover:text-white" : "hover:bg-black/5 text-gray-400 hover:text-gray-605"}`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div
        className={`px-5 py-3 border-b ${isDark ? "border-white/10 bg-white/5" : "border-gray-100 bg-gray-50"}`}
      >
        <p
          className={`text-xs line-clamp-2 italic ${isDark ? "text-white/50" : "text-gray-500"}`}
        >
          "{message.text}"
        </p>
      </div>
      <div className="max-h-64 overflow-y-auto py-2 compose-modal-scroll">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onForwardSend(contact.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ease-in-out text-left group ${isDark ? "hover:bg-white/8" : "hover:bg-black/4"}`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-10 h-10 rounded-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 rounded-full ${isDark ? "border-[#150e28]" : "border-white"}`}
                style={{ display: contact.online ? "block" : "none" }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${isDark ? "text-white/90" : "text-gray-900"}`}
              >
                {contact.name}
              </p>
              <p
                className={`text-xs truncate ${isDark ? "text-white/40" : "text-gray-500"}`}
              >
                {contact.lastMessage}
              </p>
            </div>
            <div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${contact.online ? "bg-green-400" : isDark ? "bg-white/20" : "bg-gray-300"}`}
            />
          </button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);
