import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Image } from "antd";
import Logo from "../../../assets/images/logo.svg";
import { BellOutlined } from "@ant-design/icons";
import LogoutIcon from "../../../assets/images/logout.svg";
import UserAvatar from "../../../assets/images/user-avatar.jpg";
import { tokenControl } from "@shared/lib";
import { AppRoutes } from "@shared/config";
import { toast } from "react-toastify";

interface INavbarHeaderProps {
  isModulesPage?: boolean;
}

export const NavbarHeader = ({ isModulesPage }: INavbarHeaderProps) => {
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
      className={`bg-white py-4 px-6 flex justify-between items-center mb-3! shadow-sm border border-gray-100 h-[61px] ${isModulesPage ? "rounded-none" : "rounded-[15px]"} `}
    >
      <Link to={AppRoutes.PROFILE} className="mt-2" aria-label="На главную">
        <Image
          src={Logo}
          preview={false}
          alt="Интерлинк Лого"
          width={175}
          height={35}
        />
      </Link>
      <div className="flex items-center gap-2">
        <Button
          type="text"
          shape="circle"
          aria-label="Уведомления"
          style={{ width: 40, height: 40, padding: 0 }}
          icon={<BellOutlined style={{ fontSize: 24 }} />}
        />
        <Button
          onClick={handleLogout}
          type="text"
          shape="circle"
          aria-label="Выход"
          style={{ width: 40, height: 40, padding: 0 }}
          icon={
            <img
              src={LogoutIcon}
              alt="Выйти"
              style={{ fontSize: 24 }}
              width={24}
              height={24}
            />
          }
        />
        <Avatar size={45} src={UserAvatar} alt="Аватар пользователя" />
      </div>
    </header>
  );
};
