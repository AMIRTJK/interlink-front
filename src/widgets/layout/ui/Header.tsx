import { Link, useNavigate } from "react-router-dom";
import { Avatar, Tooltip } from "antd";
import { Bell, LogOut } from "lucide-react";
import Logo from "../../../assets/images/logo.svg";
import UserAvatar from "../../../assets/images/user-avatar.jpg";
import { tokenControl } from "@shared/lib";
import { AppRoutes } from "@shared/config";
import { toast } from "react-toastify";

interface IProps {
  isModulesPage?: boolean;
}

export const Header = ({ isModulesPage }: IProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.info("Выход из системы!");
    setTimeout(() => {
      tokenControl.remove();
      navigate(AppRoutes.LOGIN);
    }, 1000);
  };

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
      {/* 432423 */}
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
        <Tooltip title="Уведомления" placement="bottom">
          <button
            aria-label="Уведомления"
            className="relative p-2.5 cursor-pointer text-gray-500 transition-all duration-200 bg-gray-50 rounded-full hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <Bell size={20} strokeWidth={2.2} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </Tooltip>

        <div className="w-px h-8 bg-gray-200" aria-hidden="true" />

        <div className="flex items-center gap-3">
          <div className="relative cursor-pointer transition-transform duration-200 hover:scale-105">
            <Avatar
              size={44}
              src={UserAvatar}
              alt="Аватар пользователя"
              className="border-2 border-white shadow-sm"
            />
            {/* Статус онлайн */}
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
