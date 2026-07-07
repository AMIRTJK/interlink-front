import { tokenControl } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IUser } from "@entities/login";
import { useState } from "react";
import { useGetQuery } from "@shared/lib/hooks";
import { ProfileSettingsModal } from "./ui/ProfileSettingsModal";
import { PersonalCabinet } from "./ui/PersonalCabinet";
import "./style.css";

interface IProps {
  currentTheme?: string;
}

export const Profile = ({ currentTheme }: IProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: rawUserData, isLoading, isFetching, refetch } = useGetQuery<any>({
    url: ApiRoutes.AUTH_ME,
    useToken: true,
    options: {
      enabled: !!tokenControl.get(),
      onSuccess: (data: any) => {
        const user = data?.data || data;
        if (user) {
          tokenControl.setUserData(user);
        }
      },
    },
  });

  const userData = (() => {
    const rawUser = rawUserData?.data?.user || rawUserData?.user || rawUserData?.data || rawUserData;
    if (!rawUser || typeof rawUser !== "object") return null;
    const user = { ...rawUser } as IUser;
    if (!user.full_name) {
      user.full_name = [user.last_name, user.first_name, user.middle_name]
        .filter(Boolean)
        .join(" ");
    }
    if (!user.phone && (user as any).work_phone) {
      user.phone = (user as any).work_phone;
    }
    return user;
  })();

  return (
    <>
      <ProfileSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        mfaEnabled={!!userData?.mfa_enabled}
        isStatusLoading={isFetching}
        onRefresh={refetch}
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
