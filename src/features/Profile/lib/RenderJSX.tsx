import { Avatar, Modal, Switch } from "antd";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import { IUser } from "@entities/login";
import { Tabs } from "@shared/ui";
import { profileRightNav } from "../model";
import userAvatar from "../../../assets/images/user-avatar.jpg";
import { UseSkeleton } from "@shared/ui/Skeleton/ui";

interface IProps {
  isPending: boolean;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  userData: IUser | null;
  activeTab: string;
  onMenuClick: (e: { key: string }) => void;
  navbarVariant: "default" | "ios";
  setNavbarVariant: (v: "default" | "ios") => void;
}

export const RenderJSX = ({
  isPending,
  isSettingsOpen,
  setIsSettingsOpen,
  userData,
  activeTab,
  onMenuClick,
  navbarVariant,
  setNavbarVariant,
}: IProps) => {
  if (isPending) return <UseSkeleton loading={true} variant="profile" />;
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      {/* Модалка настроек */}
      <Modal
        title="Настройки"
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        footer={null}
        width={300}
        closable
        maskClosable
        centered
        className="ios-settings-modal"
        transitionName="ant-zoom"
      >
        <div className="space-y-2">
          <div className="hidden! sm:flex justify-between items-center pt-4 border-t border-gray-100">
            <span>Стиль iOS 📱</span>
            <Switch 
              checked={navbarVariant === "ios"} 
              onChange={(checked) => setNavbarVariant(checked ? "ios" : "default")} 
            />
          </div>
        </div>
      </Modal>

      {/* Левая часть профиля */}
      <aside className="w-full lg:w-[28%] premium-tracking">
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl soft-shadow-ios border border-white/20">
          <UseSkeleton loading={isPending} variant="card" count={1} rows={4} />
          <div className="flex justify-end">
            <SettingOutlined
              className="text-gray-500 hover:text-blue-600 cursor-pointer transition-colors"
              style={{ fontSize: 20 }}
              onClick={() => setIsSettingsOpen(true)}
            />
          </div>

          <div className="flex flex-col items-center mb-4">
            <Avatar src={userAvatar} size={128} icon={<UserOutlined />} />
          </div>

          <p className="text-center text-[#0037AF] text-xl font-semibold mb-6">
            {userData?.full_name}
          </p>

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

      {/* Правая часть — контент */}
      <aside className="w-full lg:w-[72%]">
        <Tabs
          items={profileRightNav}
          activeKey={activeTab}
          onChange={(key) => onMenuClick({ key })}
          className="profile__tabs-wrapper"
        />
        <div className="profile__content-card soft-shadow-ios rounded-3xl background-white/50 backdrop-blur-sm">
          <Outlet />
        </div>
      </aside>
    </div>
  );
};
