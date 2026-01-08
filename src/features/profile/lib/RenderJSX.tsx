import { Avatar, Modal, Switch } from "antd";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import { IUser } from "@entities/login";
// import userAvatar from "../../assets/images/user-avatar.jpg";
import userAvatar from "../../../assets/images/user-avatar.jpg";
import { Tabs, Loader } from "@shared/ui";
import { profileRightNav } from "../model";

interface IProps {
  loading: boolean;
  isSnowEnabled: boolean;
  setIsSnowEnabled: (v: boolean) => void;
  isRainEnabled: boolean;
  setIsRainEnabled: (v: boolean) => void;
  isAutumnEnabled: boolean;
  setIsAutumnEnabled: (v: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  isAnimEnabled: boolean;
  setIsAnimEnabled: (v: boolean) => void;
  userData: IUser | null;
  activeTab: string;
  onMenuClick: (e: { key: string }) => void;
}

export const RenderJSX = ({
  loading,
  isSnowEnabled,
  setIsSnowEnabled,
  isRainEnabled,
  setIsRainEnabled,
  isAutumnEnabled,
  setIsAutumnEnabled,
  isSettingsOpen,
  setIsSettingsOpen,
  isAnimEnabled,
  setIsAnimEnabled,
  userData,
  activeTab,
  onMenuClick,
}: IProps) => {
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      <Modal
        title="Настройки"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
        width={300}
        closable={true}
        maskClosable={true}
      >
        <div className="flex items-center justify-between py-2">
          <span>Включить снег ❄️</span>
          <Switch checked={isSnowEnabled} onChange={setIsSnowEnabled} />
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Включить дождь 🌧️</span>
          <Switch checked={isRainEnabled} onChange={setIsRainEnabled} />
        </div>
        <div className="flex items-center justify-between py-2">
          <span>Листопад 🍂</span>
          <Switch checked={isAutumnEnabled} onChange={setIsAutumnEnabled} />
        </div>
        {/* Класс для скрывания no-animations функционал:
          "hidden-no-animations-switcher"
        */}
        <div className="flex items-center justify-between py-2 ">
          {/* Это пока думаю лучше скрыть   */}
          <span>Анимации ⚡</span>
          <Switch checked={isAnimEnabled} onChange={setIsAnimEnabled} />
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
          onChange={(key) => onMenuClick({ key })}
          className="profile__tabs-wrapper"
        />

        <div className="profile__content-card">
          <Outlet />
        </div>
      </aside>
    </div>
  );
};
