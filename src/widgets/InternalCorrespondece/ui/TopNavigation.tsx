import React, { useState } from "react";
// Импортируем иконки из Ant Design
import {
  InboxOutlined,
  SendOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BgColorsOutlined,
  SunOutlined,
  MoonOutlined,
  SettingOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Mocks ---
interface NavRegistry {
  label: string;
  items: {
    id: string;
    title: string;
    date: string;
    from?: string;
    status?: string;
  }[];
}

const softMaterialPresets = [
  { name: "Lavender", primary: "#A78BFA", accent: "#DDD6FE" },
  { name: "Rose", primary: "#FB7185", accent: "#FECDD3" },
  { name: "Sky", primary: "#38BDF8", accent: "#BAE6FD" },
];

const navRegistries: Record<string, NavRegistry> = {
  inbox: {
    label: "Входящие",
    items: [
      {
        id: "1",
        title: "О согласовании бюджета",
        date: "16.04.2024",
        from: "Иванов И.И.",
        status: "Новое",
      },
      {
        id: "2",
        title: "Запрос документов",
        date: "15.04.2024",
        from: "Петрова М.А.",
        status: "Прочитано",
      },
    ],
  },
  sent: {
    label: "Отправленные",
    items: [
      {
        id: "1",
        title: "Отчет за квартал",
        date: "15.04.2024",
        status: "Доставлено",
      },
    ],
  },
  drafts: {
    label: "Черновики",
    items: [
      {
        id: "1",
        title: "Об утверждении структуры",
        date: "16.04.2024",
        status: "Редактируется",
      },
    ],
  },
  history: {
    label: "История",
    items: [
      { id: "1", title: "Приказ №125", date: "10.04.2024", status: "Архив" },
    ],
  },
};

// --- Helper Component ---
// Antd иконки ведут себя как текст, поэтому используем text-[16px] для размера
const NavButton = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
      active
        ? "bg-black/5 dark:bg-white/5 text-gray-900 dark:text-gray-100"
        : "text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5"
    }`}
  >
    {/* Клонируем иконку, чтобы можно было передать стили, если нужно, или просто рендерим */}
    <span className="text-[16px] flex items-center">{icon}</span>
    <span>{label}</span>
  </button>
);

// --- Main Component ---
interface TopNavigationProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  isDarkMode,
  toggleDarkMode,
}) => {
  const [activeNavRegistry, setActiveNavRegistry] = useState<string | null>(
    null,
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const currentPreset = softMaterialPresets[0];

  const textPrimary = isDarkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-600";

  return (
    <>
      <nav
        className="h-16 px-14 flex items-center justify-between backdrop-blur-xl border-b z-30 transition-all duration-300 sticky top-0"
        style={{
          backgroundColor: isDarkMode
            ? "rgba(17, 24, 39, 0.7)"
            : "rgba(255, 255, 255, 0.7)",
          borderColor: isDarkMode
            ? "rgba(75, 85, 99, 0.3)"
            : "rgba(229, 231, 235, 0.5)",
        }}
      >
        {/* Left - Navigation */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1">
            <NavButton
              icon={<InboxOutlined />}
              label="Входящие"
              active={activeNavRegistry === "inbox"}
              onClick={() =>
                setActiveNavRegistry(
                  activeNavRegistry === "inbox" ? null : "inbox",
                )
              }
            />
            <NavButton
              icon={<SendOutlined />}
              label="Отправленные"
              active={activeNavRegistry === "sent"}
              onClick={() =>
                setActiveNavRegistry(
                  activeNavRegistry === "sent" ? null : "sent",
                )
              }
            />
            <NavButton
              icon={<FileTextOutlined />}
              label="Черновики"
              active={activeNavRegistry === "drafts"}
              onClick={() =>
                setActiveNavRegistry(
                  activeNavRegistry === "drafts" ? null : "drafts",
                )
              }
            />
            <NavButton
              icon={<HistoryOutlined />}
              label="История"
              active={activeNavRegistry === "history"}
              onClick={() =>
                setActiveNavRegistry(
                  activeNavRegistry === "history" ? null : "history",
                )
              }
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`p-2 rounded-lg transition-all ${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`}
          >
            <BgColorsOutlined className="text-[20px]" />
          </button>

          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all ${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`}
          >
            {isDarkMode ? (
              <SunOutlined className="text-[20px]" />
            ) : (
              <MoonOutlined className="text-[20px]" />
            )}
          </button>

          <button
            className={`p-2 rounded-lg transition-all ${textSecondary} hover:bg-black/5 dark:hover:bg-white/5`}
          >
            <SettingOutlined className="text-[20px]" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

          <button
            className={`px-4 py-2 rounded-lg transition-all ${textSecondary} hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium`}
          >
            <SearchOutlined className="text-[16px]" />
          </button>
        </div>
      </nav>

      {/* DROPDOWN REGISTRY */}
      <AnimatePresence>
        {activeNavRegistry && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNavRegistry(null)}
              className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
            />

            {/* Panel */}
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

              <div className="flex-1 overflow-auto p-3 space-y-2">
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
                    <div className="flex justify-between mb-1">
                      <p className={`font-semibold text-sm ${textPrimary}`}>
                        {item.title}
                      </p>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: currentPreset.accent,
                          color: currentPreset.primary,
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
    </>
  );
};
