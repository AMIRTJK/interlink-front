import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wind, Mountain, Waves, CloudRain, Atom, Clock } from "lucide-react";
import { SCENES, type TDesktopScene } from "../model";

interface IProps {
  activeScene: TDesktopScene;
  isDark: boolean;
  lang: string;
  onSelect: (scene: TDesktopScene) => void;
}

const ICONS: Record<TDesktopScene, ComponentType<{ className?: string }>> = {
  space: Sparkles,
  aurora: Wind,
  mountains: Mountain,
  ocean: Waves,
  rain: CloudRain,
  particles: Atom,
  clock: Clock,
};

export const SceneSwitcher = ({ activeScene, isDark, lang, onSelect }: IProps) => (
  <div
    className={`flex items-center gap-1.5 p-1.5 rounded-full backdrop-blur-2xl border ${isDark ? "bg-black/35 border-white/10" : "bg-white/60 border-black/8"}`}
  >
    {SCENES.map((scene) => {
      const IconComponent = ICONS[scene.key];
      const isActive = activeScene === scene.key;
      return (
        <button
          key={scene.key}
          onClick={() => onSelect(scene.key)}
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
);
