import { useEffect, useState } from "react";
import userAvatar from "../../../../assets/images/user-avatar.jpg";
import { resolvePhotoUrl } from "./headerModel";

interface IHeaderUserBadgeProps {
  userData: any;
  userName: string;
  userSubtitle: string;
  showLogo: boolean;
}

export const HeaderUserBadge = ({
  userData,
  userName,
  userSubtitle,
  showLogo,
}: IHeaderUserBadgeProps) => {
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [userData?.photo_url, userData?.photo_path]);

  const photoUrl = avatarError
    ? userAvatar
    : userData?.photo_url || resolvePhotoUrl(userData?.photo_path) || userAvatar;

  return (
    <div
      className={`hidden md:flex items-center gap-4 min-w-0 ${
        showLogo
          ? "pl-6 border-l border-zinc-900/10 dark:border-zinc-700/40"
          : ""
      }`}
    >
      <div className="relative shrink-0">
        <img
          src={photoUrl}
          alt="Аватар пользователя"
          className="w-11 h-11 rounded-[2.5rem] border-2 border-white/60 dark:border-zinc-900/60 object-cover shadow-lg"
          onError={() => setAvatarError(true)}
        />
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white/60 dark:border-zinc-900/60 bg-emerald-500 shadow-lg animate-live-breathe" />
        </span>
      </div>
      <div className="leading-tight min-w-0">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[180px]">
          {userName}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[220px]">
          {userSubtitle}
        </p>
      </div>
    </div>
  );
};
