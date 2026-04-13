import { Avatar, Tooltip } from "antd";
import { UserOutlined, SettingOutlined, CameraOutlined, LeftCircleOutlined, RightCircleOutlined } from "@ant-design/icons";
import { Outlet } from "react-router-dom";
import { IUser } from "@entities/login";
import { Tabs } from "@shared/ui";
import { profileRightNav } from "../model";
import userAvatar from "../../../assets/images/user-avatar.jpg";
import { UseSkeleton } from "@shared/ui/Skeleton/ui";
import { ProfileSettingsModal } from "../ui/ProfileSettingsModal";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { useMutationQuery } from "@shared/lib/hooks";
import { ApiRoutes } from "@shared/api";

interface IProps {
  isPending: boolean;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (v: boolean) => void;
  userData: IUser | null;
  activeTab: string;
  onMenuClick: (e: { key: string }) => void;
  navbarVariant: "default" | "ios";
  setNavbarVariant: (v: "default" | "ios") => void;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  tabMode: "on" | "off";
  setTabMode: (v: "on" | "off") => void;
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
  isExpanded,
  setIsExpanded,
  tabMode,
  setTabMode,
}: IProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadAvatar, isPending: isUploading } = useMutationQuery<FormData>({
    url: `${ApiRoutes.FETCH_USER_BY_ID}${userData?.id}/avatar`,
    method: "POST",
    messages: {
      success: "Фото профиля обновлено",
      error: "Ошибка при загрузке фото",
      invalidate: [ApiRoutes.FETCH_USER_BY_ID],
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("photo", file); // Часто поле называется photo или avatar
      uploadAvatar(formData);
    }
  };

  if (isPending) return <UseSkeleton loading={true} variant="profile" />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex! flex-col! lg:flex-row! lg:flex-nowrap! items-start! gap-6! p-3! sm:p-4! lg:p-6!"
    >
      {/* Модалка настроек */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        navbarVariant={navbarVariant}
        setNavbarVariant={setNavbarVariant}
        tabMode={tabMode}
        setTabMode={setTabMode}
      />

      {/* Левая часть профиля (Десктоп) */}
      <motion.aside
        animate={{ width: isExpanded ? 100 : "28%" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="hidden lg:block premium-tracking shrink-0 sticky top-6! group"
      >
        <div className={`subtle-glass hover-lift rounded-3xl! transition-all duration-300 flex! flex-col! ${isExpanded ? 'p-4! min-h-[450px] max-h-[451px] ' : 'p-6!'}`}>
          <div className="flex! flex-col!">
            {/* Аватар */}
            <div className={`flex! flex-col! items-center! transition-all duration-300 ${isExpanded ? 'mb-1! scale-[0.65]' : 'mb-5!'}`}>
              <div 
                className={`profile-avatar-glow avatar-breath profile-avatar-container cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={handleAvatarClick}
              >
                <Avatar
                  src={userData?.photo_path || userAvatar}
                  className="profile-avatar-img"
                  icon={<UserOutlined />}
                />
                <div className="profile-avatar-overlay">
                  <CameraOutlined style={{ fontSize: 24, color: "#fff" }} />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
            </div>

            {/* Скрываемый текстовый контент */}
            <AnimatePresence>
              {!isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {/* Имя пользователя */}
                  <p className="text-center! text-slate-800! text-xl! font-semibold! mb-6! whitespace-nowrap">
                    {userData?.full_name}
                  </p>

                  {/* Информационные поля */}
                  <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Иконки действий */}
            <div className={`flex! items-center! ${isExpanded ? 'flex-col-reverse! gap-4!' : 'justify-between! mb-4! order-first!'}`}>
              <Tooltip title={isExpanded ? "Развернуть" : "Свернуть"}>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-blue-500 transition-all duration-300 p-1 opacity-0 group-hover:opacity-100"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {isExpanded ? <RightCircleOutlined style={{ fontSize: 20 }} /> : <LeftCircleOutlined style={{ fontSize: 20 }} />}
                </button>
              </Tooltip>
              
              <Tooltip title="Настройки">
                <SettingOutlined
                  className="profile-settings-icon"
                  style={{ fontSize: 22 }}
                  onClick={() => setIsSettingsOpen(true)}
                />
              </Tooltip>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Левая часть профиля (Мобильная) */}
      <aside className="block lg:hidden w-full! premium-tracking group">
        <div className="subtle-glass hover-lift p-4! rounded-3xl!">
            <div className="flex! justify-end!">
              <Tooltip title="Настройки">
                <SettingOutlined className="profile-settings-icon text-xl" style={{ fontSize: 20 }} onClick={() => setIsSettingsOpen(true)} />
              </Tooltip>
            </div>
            <div className="flex! flex-col! items-center! mb-5!">
              <div className="profile-avatar-glow avatar-breath profile-avatar-container">
                <Avatar src={userAvatar} className="profile-avatar-img" icon={<UserOutlined />} />
              </div>
            </div>
            <p className="text-center! text-slate-800! text-xl! font-semibold! mb-6! pr-4 pl-4">{userData?.full_name}</p>
        </div>
      </aside>

      {/* Правая часть — контент */}
      <motion.aside
        animate={{ width: isExpanded ? "calc(100% - 100px - 1.5rem)" : "72%" }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="flex-1 min-w-0"
      >
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
      </motion.aside>
    </motion.div>
  );
};
