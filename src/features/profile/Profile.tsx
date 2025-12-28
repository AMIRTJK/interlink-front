import { Avatar, Modal, Switch } from "antd";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { profileRightNav } from "./model";
import { AppRoutes } from "@shared/config/AppRoutes";
import { tokenControl, useTheme } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import { IUser } from "@entities/login";
import { useEffect, useState } from "react";
import userAvatar from "../../assets/images/user-avatar.jpg";
import { Loader, Tabs, SnowOverlay } from "@shared/ui";
import { useCurrentTab } from "./lib";
import "./style.css";

export const Profile = () => {
  const navigate = useNavigate();
  const userId = tokenControl.getUserId();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const activeTab = useCurrentTab();
  const { isAnimEnabled, setIsAnimEnabled } = useTheme();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSnowEnabled, setIsSnowEnabled] = useState(() => {
    return localStorage.getItem('snow-enabled') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('snow-enabled', String(isSnowEnabled));
  }, [isSnowEnabled]);

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

  const handleMenuClick = (e: { key: string }) => {
    const routes: Record<string, string> = {
      tasks: AppRoutes.PROFILE_TASKS,
      calendar: AppRoutes.PROFILE_CALENDAR,
      analytics: AppRoutes.PROFILE_ANALYTICS,
    };
    navigate(`/${AppRoutes.PROFILE}/${routes[e.key]}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      <SnowOverlay enabled={isSnowEnabled} />
      <Modal
        title="Настройки"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
        width={300}
      >
        <div className="flex items-center justify-between py-2">
          <span>Включить снег ❄️</span>
          <Switch 
            checked={isSnowEnabled} 
            onChange={setIsSnowEnabled} 
          />
        </div>
        {/* Класс для скрывания no-animations функционал:
          "hidden-no-animations-switcher"
        */}
        <div className="flex items-center justify-between py-2 ">
          {/* Это пока думаю лучше скрыть   */}
          <span>Анимации ⚡</span>
          <Switch 
            checked={isAnimEnabled} 
            onChange={setIsAnimEnabled} 
          />
        </div>
      </Modal>

      <aside className="w-full lg:w-[28%]">
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-end">
            <SettingOutlined 
              className="text-gray-500! hover:text-blue-600! transition-colors! cursor-pointer!"
              style={{ fontSize: "20px" }}
              onClick={() => setIsSettingsOpen(true)}
            />
          </div>
          <div className="flex flex-col items-center mb-4 relative">
             <div className="relative">
              <Avatar
                src={userAvatar}
                size={128}
                icon={<UserOutlined />}
                className="profile-avatar"
              />
            </div>
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
        <Tabs
          items={profileRightNav}
          activeKey={activeTab}
          onChange={(key) => handleMenuClick({ key })}
          className="profile__tabs-wrapper"
        />

        <div className="profile__content-card">
          <Outlet />
        </div>
      </aside>
    </div>
  );
};
