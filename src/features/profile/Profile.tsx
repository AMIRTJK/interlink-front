import { Avatar, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { profileRightNav } from "./model";
import { AppRoutes } from "@shared/config/AppRoutes";
import "./style.css";
import { useTheme } from "@shared/lib";

export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes(AppRoutes.PROFILE_CALENDAR)) return "calendar";
    if (path.includes(AppRoutes.PROFILE_ANALYTICS)) return "analytics";
    return "tasks";
  };

  const handleMenuClick = (e: { key: string }) => {
    const routes: Record<string, string> = {
      tasks: AppRoutes.PROFILE_TASKS,
      calendar: AppRoutes.PROFILE_CALENDAR,
      analytics: AppRoutes.PROFILE_ANALYTICS,
    };
    navigate(`/${AppRoutes.PROFILE}/${routes[e.key]}`);
  };

  const menuTheme = theme === "light" ? "light" : "dark";

  return (
    <div className="profile__content">
      <div className="profile__left-content">
        <div className="card">
          <div className="profile-header">
            <Avatar
              size={80}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
          </div>
          <p className="profile-title">ФИО ПОЛЬЗОВАТЕЛЯ</p>
          <div className="flex gap-[72px]">
          <div className="profile__info">
            <p className="profile__info-item">Место работы: </p>
            <p className="profile__info-item">Должность: </p>
            <p className="profile__info-item">Номер телефона: </p>
            <p className="profile__info-item">ИНН:</p>
          </div>
          <div className="profile__right-info">
            <p className="profile__info-item"> -</p>
            <p className="profile__info-item"> -</p>
            <p className="profile__info-item"> -</p>  
            <p className="profile__info-item"> -</p>
          </div>
        </div>
        </div>
      </div>
      <div className="profile__right-content">
        <div className="profile__right-nav">
          <Menu
            items={profileRightNav}
            mode="horizontal"
            theme={menuTheme}
            selectedKeys={[getCurrentTab()]}
            onClick={handleMenuClick}
          />
        </div>
        <div className="profile__right-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
