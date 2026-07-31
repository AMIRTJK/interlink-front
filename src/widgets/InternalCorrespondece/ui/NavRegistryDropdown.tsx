import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClockCircleOutlined, UserOutlined } from "@ant-design/icons";

export interface NavRegistryItem {
  id: string;
  title: string;
  date: string;
  from?: string;
  status?: string;
}

export interface NavRegistry {
  label: string;
  items: NavRegistryItem[];
}

interface NavRegistryDropdownProps {
  activeNavRegistry: string | null;
  navRegistries: Record<string, NavRegistry>;
  onClose: () => void;
  isDarkMode: boolean;
  textPrimary: string;
  textSecondary: string;
  currentPreset: { primary: string; accent: string };
}

export const NavRegistryDropdown: React.FC<NavRegistryDropdownProps> = ({
  activeNavRegistry,
  navRegistries,
  onClose,
  isDarkMode,
  textPrimary,
  textSecondary,
  currentPreset,
}) => {
  return (
    <AnimatePresence>
      {activeNavRegistry && navRegistries[activeNavRegistry] && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
          />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-8 w-96 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 border max-h-[500px] flex flex-col"
            style={{
              backgroundColor: isDarkMode
                ? "rgba(31, 41, 55, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
              borderColor: isDarkMode
                ? "rgba(75, 85, 99, 0.3)"
                : "rgba(229, 231, 235, 0.5)",
            }}
          >
            <div
              className="px-5 py-4 border-b"
              style={{
                borderColor: isDarkMode
                  ? "rgba(75, 85, 99, 0.3)"
                  : "rgba(229, 231, 235, 0.5)",
              }}
            >
              <h3 className={`font-bold text-lg ${textPrimary}`}>
                {navRegistries[activeNavRegistry].label}
              </h3>
            </div>

            <div
              className="flex-1 overflow-auto p-3 space-y-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: isDarkMode
                  ? "#4b5563 #111827"
                  : "#dfdfdf transparent",
              }}
            >
              {navRegistries[activeNavRegistry].items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl cursor-pointer border hover:shadow-md transition-all"
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(17, 24, 39, 0.4)"
                      : "rgba(249, 250, 251, 0.8)",
                    borderColor: isDarkMode
                      ? "rgba(75, 85, 99, 0.3)"
                      : "rgba(229, 231, 235, 0.5)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold text-sm ${textPrimary}`}>
                      {item.title}
                    </p>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: isDarkMode
                          ? "rgba(255, 255, 255, 0.1)"
                          : currentPreset.accent,
                        color: isDarkMode
                          ? "rgba(255, 255, 255, 0.8)"
                          : currentPreset.primary,
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-3 text-xs ${textSecondary}`}
                  >
                    <span className="flex items-center gap-1">
                      <ClockCircleOutlined /> {item.date}
                    </span>
                    {item.from && (
                      <span className="flex items-center gap-1">
                        <UserOutlined /> {item.from}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
