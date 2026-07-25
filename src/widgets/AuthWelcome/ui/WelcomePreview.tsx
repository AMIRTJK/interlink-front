import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getWelcomeAnimationOption, TWelcomeAnimation } from "@shared/config";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { useDesignSettings } from "@widgets/layout/ui/useDesignSettings";
import { resolveUserName } from "../lib";
import { WelcomeStage } from "./WelcomeStage";

interface IProps {
  animation: TWelcomeAnimation;
  onClose: () => void;
}

const PROGRESS_TICK_MS = 120;
const HOLD_AFTER_MS = 1400;

export const WelcomePreview = ({ animation, onClose }: IProps) => {
  const { currentTheme } = useDesignSettings();
  const [progress, setProgress] = useState(0);
  const option = getWelcomeAnimationOption(animation);
  const theme = THEMES[currentTheme] || THEMES.emerald;

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startedAt) / option.durationMs));
    }, PROGRESS_TICK_MS);
    return () => window.clearInterval(timer);
  }, [option.durationMs]);

  useEffect(() => {
    const timer = window.setTimeout(onClose, option.durationMs + HOLD_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [onClose, option.durationMs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed inset-0 z-[10000] overflow-hidden bg-[#020617] font-sans text-white select-none"
    >
      <WelcomeStage
        animation={option.key}
        userName={resolveUserName()}
        themeGradient={theme.gradient}
        accentColor={theme.dark}
        progress={progress}
      />

      <div className="absolute top-6 left-6 z-30 flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-2 backdrop-blur-md">
        <span className="text-[10px] font-semibold tracking-[0.28em] text-white/50 uppercase">
          Предпросмотр
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-white/80">
          {option.labelRu}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/70 backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>,
    document.body,
  );
};
