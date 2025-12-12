import { Avatar, Menu, Spin } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { profileRightNav } from "./model";
import { AppRoutes } from "@shared/config/AppRoutes";
import "./style.css";
import { tokenControl, useTheme } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import { IUser } from "@entities/login";
import { useEffect, useState } from "react";

export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const menuTheme = theme === "light" ? "light" : "dark";

  const userId = tokenControl.getUserId();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await _axios<{ data: IUser }>(`${ApiRoutes.FETCH_USER_BY_ID}${userId}`, {
          method: "GET",
        });
        setUserData(response.data.data);
      } catch (err) {
        console.error("Ошибка при получении данных пользователя:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

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

  if (loading) {
    return (
      <div className="profile__content flex justify-center items-center" style={{ height: "100%" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile__content">
      <div className="profile__left-content">
        <div className="card">
          <div className="profile-header">
            <Avatar size={128} icon={<UserOutlined />} className="profile-avatar" />
          </div>
          <p className="profile-title">{`${userData?.first_name} ${userData?.last_name}`}</p>
          <div className="flex justify-between">
            <div className="profile__info profile__left-info">
              <p className="profile__info-item">Место работы:</p>
              <p className="profile__info-item">Должность:</p>
              <p className="profile__info-item">Номер телефона:</p>
              <p className="profile__info-item">ИНН:</p>
            </div>
            <div className="profile__info profile__right-info">
              <p className="profile__info-item profile__info-item-value">{userData?.organization_id}</p>
              <p className="profile__info-item profile__info-item-value">{userData?.position}</p>
              <p className="profile__info-item profile__info-item-value">{userData?.phone}</p>
              <p className="profile__info-item profile__info-item-value">{userData?.inn || "Отсутствует"}</p>
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
