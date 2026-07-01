import { Link } from "react-router-dom";
import { Tooltip, Popover } from "antd";
import { Bell, LogOut, BookOpen, CheckCircle, Sun, Moon, Layout } from "lucide-react";
import { tokenControl, useLogout, useGetQuery } from "@shared/lib";
import { AppRoutes } from "@shared/config";
import { ApiRoutes } from "@shared/api";
import { IUser } from "@entities/login";
import { ModuleMenu } from "./ModuleMenu";
import { useState } from "react";
import userAvatar from "../../../assets/images/user-avatar.jpg";

interface IProps {
  isModulesPage?: boolean;
}

const mockNotifications = [
  {
    id: 1,
    title: "Модуль «Корреспонденция»",
    message: "Вас пригласили для подписи",
    isRead: false,
    time: "10 мин назад",
    icon: <BookOpen size={16} className="text-blue-500" />,
  },
  {
    id: 2,
    title: "Письмо №124/2 отправлено",
    message: "Вы успешно подписали письмо",
    isRead: false,
    time: "2 часа назад",
    icon: <CheckCircle size={16} className="text-green-500" />,
  },
  {
    id: 3,
    title: "Системное уведомление",
    message: "Завтра планируются технические работы.",
    isRead: true,
    time: "Вчера",
    icon: <Bell size={16} className="text-gray-500" />,
  },
];

export const Header = ({ isModulesPage }: IProps) => {
  const handleLogout = useLogout();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    tokenControl.getDarkMode(),
  );

  // Реальные данные пользователя (кэш общий с ModuleMenu/Profile по queryKey).
  const userId = tokenControl.getUserId();
  const { data: userResponse } = useGetQuery<{ data: IUser }>({
    url: `${ApiRoutes.FETCH_USER_BY_ID}${userId}`,
    options: { enabled: !!userId },
  });
  const userData = (userResponse as { data?: IUser } | undefined)?.data ?? null;
  const userSubtitle =
    [userData?.position, userData?.organization?.name]
      .filter(Boolean)
      .join(" • ") || "—";

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      tokenControl.setDarkMode(newMode);
      return newMode;
    });
  };

  const notificationContent = (
    <div className="w-80 -m-3 p-3">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
        <span className="font-semibold text-gray-800">Уведомления</span>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
          >
            Прочитать все
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
        {notifications.length > 0 ? (
          notifications.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-xl flex gap-3 transition-colors ${
                note.isRead
                  ? "bg-white hover:bg-gray-50"
                  : "bg-blue-50/50 hover:bg-blue-50"
              }`}
            >
              <div className="mt-0.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  {note.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4
                    className={`text-sm m-0 ${
                      note.isRead
                        ? "text-gray-700 font-medium"
                        : "text-gray-900 font-semibold"
                    }`}
                  >
                    {note.title}
                  </h4>
                  {!note.isRead && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 mb-1 line-clamp-2 leading-relaxed">
                  {note.message}
                </p>
                <span className="text-[10px] text-gray-400 font-medium">
                  {note.time}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-400 text-sm">
            Нет новых уведомлений
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header
      className={`
        sticky top-0 z-50 w-full
        flex items-center justify-between gap-4 px-6 py-3
        bg-white/40 dark:bg-zinc-900/40 backdrop-blur-3xl
        border border-white/20 dark:border-zinc-700/30 shadow-lg
        transition-all duration-300 ease-in-out
        ${isModulesPage ? "rounded-none" : "rounded-[2.5rem]"}
      `}
    >
      {/* Левая часть: логотип + пользователь */}
      <div className="flex items-center gap-4 min-w-0">
        <Link
          to={AppRoutes.PROFILE}
          aria-label="На главную"
          className="flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02] focus:outline-none rounded-lg shrink-0"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 rounded-[2.5rem] flex items-center justify-center shadow-lg">
            <Layout className="text-white" size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white hidden sm:inline">
            INTERLINK
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/30 dark:border-zinc-700/40 min-w-0">
          <div className="relative shrink-0">
            <img
              src={userData?.photo_path || userAvatar}
              alt="Аватар пользователя"
              className="w-11 h-11 rounded-[2.5rem] border-2 border-white/60 dark:border-zinc-900/60 object-cover shadow-lg"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white/60 dark:border-zinc-900/60 bg-emerald-500 shadow-lg" />
          </div>
          <div className="leading-tight min-w-0">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
              {userData?.full_name || "—"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
              {userSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Центр: навигация по модулям (только существующие модули) */}
      <ModuleMenu variant="header" />

      {/* Правая часть: действия */}
      <div className="flex items-center gap-2 shrink-0">
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
          arrow={false}
        >
          <button
            aria-label="Уведомления"
            className="relative p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            <Bell size={18} strokeWidth={2.2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[9px] text-white flex items-center justify-center rounded-full font-bold shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>
        </Popover>

        <div
          className="w-px h-6 bg-white/30 dark:bg-zinc-700/40 mx-1"
          aria-hidden="true"
        />

        <Tooltip
          title={isDarkMode ? "Светлая тема" : "Темная тема"}
          placement="bottom"
        >
          <button
            onClick={toggleTheme}
            aria-label="Смена темы"
            className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            {isDarkMode ? (
              <Sun size={18} strokeWidth={2.2} />
            ) : (
              <Moon size={18} strokeWidth={2.2} />
            )}
          </button>
        </Tooltip>

        <Tooltip title="Выйти" placement="bottomRight">
          <button
            onClick={handleLogout}
            aria-label="Выход"
            className="flex items-center gap-2 py-2 px-4 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl border border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-300 font-semibold text-sm hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
          >
            <LogOut size={16} strokeWidth={2.2} />
            <span className="hidden sm:inline">Выход</span>
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
