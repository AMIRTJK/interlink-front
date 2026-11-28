import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { IUser } from "@entities/login";
import userAvatar from "../../../../../assets/images/user-avatar.jpg";
import { resolvePhotoUrl } from "../lib/resolvePhotoUrl";

export type TUserCardVariant = "regular" | "compact";

interface IProps {
  userData: IUser | null;
  isDark: boolean;
  variant?: TUserCardVariant;
  // Кнопка в правом верхнем углу карточки (например, «Скрыть»).
  cornerAction?: ReactNode;
  className?: string;
  children?: ReactNode;
}

// compact — низкая карточка (аватар слева от имени): освобождает экран под сцену с
// собственным предметом внизу, например под костёр.
const VARIANT_CLASSES: Record<TUserCardVariant, Record<"root" | "content" | "identity" | "avatar" | "name" | "subtitle", string>> = {
  regular: {
    root: "p-5 md:p-6 max-w-sm",
    content: "items-center",
    identity: "flex flex-col items-center",
    avatar: "w-16 h-16",
    name: "text-lg mt-3.5",
    subtitle: "mt-1.5 px-2",
  },
  compact: {
    root: "px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-4 max-w-md",
    content: "items-stretch",
    identity: "flex items-center gap-3.5 text-left min-w-0 pr-8",
    avatar: "w-12 h-12",
    name: "text-base truncate",
    subtitle: "mt-0.5 truncate",
  },
};

const AVATAR_SIZE: Record<TUserCardVariant, number> = { regular: 64, compact: 48 };

// Прозрачность анимируем у самой карточки, на которой висит backdrop-filter: так
// стекло, тень и содержимое гаснут вместе. Предок с opacity < 1 ломает размытие —
// стекло включалось скачком, поэтому обёртки карточки прозрачность не трогают.
const CARD_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
} as const;

export const UserCard = ({ userData, isDark, variant = "regular", cornerAction, className = "", children }: IProps) => {
  const [avatarError, setAvatarError] = useState(false);
  const classes = VARIANT_CLASSES[variant];

  const fullName = userData
    ? [userData.first_name, userData.last_name].filter(Boolean).join(" ")
    : "—";

  const userSubtitle = userData
    ? [userData.position, userData.organization?.name]
        .filter(Boolean)
        .join(" • ")
    : "—";

  return (
    <motion.div
      initial={CARD_FADE.initial}
      animate={CARD_FADE.animate}
      exit={CARD_FADE.exit}
      className={`relative rounded-[2rem] backdrop-blur-2xl backdrop-saturate-150 border flex flex-col w-full ${classes.root} ${isDark ? "bg-th-deep/35 border-white/12 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]" : "bg-white/65 border-white/80 shadow-[0_24px_64px_-16px_rgba(49,46,129,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]"} ${className}`}
    >
      <div className={`flex flex-col w-full ${classes.content}`}>
        <div className={classes.identity}>
          <div className="shrink-0 p-[3px] rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-300 to-amber-300 shadow-lg shadow-violet-500/25">
            <img
              src={avatarError ? userAvatar : (userData?.photo_url || resolvePhotoUrl(userData?.photo_path) || userAvatar)}
              alt=""
              width={AVATAR_SIZE[variant]}
              height={AVATAR_SIZE[variant]}
              onError={() => setAvatarError(true)}
              className={`${classes.avatar} rounded-full object-cover border-2 ${isDark ? "border-th-base" : "border-white"}`}
            />
          </div>
          <div className="min-w-0">
            <h2 className={`font-bold tracking-wide ${classes.name} ${isDark ? "text-white/90" : "text-slate-800"}`}>
              {fullName}
            </h2>
            <p
              className={`text-xs leading-relaxed tracking-wide ${classes.subtitle} ${isDark ? "text-white/50" : "text-slate-500"}`}
            >
              {userSubtitle}
            </p>
          </div>
        </div>
        {children}
        {cornerAction}
      </div>
    </motion.div>
  );
};
