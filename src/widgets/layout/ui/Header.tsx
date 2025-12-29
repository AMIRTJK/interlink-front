import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Image } from "antd";
import Logo from "../../../assets/images/logo.svg";
import { BellOutlined } from "@ant-design/icons";
import LogoutIcon from "../../../assets/images/logout.svg";
import UserAvatar from "../../../assets/images/user-avatar.jpg";
import { tokenControl } from "@shared/lib";
import { AppRoutes } from "@shared/config";
import { toast } from "react-toastify";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.info("Выход из системы!");
    setTimeout(() => {
      tokenControl.remove();
      navigate(AppRoutes.LOGIN);
    }, 1000);
  };

  return (
    <header className="bg-white p-4 flex justify-between items-center rounded-[15px] h-[61px]">
      <Link to="/" className="mt-2">
        <Image src={Logo} preview={false} />
      </Link>
      <div className="flex items-center gap-2">
        <Button
          type="text"
          shape="circle"
          style={{ width: 40, height: 40, padding: 0 }} // увеличиваем саму кнопку
          icon={<BellOutlined style={{ fontSize: 24 }} />}
        />
        <Button
          onClick={handleLogout}
          type="text"
          shape="circle"
          style={{ width: 40, height: 40, padding: 0 }} // увеличиваем саму кнопку
          icon={<img src={LogoutIcon} style={{ fontSize: 24 }} />}
        />
        <Avatar size={45} src={UserAvatar} />
      </div>
    </header>
  );
};
