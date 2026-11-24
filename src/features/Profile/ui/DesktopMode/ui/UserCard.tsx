import { useState, type ReactNode } from "react";
import { IUser } from "@entities/login";
import userAvatar from "../../../../../assets/images/user-avatar.jpg";
import { resolvePhotoUrl } from "../lib/resolvePhotoUrl";

interface IProps {
  userData: IUser | null;
  isDark: boolean;
  className?: string;
  children?: ReactNode;
}

export const UserCard = ({ userData, isDark, className = "", children }: IProps) => {
  const [avatarError, setAvatarError] = useState(false);

  const fullName = userData
    ? [userData.first_name, userData.last_name].filter(Boolean).join(" ")
    : "—";

  const userSubtitle = userData
    ? [userData.position, userData.organization?.name]
        .filter(Boolean)
        .join(" • ")
    : "—";

  return (
    <div
      className={`p-5 md:p-6 rounded-[2rem] backdrop-blur-2xl border flex flex-col items-center max-w-sm w-full transition-all duration-300 ${isDark ? "bg-white/6 border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "bg-white/45 border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.06)]"} ${className}`}
    >
      <img
        src={avatarError ? userAvatar : (userData?.photo_url || resolvePhotoUrl(userData?.photo_path) || userAvatar)}
        alt=""
        onError={() => setAvatarError(true)}
        className={`w-16 h-16 rounded-full object-cover border-2 shadow-md ${isDark ? "border-white/30" : "border-indigo-400/50"}`}
      />
      <h2
        className={`text-lg font-bold mt-3.5 tracking-wide ${isDark ? "text-white/90" : "text-slate-800"}`}
      >
        {fullName}
      </h2>
      <p
        className={`text-xs mt-1.5 leading-relaxed tracking-wide px-2 ${isDark ? "text-white/50" : "text-slate-500"}`}
      >
        {userSubtitle}
      </p>
      {children}
    </div>
  );
};
