import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ClipboardList,
  Calendar as CalendarIcon,
  BarChart2,
  FolderOpen,
  Search,
} from "lucide-react";
import { IUser } from "@entities/login";
import { ProfileInfoTab } from "./tabs/ProfileInfoTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { DevelopmentStub } from "./tabs/DevelopmentStub";

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
  { key: "files", label: "Мои файлы", icon: <FolderOpen size={16} /> },
];

interface IProps {
  userData: IUser | null;
  isLoading: boolean;
  /** Открыть модалку настроек профиля (сохранённая интеграция). */
  onOpenSettings: () => void;
}

/**
 * «Личный кабинет» — новый дизайн страницы профиля со вкладками.
 * Вкладки переключаются внутренним состоянием (как в исходном дизайне).
 * Профиль работает на реальном API, Аналитика — фронтенд-мок,
 * остальные вкладки — заглушки «в разработке».
 */
export const PersonalCabinet = ({
  userData,
  isLoading,
  onOpenSettings,
}: IProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileInfoTab
            userData={userData}
            isLoading={isLoading}
            onEdit={onOpenSettings}
          />
        );
      case "analytics":
        return <AnalyticsTab />;
      case "tasks":
        return <DevelopmentStub title="Задачи" />;
      case "calendar":
        return <DevelopmentStub title="Календарь" />;
      case "files":
        return <DevelopmentStub title="Мои файлы" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Панель вкладок */}
      <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl p-2 rounded-[2.5rem] border border-white/20 dark:border-zinc-700/30 shadow-sm flex flex-wrap items-center justify-between gap-2">
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
                  className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-green-600 to-teal-700 rounded-[2.5rem] shadow-lg"
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
        <div className="flex items-center gap-2 px-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Поиск..."
              className="bg-white/60 dark:bg-zinc-800/60 backdrop-blur-xl rounded-[2.5rem] pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-44 transition-all border border-white/20 dark:border-zinc-700/30"
            />
          </div>
        </div>
      </div>

      {/* Контент активной вкладки */}
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
