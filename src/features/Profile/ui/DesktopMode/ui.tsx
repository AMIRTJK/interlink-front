import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  X,
  Sparkles,
  Wind,
  Mountain,
  Waves,
  CloudRain,
  Atom,
} from "lucide-react";
import { IUser } from "@entities/login";
import { Logo } from "@shared/ui";
import { getEnvVar } from "@shared/config";
import userAvatar from "../../../../assets/images/user-avatar.jpg";
import { TDesktopScene, SCENES, STORAGE_SCENE_KEY } from "./model";
import { SpaceBg } from "./Backgrounds/SpaceBg";
import { AuroraBg } from "./Backgrounds/AuroraBg";
import { RainBg } from "./Backgrounds/RainBg";
import { ParticlesBg } from "./Backgrounds/ParticlesBg";
import { OceanBg } from "./Backgrounds/OceanBg";
import { MountainsBg } from "./Backgrounds/MountainsBg";

interface IProps {
  userData: IUser | null;
  onClose: () => void;
  isDark: boolean;
}

const resolvePhotoUrl = (path?: string | null): string => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const apiHost = getEnvVar("VITE_API_URL") || "";
  const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${host}${p}`;
};

const ICONS: Record<TDesktopScene, React.ComponentType<{ className?: string }>> = {
  space: Sparkles,
  aurora: Wind,
  mountains: Mountain,
  ocean: Waves,
  rain: CloudRain,
  particles: Atom,
};

export const DesktopMode = ({ userData, onClose, isDark }: IProps) => {
  const [activeScene, setActiveScene] = useState<TDesktopScene>(() => {
    return (localStorage.getItem(STORAGE_SCENE_KEY) as TDesktopScene) || "space";
  });

  const [time, setTime] = useState(new Date());
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectScene = (scene: TDesktopScene) => {
    setActiveScene(scene);
    localStorage.setItem(STORAGE_SCENE_KEY, scene);
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const lang = localStorage.getItem("lang") || "ru";
  const formattedDate = time.toLocaleDateString(
    lang === "ru" ? "ru-RU" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    }
  );

  const fullName = userData
    ? [userData.first_name, userData.last_name].filter(Boolean).join(" ")
    : "—";

  const userSubtitle = userData
    ? [userData.position, userData.organization?.name]
        .filter(Boolean)
        .join(" • ")
    : "—";

  const renderBackground = () => {
    switch (activeScene) {
      case "space":
        return <SpaceBg isDark={isDark} />;
      case "aurora":
        return <AuroraBg isDark={isDark} />;
      case "rain":
        return <RainBg isDark={isDark} />;
      case "particles":
        return <ParticlesBg isDark={isDark} />;
      case "ocean":
        return <OceanBg isDark={isDark} />;
      case "mountains":
        return <MountainsBg isDark={isDark} />;
      default:
        return null;
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] overflow-hidden flex flex-col justify-between p-8 md:p-12 select-none"
    >
      <div className="absolute inset-0 z-0">{renderBackground()}</div>

      <header className="relative z-10 flex items-center justify-between w-full">
        <Logo
          className={`text-xl font-bold tracking-[0.25em] ${isDark ? "text-white/80" : "text-slate-800/80"}`}
        />
        <button
          onClick={onClose}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-xl border cursor-pointer hover:scale-115 ${isDark ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-850"}`}
        >
          <X size={18} />
        </button>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center flex-1 text-center my-8">
        <h1
          className={`text-6xl md:text-8xl font-thin tracking-widest leading-none ${isDark ? "text-white" : "text-slate-850"}`}
          style={{
            fontFamily: "system-ui, sans-serif",
            textShadow: isDark
              ? "0 4px 30px rgba(0, 0, 0, 0.4)"
              : "0 4px 20px rgba(255, 255, 255, 0.8)",
          }}
        >
          {formattedTime}
        </h1>
        <p
          className={`text-sm md:text-base font-semibold tracking-widest uppercase mt-4 ${isDark ? "text-white/70" : "text-slate-650"}`}
        >
          {formattedDate}
        </p>

        <div
          className={`mt-10 p-5 md:p-6 rounded-[2rem] backdrop-blur-2xl border flex flex-col items-center max-w-sm w-full transition-all duration-300 ${isDark ? "bg-white/6 border-white/12 shadow-[0_8px_32px_rgba(0,0,0,0.3)]" : "bg-white/45 border-white/40 shadow-[0_8px_32px_rgba(31,38,135,0.06)]"}`}
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
        </div>
      </main>

      <footer className="relative z-10 flex justify-center w-full">
        <div
          className={`flex items-center gap-1.5 p-1.5 rounded-full backdrop-blur-2xl border ${isDark ? "bg-black/35 border-white/10" : "bg-white/60 border-black/8"}`}
        >
          {SCENES.map((scene) => {
            const IconComponent = ICONS[scene.key];
            const isActive = activeScene === scene.key;
            return (
              <button
                key={scene.key}
                onClick={() => selectScene(scene.key)}
                className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-105 ${isActive ? "text-white" : isDark ? "text-white/50 hover:text-white/85" : "text-slate-600 hover:text-slate-850"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveSceneBg"
                    className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full shadow-lg"
                    transition={{
                      type: "spring",
                      bounce: 0.15,
                      duration: 0.5,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <IconComponent className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {lang === "ru" ? scene.labelRu : scene.labelEn}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </footer>
    </motion.div>,
    document.body
  );
};
