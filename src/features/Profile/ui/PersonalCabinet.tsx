import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ClipboardList,
  Calendar as CalendarIcon,
  BarChart2,
  FolderOpen,
} from "lucide-react";
import { IUser } from "@entities/login";
import { ProfileInfoTab } from "./tabs/ProfileInfoTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { FilesTab } from "./tabs/FilesTab";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { Calendar } from "@widgets/Calendar";
import { TasksTabPlaceholder } from "./tabs/TasksTabPlaceholder";

type TabKey = "profile" | "tasks" | "calendar" | "analytics" | "files";

interface ITab {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: ITab[] = [
  { key: "profile", label: "Профиль", icon: <User size={16} /> },
  { key: "tasks", label: "Задачи", icon: <ClipboardList size={16} /> },
  { key: "calendar", label: "Календарь", icon: <CalendarIcon size={16} /> },
  { key: "analytics", label: "Аналитика", icon: <BarChart2 size={16} /> },
  { key: "files", label: "Файлы", icon: <FolderOpen size={16} /> },
];

interface IProps {
  userData: IUser | null;
  isLoading: boolean;
  onOpenSettings: () => void;
  currentTheme?: string;
}

export const PersonalCabinet = ({
  userData,
  isLoading,
  onOpenSettings,
  currentTheme,
}: IProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const themeKey = currentTheme || localStorage.getItem("currentTheme") || "emerald";
  const activeTheme = THEMES[themeKey] || THEMES.emerald;

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileInfoTab
            userData={userData}
            isLoading={isLoading}
            onEdit={onOpenSettings}
            currentTheme={themeKey}
          />
        );
      case "analytics":
        return <AnalyticsTab />;
      case "tasks":
        return <TasksTabPlaceholder />;
      case "calendar":
        return <Calendar />;
      case "files":
        return <FilesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/40 dark:bg-slate-800/90 backdrop-blur-3xl p-2 rounded-[2.5rem] border border-white/20 dark:border-slate-700/50 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-[2.5rem] text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="profileActiveTabBg"
                  className={`absolute inset-0 bg-gradient-to-r ${activeTheme.gradient} rounded-[2.5rem] shadow-lg`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
