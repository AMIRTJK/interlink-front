import { Avatar } from "antd";
import { UserOutlined, SettingOutlined } from "@ant-design/icons";
import { Outlet, useLocation } from "react-router-dom";
import { IUser } from "@entities/login";
import { Tabs } from "@shared/ui";
import { profileRightNav } from "../model";
import userAvatar from "../../../assets/images/user-avatar.jpg";
import { UseSkeleton } from "@shared/ui/Skeleton/ui";
import { ProfileSettingsModal } from "../ui/ProfileSettingsModal";
import { AnimatePresence, motion } from "framer-motion";

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

/* Информационные поля профиля */
const profileInfoFields = [
  { label: "Место работы", key: "organization" },
  { label: "Должность", key: "position" },
  { label: "Номер телефона", key: "phone" },
  { label: "ИНН", key: "inn" },
  { label: "Отдел", key: "departments" },
] as const;

/* Получение значения поля по ключу */
const getFieldValue = (userData: IUser | null, key: string): string => {
  if (!userData) return "";
  switch (key) {
    case "organization": return userData.organization?.name || "";
    case "position": return userData.position || "";
    case "phone": return userData.phone || "";
    case "inn": return userData.inn || "";
    case "departments": return userData.departments?.join(", ") || "";
    default: return "";
  }
};

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
  const location = useLocation();

  if (isPending) return <UseSkeleton loading={true} variant="profile" />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex! flex-col! lg:flex-row! gap-6! p-3! sm:p-4! lg:p-6!"
    >
      {/* Модалка настроек */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        navbarVariant={navbarVariant}
        setNavbarVariant={setNavbarVariant}
      />

      {/* Левая часть профиля */}
      <aside className="w-full! lg:w-[28%]! premium-tracking">
        <div className="subtle-glass hover-lift p-6! rounded-3xl!">
          {/* Иконка настроек с анимацией вращения */}
          <div className="flex! justify-end!">
            <SettingOutlined
              className="profile-settings-icon"
              style={{ fontSize: 20 }}
              onClick={() => setIsSettingsOpen(true)}
            />
          </div>

          {/* Аватар с градиентным фоном */}
          <div className="flex! flex-col! items-center! mb-5!">
            <div className="profile-avatar-glow avatar-breath">
              <Avatar
                src={userAvatar}
                className="profile-avatar-img"
                icon={<UserOutlined />}
              />
            </div>
          </div>

          {/* Имя пользователя */}
          <p className="text-center! text-slate-800! text-xl! font-semibold! mb-6!">
            {userData?.full_name}
          </p>

          {/* Информационные поля с последовательным появлением */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="flex! flex-col! gap-3! text-sm!"
          >
            {profileInfoFields.map(({ label, key }) => (
              <motion.div 
                key={key} 
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="flex! justify-between! items-baseline! gap-2! field-highlight"
              >
                <span className="text-gray-400! font-light! shrink-0!">{label}:</span>
                <span className="font-medium! text-slate-700! text-right! truncate! max-w-[60%]!" title={getFieldValue(userData, key)}>
                  {getFieldValue(userData, key)}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </aside>

      {/* Правая часть — контент */}
      <aside className="w-full! lg:w-[72%]!">
        <Tabs
          items={profileRightNav}
          activeKey={activeTab}
          onChange={(key) => onMenuClick({ key })}
          className="profile__tabs-wrapper"
        />
        <div className="subtle-glass hover-lift profile__content-card rounded-3xl border-t-0!">
          {/* Плавная анимация при смене вкладки */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>
    </motion.div>
  );
};
