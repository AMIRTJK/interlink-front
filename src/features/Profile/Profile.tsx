import { tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IUser } from "@entities/login";
import { useState } from "react";
import { useNavbar, useGetQuery, useTabs } from "@shared/lib/hooks";
import { ProfileSettingsModal } from "./ui/ProfileSettingsModal";
import { PersonalCabinet } from "./ui/PersonalCabinet";
import "./style.css";

interface IProps {
  currentTheme?: string;
}

export const Profile = ({ currentTheme }: IProps) => {
  const { variant, setVariant } = useNavbar();
  const { tabMode, setTabMode } = useTabs();
  const userId = tokenControl.getUserId();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Реальный API пользователя — сохранён без изменений.
  const { data: userDataResponse, isLoading } = useGetQuery<{ data: IUser }>({
    url: `${ApiRoutes.FETCH_USER_BY_ID}${userId}`,
    options: {
      enabled: !!userId,
      onSuccess: (data) => {
        if (data?.data) {
          tokenControl.setUserData(data.data);
        }
      },
    },
  });

  const userData = userDataResponse?.data || null;

  return (
    <>
      {/* Сохранённая интеграция: настройки профиля (iOS-навигация, режим вкладок, MFA) */}
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        navbarVariant={variant}
        setNavbarVariant={setVariant}
        tabMode={tabMode}
        setTabMode={setTabMode}
      />

      <PersonalCabinet
        userData={userData}
        isLoading={!!isLoading}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentTheme={currentTheme}
      />
    </>
  );
};
