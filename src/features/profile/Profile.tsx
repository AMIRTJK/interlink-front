
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { tokenControl, useTheme } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import { IUser } from "@entities/login";
import { useEffect, useState } from "react";
import { useCurrentTab } from "./lib/lib";
import { RenderJSX } from "./lib/RenderJSX";
import "./style.css";

export const Profile = () => {
  const navigate = useNavigate();
  const userId = tokenControl.getUserId();
  const [userData, setUserData] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const activeTab = useCurrentTab();
  const {
    isAnimEnabled,
    setIsAnimEnabled,
    isSnowEnabled,
    setIsSnowEnabled,
    isRainEnabled,
    setIsRainEnabled,
    isAutumnEnabled,
    setIsAutumnEnabled,
    isSakuraEnabled,
    setIsSakuraEnabled,
  } = useTheme();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await _axios<{ data: IUser }>(
          `${ApiRoutes.FETCH_USER_BY_ID}${userId} `,
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

    const subPath = routes[e.key];
    if (subPath) {
      // Склеиваем префикс и хвост
      navigate(subPath);
    }
  };

  return (
    <><RenderJSX
      loading={loading}
      isSnowEnabled={isSnowEnabled}
      setIsSnowEnabled={setIsSnowEnabled}
      isRainEnabled={isRainEnabled}
      setIsRainEnabled={setIsRainEnabled}
      isAutumnEnabled={isAutumnEnabled}
      setIsAutumnEnabled={setIsAutumnEnabled}
      isSakuraEnabled={isSakuraEnabled}
      setIsSakuraEnabled={setIsSakuraEnabled}
      isSettingsOpen={isSettingsOpen}
      setIsSettingsOpen={setIsSettingsOpen}
      isAnimEnabled={isAnimEnabled}
      setIsAnimEnabled={setIsAnimEnabled}
      userData={userData}
      activeTab={activeTab}
      onMenuClick={handleMenuClick} /></>
  );

};
