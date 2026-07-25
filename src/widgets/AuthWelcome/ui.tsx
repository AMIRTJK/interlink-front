import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AppRoutes,
  getWelcomeAnimationOption,
  welcomeStorage,
  WELCOME_EXIT_MS,
  WELCOME_REDUCED_MOTION_MS,
  WELCOME_TIMEOUT_MS,
} from "@shared/config";
import { If, Logo } from "@shared/ui";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { useDesignSettings } from "@widgets/layout/ui/useDesignSettings";
import { resolveUserName, useProfileWarmup, useReducedMotion } from "./lib";
import { TWarmupImport } from "./model";
import { SkipButton } from "./ui/SkipButton";
import { WelcomeStage } from "./ui/WelcomeStage";

interface IProps {
  warmupImports: TWarmupImport[];
}

export const AuthWelcome = ({ warmupImports }: IProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTheme } = useDesignSettings();
  const prefersReducedMotion = useReducedMotion();

  const [option] = useState(() =>
    getWelcomeAnimationOption(welcomeStorage.getAnimation()),
  );
  const { progress, isWarm } = useProfileWarmup(
    warmupImports,
    option.durationMs,
  );
  const [userName, setUserName] = useState(resolveUserName);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const target =
    (location.state as { to?: string } | null)?.to || AppRoutes.PROFILE;
  const theme = THEMES[currentTheme] || THEMES.emerald;

  const leave = useCallback(() => setIsLeaving(true), []);

  useEffect(() => {
    welcomeStorage.clearPending();
    welcomeStorage.markShown();
  }, []);

  useEffect(() => {
    if (isWarm) setUserName(resolveUserName());
  }, [isWarm]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIsAnimationDone(true),
      prefersReducedMotion ? WELCOME_REDUCED_MOTION_MS : option.durationMs,
    );
    return () => window.clearTimeout(timer);
  }, [option.durationMs, prefersReducedMotion]);

  useEffect(() => {
    if (isAnimationDone && isWarm) leave();
  }, [isAnimationDone, isWarm, leave]);

  useEffect(() => {
    const timer = window.setTimeout(leave, WELCOME_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [leave]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") leave();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [leave]);

  useEffect(() => {
    if (!isLeaving) return;
    const timer = window.setTimeout(
      () => navigate(target, { replace: true }),
      WELCOME_EXIT_MS,
    );
    return () => window.clearTimeout(timer);
  }, [isLeaving, navigate, target]);

  return (
    <motion.div
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{ duration: WELCOME_EXIT_MS / 1000, ease: "easeInOut" }}
      className="fixed inset-0 z-50 overflow-hidden bg-[#020617] font-sans text-white select-none"
    >
      <If is={!prefersReducedMotion}>
        <>
          <WelcomeStage
            animation={option.key}
            userName={userName}
            themeGradient={theme.gradient}
            accentColor={theme.dark}
            progress={progress}
          />
          <SkipButton onSkip={leave} />
        </>
      </If>

      <If is={prefersReducedMotion}>
        <div className="flex h-full w-full items-center justify-center">
          <Logo className="text-xl text-white/80" />
        </div>
      </If>
    </motion.div>
  );
};
