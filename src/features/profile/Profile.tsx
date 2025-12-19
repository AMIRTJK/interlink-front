import { Avatar } from "antd";
import { motion } from "framer-motion";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { profileRightNav } from "./model";
import { AppRoutes } from "@shared/config/AppRoutes";
import "./style.css";
import { tokenControl } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import { IUser } from "@entities/login";
import { useEffect, useState } from "react";
import userAvatar from "../../assets/images/user-avatar.jpg";
import { If, Loader } from "@shared/ui";
export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      <Loader/>
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
      <aside className="w-full lg:w-[72%]">
        <div className="profile__tabs">
          {profileRightNav.map((item) => {
            const isActive = getCurrentTab() === item.key;
            return (
              <motion.button
                key={item.key}
                className={`profile__tab ${
                  isActive ? "profile__tab--active" : ""
                }`}
                onClick={() => handleMenuClick({ key: item.key })}
              >
                <If is={isActive}>
                    <motion.div
                    layoutId="active-tab"
                    className="profile__tab-background"
                    transition={{ type: "spring", bounce: 0.1, duration: 0.6 }}
                  />
                </If>
                <span className="profile__tab-text">{item.label}</span>
              </motion.button>
            );
          })}
        </div>
        <div className="profile__content-card">
          <Outlet />
        </div>
      </aside>
    </div>
  );
};
