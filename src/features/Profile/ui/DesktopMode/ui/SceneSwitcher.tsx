import type { ComponentType } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wind, Mountain, Waves, CloudRain, Snowflake, Flame, Binary, Atom, Clock } from "lucide-react";
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
  snow: Snowflake,
  campfire: Flame,
  matrix: Binary,
  particles: Atom,
  clock: Clock,
};

export const SceneSwitcher = ({ activeScene, isDark, lang, onSelect }: IProps) => (
  <div
    className={`flex items-center gap-1 md:gap-1.5 p-1.5 max-w-full overflow-x-auto [scrollbar-width:none] rounded-full backdrop-blur-2xl backdrop-saturate-150 border ${isDark ? "bg-slate-950/45 border-white/10 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]" : "bg-white/70 border-white/80 shadow-[0_12px_40px_-12px_rgba(49,46,129,0.3)]"}`}
  >
    {SCENES.map((scene) => {
      const IconComponent = ICONS[scene.key];
      const isActive = activeScene === scene.key;
      const label = lang === "ru" ? scene.labelRu : scene.labelEn;
      return (
        <button
          key={scene.key}
          type="button"
          onClick={() => onSelect(scene.key)}
          aria-label={label}
          aria-pressed={isActive}
          className={`relative shrink-0 px-3 md:px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer hover:scale-105 ${isActive ? "text-white" : isDark ? "text-white/50 hover:text-white/85" : "text-slate-600 hover:text-slate-850"}`}
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
            {/* Сцен десять: с подписями панель помещается только на широком экране,
                на остальных остаются иконки. */}
            <span className="hidden xl:inline">{label}</span>
          </span>
        </button>
      );
    })}
  </div>
);
