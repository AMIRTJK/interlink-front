import { Link, useLocation } from "react-router-dom";
import { Tooltip, Popover } from "antd";
import { Bell, LogOut, BookOpen, CheckCircle, Sun, Moon, Layout, Palette, Layers, MessageSquare, PanelTop, PanelLeft, PanelBottom, PanelRight } from "lucide-react";
import { tokenControl, useLogout, useGetQuery } from "@shared/lib";
import { AppRoutes } from "@shared/config";
import { ApiRoutes } from "@shared/api";
import { IUser } from "@entities/login";
import { ModuleMenu } from "./ModuleMenu";
import { useState, useEffect } from "react";
import userAvatar from "../../../assets/images/user-avatar.jpg";
import { THEMES, BACKGROUNDS, LayoutMode } from "./designSettings";
import { useChat } from "@widgets/Chat";
import { LogoutConfirmModal } from "./LogoutConfirmModal";

interface IProps {
  currentTheme?: string;
  setCurrentTheme?: (theme: string) => void;
  currentBg?: string;
  setCurrentBg?: (bg: string) => void;
  layoutMode?: LayoutMode;
  setLayoutMode?: (layout: LayoutMode) => void;
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

export const Header = ({
  currentTheme,
  setCurrentTheme,
  currentBg,
  setCurrentBg,
  layoutMode,
  setLayoutMode,
}: IProps) => {
  const handleLogout = useLogout();
  const { openChat } = useChat();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { pathname } = useLocation();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
    tokenControl.getDarkMode(),
  );

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

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
    <div className="w-80 p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-zinc-750">
        <span className="font-semibold text-gray-800 dark:text-zinc-200">Уведомления</span>
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

  const isProfilePage = pathname.includes("profile");
  const isVertical = layoutMode === "left" || layoutMode === "right";
  const activeGradient = (currentTheme && THEMES[currentTheme]?.gradient) || THEMES.emerald.gradient;

  const themeContent = (
    <div className="w-[260px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Выберите тему
      </p>
      <div className="space-y-2">
        {Object.entries(THEMES).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => {
              if (setCurrentTheme) {
                setCurrentTheme(key);
                localStorage.setItem("currentTheme", key);
                window.dispatchEvent(new StorageEvent("storage", { key: "currentTheme", newValue: key }));
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer ${
              currentTheme === key
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                theme.swatch || theme.gradient
              } shadow-lg flex-shrink-0`}
            />
            <span className="text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-300">
              {key}
            </span>
            {currentTheme === key && (
              <CheckCircle size={18} className="ml-auto text-emerald-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const bgContent = (
    <div className="w-[260px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Фон страницы
      </p>
      <div className="space-y-2">
        {Object.entries(BACKGROUNDS).map(([key, bg]) => (
          <button
            key={key}
            onClick={() => {
              if (setCurrentBg) {
                setCurrentBg(key);
                localStorage.setItem("currentBg", key);
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer ${
              currentBg === key
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${
                isDarkMode ? bg.dark : bg.light
              } border border-zinc-200 dark:border-zinc-700 flex-shrink-0 shadow-sm`}
            />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {bg.name}
            </span>
            {currentBg === key && (
              <CheckCircle size={18} className="ml-auto text-emerald-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const layoutModes: { mode: LayoutMode; icon: React.ReactNode; title: string }[] = [
    { mode: "top", icon: <PanelTop size={16} />, title: "Верхнее меню" },
    { mode: "left", icon: <PanelLeft size={16} />, title: "Левое меню" },
    { mode: "bottom", icon: <PanelBottom size={16} />, title: "Нижнее меню" },
    { mode: "right", icon: <PanelRight size={16} />, title: "Правое меню" }
  ];

  const layoutContent = (
    <div className="w-[220px] p-5 bg-white dark:bg-zinc-800 rounded-[2.5rem]">
      <p className="text-xs font-bold text-zinc-550 dark:text-zinc-400 uppercase tracking-wider mb-4 px-1">
        Макет страницы
      </p>
      <div className="space-y-2">
        {layoutModes.map((item) => (
          <button
            key={item.mode}
            onClick={() => {
              if (setLayoutMode) {
                setLayoutMode(item.mode);
                localStorage.setItem("layoutMode", item.mode);
              }
            }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-[1.5rem] hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer text-sm font-semibold ${
              layoutMode === item.mode
                ? "bg-zinc-100 dark:bg-zinc-700 ring-2 ring-indigo-400"
                : ""
            }`}
          >
            <span className="text-zinc-600 dark:text-zinc-300 flex-shrink-0">
              {item.icon}
            </span>
            <span className="text-zinc-700 dark:text-zinc-200">
              {item.title}
            </span>
            {layoutMode === item.mode && (
              <CheckCircle size={18} className="ml-auto text-emerald-500" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <header
      className={`sticky z-50 bg-white/40 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/20 dark:border-slate-700/50 shadow-lg transition-all duration-300 ease-in-out rounded-none ${
        layoutMode === "bottom" ? "bottom-0" : "top-0"
      } ${
        isVertical
          ? "h-screen w-60 flex flex-col! items-stretch! justify-start! gap-6! px-4! py-6!"
          : "w-full flex items-center justify-between gap-4 px-6 py-3"
      }`}
    >
      <div className={`flex items-center gap-4 min-w-0 ${isVertical ? "flex-col! items-center! text-center! w-full!" : ""}`}>
        <Link
          to={AppRoutes.PROFILE}
          aria-label="На главную"
          className={`flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02] focus:outline-none rounded-lg shrink-0 ${
            isVertical ? "flex-col! text-center!" : ""
          }`}
        >
          <div className={`w-10 h-10 bg-gradient-to-br ${activeGradient} rounded-[2.5rem] flex items-center justify-center shadow-lg`}>
            <Layout className="text-white" size={20} />
          </div>
          <span className={`text-lg font-bold tracking-tight text-zinc-900 dark:text-white ${isVertical ? "block!" : "hidden sm:inline"}`}>
            INTERLINK
          </span>
        </Link>

        <div className={`hidden md:flex items-center gap-3 pl-4 border-l border-white/30 dark:border-zinc-700/40 min-w-0 ${
          isVertical ? "flex flex-col! items-center! gap-2! pl-0! border-l-0! border-t! pt-4! w-full!" : ""
        }`}>
          <div className="relative shrink-0">
            <img
              src={userData?.photo_path || userAvatar}
              alt="Аватар пользователя"
              className="w-11 h-11 rounded-[2.5rem] border-2 border-white/60 dark:border-zinc-900/60 object-cover shadow-lg"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white/60 dark:border-zinc-900/60 bg-emerald-500 shadow-lg" />
          </div>
          <div className={`leading-tight min-w-0 ${isVertical ? "text-center!" : ""}`}>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
              {userData?.full_name || "—"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
              {userSubtitle}
            </p>
          </div>
        </div>
      </div>

      <ModuleMenu variant="header" isVertical={isVertical} />

      <div className={`flex items-center gap-2 shrink-0 ${isVertical ? "flex-col! items-center! gap-3! mt-auto! w-full!" : ""}`}>
        <Popover
          content={notificationContent}
          trigger="click"
          placement={isVertical ? "rightBottom" : "bottomRight"}
          arrow={false}
          overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0 }}
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

        <Tooltip title="Чат" placement={isVertical ? "right" : "bottom"}>
          <button
            onClick={openChat}
            aria-label="Открыть чат"
            className="relative p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
          >
            <MessageSquare size={18} strokeWidth={2.2} />
          </button>
        </Tooltip>

        <div
          className={`${isVertical ? "w-full! h-px!" : "w-px! h-6!"} bg-white/30 dark:bg-zinc-700/40 mx-1`}
          aria-hidden="true"
        />

        <Tooltip
          title={isDarkMode ? "Светлая тема" : "Темная тема"}
          placement={isVertical ? "right" : "bottom"}
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

        {isProfilePage && (
          <>
            <Popover
              content={themeContent}
              trigger="click"
              placement={isVertical ? "rightBottom" : "bottomRight"}
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0 }}
            >
              <button
                aria-label="Выбор темы"
                className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
              >
                <Palette size={18} strokeWidth={2.2} />
              </button>
            </Popover>

            <Popover
              content={bgContent}
              trigger="click"
              placement={isVertical ? "rightBottom" : "bottomRight"}
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0 }}
            >
              <button
                aria-label="Фон страницы"
                className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
              >
                <Layers size={18} strokeWidth={2.2} />
              </button>
            </Popover>

            <Popover
              content={layoutContent}
              trigger="click"
              placement={isVertical ? "rightBottom" : "bottomRight"}
              arrow={false}
              overlayInnerStyle={{ borderRadius: "2.5rem", padding: 0 }}
            >
              <button
                aria-label="Макет страницы"
                className="p-2.5 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl text-zinc-600 dark:text-zinc-400 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors border border-white/20 dark:border-zinc-700/30 cursor-pointer focus:outline-none"
              >
                {layoutMode === "top" && <PanelTop size={18} strokeWidth={2.2} />}
                {layoutMode === "left" && <PanelLeft size={18} strokeWidth={2.2} />}
                {layoutMode === "bottom" && <PanelBottom size={18} strokeWidth={2.2} />}
                {layoutMode === "right" && <PanelRight size={18} strokeWidth={2.2} />}
              </button>
            </Popover>
          </>
        )}

        <Tooltip title="Выйти" placement={isVertical ? "right" : "bottomRight"}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Выход"
            className="flex items-center gap-2 py-2 px-4 rounded-[2.5rem] bg-white/30 dark:bg-zinc-800/30 backdrop-blur-xl border border-white/20 dark:border-zinc-700/30 text-zinc-600 dark:text-zinc-300 font-semibold text-sm hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
          >
            <LogOut size={16} strokeWidth={2.2} />
            <span className={isVertical ? "hidden!" : "hidden sm:inline"}>Выход</span>
          </button>
        </Tooltip>
      </div>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </header>
  );
};
