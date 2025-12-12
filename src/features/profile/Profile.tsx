import { Avatar, Menu } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { profileRightNav } from "./model";
import { AppRoutes } from "@shared/config/AppRoutes";
import "./style.css";
import { tokenControl, useGetQuery, useTheme } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IUser } from "@entities/login";

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

  const userId = tokenControl.getUserId();
  console.log(userId);

  const { data: userData } = useGetQuery<unknown, { data: IUser }>({
    method: "GET",
    url: `${ApiRoutes.FETCH_USER_BY_ID}${userId}`,
  });
  return (
    <div className="profile__content">
      <div className="profile__left-content">
        <div className="card">
          <div className="profile-header">
            <Avatar
              size={128}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
          </div>
          <p className="profile-title">{`${userData?.data?.first_name} ${userData?.data?.last_name}`}</p>
          <div className="flex justify-between">
          <div className="profile__info profile__left-info">
            <p className="profile__info-item">Место работы:</p>
            <p className="profile__info-item">Должность:</p>
            <p className="profile__info-item">Номер телефона:</p>
            <p className="profile__info-item">ИНН:</p>
          </div>
          <div className="profile__info profile__right-info">
            <p className="profile__info-item profile__info-item-value"> {userData?.data?.organization_id}</p>
            <p className="profile__info-item profile__info-item-value"> {userData?.data?.position} </p>
            <p className="profile__info-item profile__info-item-value"> {userData?.data?.phone} </p>  
            <p className="profile__info-item profile__info-item-value"> {userData?.data?.inn || 'Отсутствует'}</p>
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
