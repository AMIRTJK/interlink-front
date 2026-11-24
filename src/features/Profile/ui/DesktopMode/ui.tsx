import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { IUser } from "@entities/login";
import { Logo } from "@shared/ui";
import { TDesktopScene, SCENES, STORAGE_SCENE_KEY } from "./model";
import { LOCK_TEXTS } from "./lockModel";
import { SceneBackground } from "./Backgrounds/SceneBackground";
import { useLockClock } from "./lib/useLockClock";
import { UserCard } from "./ui/UserCard";
import { SceneSwitcher } from "./ui/SceneSwitcher";
import { Watch } from "./watch/ui/Watch";
import { WatchVariantSwitcher } from "./watch/ui/WatchVariantSwitcher";
import { useWatchVariant } from "./watch/lib/useWatchVariant";

interface IProps {
  userData: IUser | null;
  isDark: boolean;
  headerAction?: ReactNode;
  children?: ReactNode;
}

// split: предмет сцены и карточка стоят рядом (на узком — друг под другом) и не
// накладываются; при нехватке высоты прокручивается только область main.
const LAYOUT_CLASSES = {
  centered: {
    main: "relative z-10 flex flex-col items-center justify-center flex-1 text-center my-8",
    time: "text-6xl md:text-8xl font-thin tracking-widest leading-none",
    date: "text-sm md:text-base font-semibold tracking-widest uppercase mt-4",
    card: "mt-10",
  },
  split: {
    main: "relative z-10 flex-1 min-h-0 overflow-y-auto my-4 md:my-6",
    row: "min-h-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10 lg:gap-24 text-center py-2",
    column: "flex flex-col items-center w-full max-w-sm shrink-0",
    time: "text-4xl md:text-5xl font-extralight tracking-widest leading-none",
    date: "text-xs font-semibold tracking-widest uppercase mt-2.5",
    card: "mt-6",
  },
} as const;

const CENTERED_TIME_STYLE = {
  dark: { fontFamily: "system-ui, sans-serif", textShadow: "0 4px 30px rgba(0, 0, 0, 0.4)" },
  light: { fontFamily: "system-ui, sans-serif", textShadow: "0 4px 20px rgba(255, 255, 255, 0.8)" },
} as const;

export const DesktopMode = ({ userData, isDark, headerAction, children }: IProps) => {
  const [activeScene, setActiveScene] = useState<TDesktopScene>(() => {
    return (localStorage.getItem(STORAGE_SCENE_KEY) as TDesktopScene) || "space";
  });
  const { variant: watchVariant, selectVariant: selectWatchVariant } = useWatchVariant();

  const lang = localStorage.getItem("lang") || "ru";
  const { formattedTime, formattedShortTime, formattedDate } = useLockClock(lang);

  const selectScene = (scene: TDesktopScene) => {
    setActiveScene(scene);
    localStorage.setItem(STORAGE_SCENE_KEY, scene);
  };

  const isSplit = SCENES.find((scene) => scene.key === activeScene)?.layout === "split";
  const isClockScene = activeScene === "clock";
  const textTone = isDark ? "text-white" : "text-slate-850";
  const mutedTone = isDark ? "text-white/70" : "text-slate-600";
  const centeredTimeStyle = isDark ? CENTERED_TIME_STYLE.dark : CENTERED_TIME_STYLE.light;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] overflow-hidden flex flex-col justify-between p-8 md:p-12 select-none"
      role="dialog"
      aria-modal="true"
      aria-label={LOCK_TEXTS.title}
      data-session-lock=""
    >
      <div className="absolute inset-0 z-0">
        <SceneBackground scene={activeScene} isDark={isDark} />
      </div>

      <header className="relative z-10 flex items-center justify-between w-full">
        <Logo
          className={`text-xl font-bold tracking-[0.25em] ${isDark ? "text-white/80" : "text-slate-800/80"}`}
        />
        {headerAction}
      </header>

      {/* Дерево одно для обеих раскладок: при смене сцены форма пароля не перемонтируется. */}
      <main className={isSplit ? LAYOUT_CLASSES.split.main : LAYOUT_CLASSES.centered.main}>
        <div className={isSplit ? LAYOUT_CLASSES.split.row : "contents"}>
          {isClockScene && (
            <Watch
              key={watchVariant}
              variant={watchVariant}
              isDark={isDark}
              className="shrink-0 aspect-[8/15] h-[min(42vh,340px)] md:h-[min(calc(100vh-20rem),460px)] lg:h-[min(calc(100vh-20rem),620px)]"
            />
          )}
          <div className={isSplit ? LAYOUT_CLASSES.split.column : "contents"}>
            <h1
              className={`${isSplit ? LAYOUT_CLASSES.split.time : LAYOUT_CLASSES.centered.time} ${textTone}`}
              style={isSplit ? undefined : centeredTimeStyle}
            >
              {isSplit ? formattedShortTime : formattedTime}
            </h1>
            <p className={`${isSplit ? LAYOUT_CLASSES.split.date : LAYOUT_CLASSES.centered.date} ${mutedTone}`}>
              {formattedDate}
            </p>
            <UserCard
              userData={userData}
              isDark={isDark}
              className={isSplit ? LAYOUT_CLASSES.split.card : LAYOUT_CLASSES.centered.card}
            >
              {children}
            </UserCard>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex flex-col items-center gap-2.5 w-full">
        {isClockScene && (
          <WatchVariantSwitcher value={watchVariant} isDark={isDark} onChange={selectWatchVariant} />
        )}
        <SceneSwitcher activeScene={activeScene} isDark={isDark} lang={lang} onSelect={selectScene} />
      </footer>
    </motion.div>,
    document.body
  );
};
