import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserOutlined, CloseOutlined, DeleteOutlined } from "@ant-design/icons";
import { Recipient } from "./DocumentHeaderForm";
import { Avatar } from "antd";

interface SelectedRecipientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  recipients: Recipient[];
  onRemove: (id: number) => void;
}

export const SelectedRecipientsModal: React.FC<
  SelectedRecipientsModalProps
> = ({ isOpen, onClose, isDarkMode, recipients, onRemove }) => {
  const textPrimary = isDarkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-500";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={`
              relative flex flex-col w-full max-w-md max-h-[70vh]
              rounded-3xl shadow-2xl backdrop-blur-2xl border
              ${isDarkMode ? "bg-gray-800/95 border-gray-700/50" : "bg-white/95 border-gray-200/50"}
            `}
          >
            <div
              className={`px-6 py-4 flex items-center justify-between border-b ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"}`}
            >
              <h3
                className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}
              >
                <UserOutlined />
                Выбрано: {recipients.length}
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5 ${textSecondary}`}
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {recipients.length === 0 ? (
                <div className={`text-center py-8 ${textSecondary}`}>
                  Список пуст
                </div>
              ) : (
                recipients.map((recipient) => (
                  <div
                    key={recipient.id}
                    className={`
                      w-full p-3 rounded-2xl flex items-center gap-3 border transition-all
                      ${isDarkMode ? "bg-gray-900/30 border-gray-700/30" : "bg-gray-50/50 border-gray-100"}
                    `}
                  >
                    <Avatar
                      src={recipient.photo_path || null}
                      size={40}
                      icon={<UserOutlined />}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm truncate ${textPrimary}`}
                      >
                        {recipient.full_name}
                      </p>{" "}
                      {/* ИСПРАВЛЕНО */}
                      <p className={`text-xs truncate ${textSecondary}`}>
                        {recipient.position}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(recipient.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div
              className={`px-6 py-4 border-t ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"}`}
            >
              <button
                onClick={onClose}
                className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
              >
                Закрыть
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
