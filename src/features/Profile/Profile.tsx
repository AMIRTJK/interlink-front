
import { useNavigate } from "react-router-dom";
import { AppRoutes } from "@shared/config/AppRoutes";
import { tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IUser } from "@entities/login";
import { useState } from "react";
import { useCurrentTab } from "./lib/lib";
import { RenderJSX } from "./lib/RenderJSX";
import { useNavbar, useGetQuery, useTabs } from "@shared/lib/hooks";
import "./style.css";

export const Profile = () => {
  const navigate = useNavigate();
  const { variant, setVariant } = useNavbar();
  const { tabMode, setTabMode } = useTabs();
  const userId = tokenControl.getUserId();

  const activeTab = useCurrentTab();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(tokenControl.getProfileExpanded());

  const { data: userDataResponse, isLoading } = useGetQuery<{ data: IUser }>({
    url: `${ApiRoutes.FETCH_USER_BY_ID}${userId}`,
    options: {
      enabled: !!userId,
      onSuccess: (data) => {
        if (data?.data) {
          tokenControl.setUserData(data.data);
        }
      },
    }
  });

  const userData = userDataResponse?.data || null;

  const handleToggleExpanded = (val: boolean) => {
    setIsExpanded(val);
    tokenControl.setProfileExpanded(val);
  };

  const handleMenuClick = (e: { key: string }) => {
    const routes: Record<string, string> = {
      tasks: AppRoutes.PROFILE_TASKS,
      calendar: AppRoutes.PROFILE_CALENDAR,
      analytics: AppRoutes.PROFILE_ANALYTICS,
    };

    const subPath = routes[e.key];
    if (subPath) {
      navigate(subPath);
    }
  };

  return (
    <>
      <RenderJSX
        isPending={!!isLoading}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        userData={userData}
        activeTab={activeTab}
        onMenuClick={handleMenuClick}
        navbarVariant={variant}
        setNavbarVariant={setVariant}
        isExpanded={isExpanded}
        setIsExpanded={handleToggleExpanded}
        tabMode={tabMode}
        setTabMode={setTabMode}
      />

    </>
  );

};
