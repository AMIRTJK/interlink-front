import { Link, useNavigate } from "react-router-dom";
import { Avatar, Tooltip, Popover, Badge } from "antd"; // Добавили Popover и Badge
import { Bell, LogOut, BookOpen, CheckCircle } from "lucide-react"; // Добавили пару иконок для дизайна
import Logo from "../../../assets/images/logo.svg";
import UserAvatar from "../../../assets/images/user-avatar.jpg";
import { tokenControl } from "@shared/lib";
import { AppRoutes } from "@shared/config";
import { toast } from "react-toastify";
import { useState } from "react";

interface IProps {
  isModulesPage?: boolean;
}

// Моковые данные для примера
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
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    toast.info("Выход из системы!");
    setTimeout(() => {
      tokenControl.remove();
      navigate(AppRoutes.LOGIN);
    }, 1000);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
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
                    className={`text-sm m-0 ${note.isRead ? "text-gray-700 font-medium" : "text-gray-900 font-semibold"}`}
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
        sticky top-0 z-50 w-full mb-4 px-6 h-18
        flex justify-between items-center 
        bg-white/80 backdrop-blur-md shadow-sm border border-gray-100/50
        transition-all duration-300 ease-in-out
        ${isModulesPage ? "rounded-none" : "rounded-[20px] mb-0!"}
      `}
    >
      <Link
        to={AppRoutes.PROFILE}
        aria-label="На главную"
        className="transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-lg"
      >
        <img
          src={Logo}
          alt="Интерлинк Лого"
          className="w-43.75 h-8.75 object-contain"
        />
      </Link>

      <div className="flex items-center gap-5">
        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
          arrow={false}
        >
          <button
            aria-label="Уведомления"
            className="relative p-2.5 cursor-pointer text-gray-500 transition-all duration-200 bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <Bell size={20} strokeWidth={2.2} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
        </Popover>

        <div className="w-px h-8 bg-gray-200" aria-hidden="true" />

        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer transition-transform duration-200 hover:scale-105">
            <Avatar
              size={44}
              src={UserAvatar}
              alt="Аватар пользователя"
              className="border-2 border-white shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <Tooltip title="Выйти" placement="bottomRight">
            <button
              onClick={handleLogout}
              aria-label="Выход"
              className="p-2.5 text-gray-400 cursor-pointer transition-all duration-200 rounded-full hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/40"
            >
              <LogOut size={20} strokeWidth={2.2} />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};
