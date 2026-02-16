import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserOutlined,
  CloseOutlined,
  CheckCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { useGetQuery } from "@shared/lib";
import { Input, Spin, Empty, Avatar } from "antd";
import { Recipient } from "./DocumentHeaderForm";

interface RecipientSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  selectedRecipients: Recipient[];
  onChange: (recipients: Recipient[]) => void;
  api: string;
  title?: string;
}

export const RecipientSelectorModal: React.FC<RecipientSelectorModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  selectedRecipients,
  onChange,
  api,
  title = "Выбор получателей",
}) => {
  const primaryColor = "#8b5cf6";
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const textPrimary = isDarkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-500";
  const textTertiary = isDarkMode ? "text-gray-500" : "text-gray-400";

  const searchParams = useMemo(() => {
    return debouncedSearch ? { search: debouncedSearch, } : {};
  }, [debouncedSearch]);

    

  const { data: usersData, isLoading: loadingUsers } = useGetQuery({
    url: api,
    useToken: true,
    params: searchParams,
  });

  const recipientsList: Recipient[] = usersData?.data?.data || [];

  const toggleRecipient = (recipient: Recipient) => {
    const isSelected = selectedRecipients.some((r) => r.id === recipient.id);
    if (isSelected) {
      onChange(selectedRecipients.filter((item) => item.id !== recipient.id));
    } else {
      onChange([...selectedRecipients, recipient]);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const renderContent = () => {
    if (loadingUsers) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (recipientsList.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full opacity-60">
          <Empty
            description={
              <span className={textSecondary}>Пользователи не найдены</span>
            }
          />
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {recipientsList.map((recipient) => {
          const isSelected = selectedRecipients.some(
            (r) => r.id === recipient.id,
          );
          return (
            <button
              key={recipient.id}
              onClick={() => toggleRecipient(recipient)}
              className={`
                w-full p-4 rounded-2xl transition-all flex items-center gap-3 border text-left group
                ${
                  isSelected
                    ? "border-violet-500 bg-violet-500/10"
                    : isDarkMode
                      ? "bg-gray-900/40 border-gray-700/30 hover:bg-gray-800"
                      : "bg-gray-50/80 border-gray-200/50 hover:bg-gray-100"
                }
              `}
            >
              <Avatar
                src={recipient.photo_path}
                size={48}
                icon={<UserOutlined />}
              />

              <div className="flex-1">
                <p className={`font-semibold ${textPrimary}`}>
                  {recipient.full_name}
                </p>
                <p className={`text-sm ${textSecondary}`}>
                  {recipient.position}
                </p>
              </div>
              {isSelected && (
                <CheckCircleFilled
                  style={{ fontSize: "24px", color: primaryColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  };

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
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`
               relative flex flex-col w-full max-w-lg max-h-[80vh]
               rounded-3xl shadow-2xl backdrop-blur-2xl border
               ${isDarkMode ? "bg-gray-800/95 border-gray-700/50" : "bg-white/95 border-gray-200/50"}
             `}
          >
            <div
              className={`px-6 py-5 flex items-center justify-between border-b ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"}`}
            >
              <h3
                className={`text-xl font-bold flex items-center gap-3 ${textPrimary}`}
              >
                <UserOutlined style={{ fontSize: "24px" }} />
                {title}
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-all flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 ${textTertiary}`}
              >
                <CloseOutlined style={{ fontSize: "20px" }} />
              </button>
            </div>

            <div className="px-6 pt-4 pb-2 w-full transition-all duration-300 ease-out transform">
              <Input
                size="large"
                placeholder="Поиск..."
                prefix={
                  <SearchOutlined
                    className={`text-lg mr-2 transition-colors duration-300 ${isSearchFocused ? "text-blue-600" : "text-gray-400"}`}
                  />
                }
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`w-full h-12 rounded-2xl border text-base shadow-sm transition-all duration-300 ${isSearchFocused ? "border-blue-500 shadow-lg shadow-blue-500/15" : "border-gray-200 hover:border-blue-300"} ${isDarkMode ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder:text-gray-500" : "bg-gray-50/50 text-gray-900"}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative min-h-[200px]">
              {renderContent()}
            </div>

            <div
              className={`px-6 py-4 border-t flex items-center justify-between ${isDarkMode ? "border-gray-700/50" : "border-gray-200/50"}`}
            >
              <p className={`text-sm ${textSecondary}`}>
                Выбрано: {selectedRecipients.length}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-white font-medium text-sm shadow-lg transition-all hover:shadow-xl hover:opacity-90 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                Готово
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
