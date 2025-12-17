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

import userAvatar from "../../assets/images/user-avatar.jpg";

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
        const response = await _axios<{ data: IUser }>(
          `${ApiRoutes.FETCH_USER_BY_ID}${userId}`,
          {
            method: "GET",
          }
        );
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
      <div
        className="profile__content flex justify-center items-center"
        style={{ height: "100%" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      <aside className="w-full lg:w-[28%]">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex flex-col items-center mb-4">
            <Avatar
              src={userAvatar}
              size={128}
              icon={<UserOutlined />}
              className="profile-avatar"
            />
          </div>
          <p className="text-center text-[#0037AF] text-xl font-semibold mb-6">{`${userData?.first_name} ${userData?.last_name}`}</p>
          <div className="flex justify-between text-sm">
            <div className="space-y-2 text-black font-light">
              <p>Место работы:</p>
              <p>Должность:</p>
              <p>Номер телефона:</p>
              <p>ИНН:</p>
            </div>
            <div className="space-y-2 font-medium text-black text-right">
              <p>{userData?.organization_id}</p>
              <p>{userData?.position}</p>
              <p>{userData?.phone}</p>
              <p>{userData?.inn || "12345678"}</p>
            </div>
          </div>
        </div>
      </aside>
      <aside className="w-full bg-white rounded-[15px] p-4 lg:w-[72%]">
        <div className="border border-[#E5E9F5] rounded-xl mb-[45px] pt-0.5 pb-1">
          <Menu
            items={profileRightNav}
            mode="horizontal"
            theme={menuTheme}
            selectedKeys={[getCurrentTab()]}
            onClick={handleMenuClick}
            className="custom-fixed-menu"
            disabledOverflow
          />
        </div>
        <div>
          <Outlet />
        </div>
      </aside>
    </div>
  );
};
