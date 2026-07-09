import { useState } from "react";
import { IFileUser, resolveFilePhotoUrl, getUserInitials } from "./lib";

const AVATAR_COLORS = [
  "bg-indigo-500!",
  "bg-emerald-500!",
  "bg-rose-500!",
  "bg-amber-500!",
  "bg-sky-500!",
  "bg-purple-500!",
  "bg-teal-500!",
  "bg-pink-500!",
];

interface IProps {
  user?: IFileUser | null;
  size?: number;
  ring?: boolean;
  className?: string;
}

export const UserAvatar = ({ user, size = 32, ring = false, className = "" }: IProps) => {
  const [failed, setFailed] = useState(false);
  const photo = resolveFilePhotoUrl(user?.photo_path);
  const colorClass = AVATAR_COLORS[(user?.id ?? 0) % AVATAR_COLORS.length];
  const ringClass = ring ? "ring-2 ring-white dark:ring-slate-900" : "";

  if (photo && !failed) {
    return (
      <img
        src={photo}
        alt=""
        onError={() => setFailed(true)}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover flex-shrink-0 ${ringClass} ${className}`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      className={`rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white! ${colorClass} ${ringClass} ${className}`}
    >
      {getUserInitials(user)}
    </div>
  );
};
