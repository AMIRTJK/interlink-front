import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { IUser } from "@entities/login";
import { Logo } from "@shared/ui";
import { TDesktopScene, SCENES, STORAGE_SCENE_KEY, DEFAULT_SCENE } from "./model";
import { LOCK_TEXTS } from "./lockModel";
import { SceneBackground } from "./Backgrounds/SceneBackground";
import { useLockClock } from "./lib/useLockClock";
import { UserCard } from "./ui/UserCard";
import { RevealHint } from "./ui/RevealHint";
import { HideFormButton } from "./ui/HideFormButton";
import { useFormReveal } from "./lib/useFormReveal";
import { usePointerActivity } from "./lib/usePointerActivity";
import { SceneSwitcher } from "./ui/SceneSwitcher";
import { Watch } from "./watch/ui/Watch";
import { WatchVariantSwitcher } from "./watch/ui/WatchVariantSwitcher";
import { useWatchVariant } from "./watch/lib/useWatchVariant";
import { useSpaceVariant } from "./space/lib/useSpaceVariant";
import { SpaceVariantSwitcher } from "./space/ui/SpaceVariantSwitcher";

interface IProps {
  userData: IUser | null;
  isDark: boolean;
  // Ночная сцена может переключить оформление на тёмное и при светлой теме —
  // поэтому шапка и форма получают тему от экрана, а не берут её сами.
  headerAction?: (isDark: boolean, isControlsVisible: boolean) => ReactNode;
  children?: (isDark: boolean) => ReactNode;
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
  // stage: низ экрана занимает предмет сцены (костёр) — время и компактная карточка
  // стоят наверху, всё пространство под ними отдано сцене.
  stage: {
    main: "relative z-10 flex flex-col items-center justify-start flex-1 text-center mt-[2vh] md:mt-[4vh]",
    time: "text-5xl md:text-7xl font-thin tracking-widest leading-none",
    date: "text-xs md:text-sm font-semibold tracking-widest uppercase mt-3",
    card: "mt-6",
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
    const saved = localStorage.getItem(STORAGE_SCENE_KEY) as TDesktopScene;
    return SCENES.some((s) => s.key === saved) ? saved : DEFAULT_SCENE;
  });
  const { variant: watchVariant, selectVariant: selectWatchVariant } = useWatchVariant();
  const { variant: spaceVariant, selectVariant: selectSpaceVariant } = useSpaceVariant();

  const lang = localStorage.getItem("lang") || "ru";
  const { formattedTime, formattedShortTime, formattedDate } = useLockClock(lang);

  const selectScene = (scene: TDesktopScene) => {
    setActiveScene(scene);
    localStorage.setItem(STORAGE_SCENE_KEY, scene);
  };

  const sceneOption = SCENES.find((scene) => scene.key === activeScene);
  const layout = sceneOption?.layout ?? "centered";
  const classes = LAYOUT_CLASSES[layout];
  const isSplit = layout === "split";
  const isClockScene = activeScene === "clock";
  const isSceneDark = isDark || Boolean(sceneOption?.isAlwaysNight);
  const isFormOnDemand = Boolean(sceneOption?.isFormOnDemand);
  const { isRevealed, reveal, conceal } = useFormReveal(isFormOnDemand);
  const { isControlsVisible, handleControlFocus, handleControlBlur } = usePointerActivity();
  const textTone = isSceneDark ? "text-white" : "text-slate-850";
  const mutedTone = isSceneDark ? "text-white/70" : "text-slate-600";
  const centeredTimeStyle = isSceneDark ? CENTERED_TIME_STYLE.dark : CENTERED_TIME_STYLE.light;

  // Щелчок по пустому месту сцены открывает скрытую форму и прячет открытую.
  const handleStageClick = () => {
    if (!isFormOnDemand) return;
    if (isRevealed) conceal();
    else reveal();
  };

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
        <SceneBackground scene={activeScene} isDark={isDark} spaceVariant={spaceVariant} />
      </div>

      <header className="relative z-10 flex items-center justify-between w-full">
        <Logo
          className={`text-xl font-bold tracking-[0.25em] ${isSceneDark ? "text-white/80" : "text-slate-800/80"}`}
        />
        {headerAction && (
          <div onFocus={handleControlFocus} onBlur={handleControlBlur}>
            {headerAction(isSceneDark, isControlsVisible)}
          </div>
        )}
      </header>

      {/* Дерево одно для всех раскладок: при смене сцены форма пароля не перемонтируется. */}
      <main className={classes.main} onClick={handleStageClick}>
        <div className={isSplit ? LAYOUT_CLASSES.split.row : "contents"}>
          {isClockScene && (
            <Watch
              key={watchVariant}
              variant={watchVariant}
              isDark={isSceneDark}
              className="shrink-0 aspect-[8/15] h-[min(42vh,340px)] md:h-[min(calc(100vh-20rem),460px)] lg:h-[min(calc(100vh-20rem),620px)]"
            />
          )}
          <div className={isSplit ? LAYOUT_CLASSES.split.column : "contents"}>
            <h1
              className={`${classes.time} ${textTone}`}
              style={isSplit ? undefined : centeredTimeStyle}
            >
              {isSplit ? formattedShortTime : formattedTime}
            </h1>
            <p className={`${classes.date} ${mutedTone}`}>
              {formattedDate}
            </p>
            {isFormOnDemand ? (
              // Место под карточку зарезервировано и при скрытой форме: граница над
              // костром не двигается, и огонь не меняет размер. popLayout сразу выносит
              // уходящий элемент из потока — подсказка не прыгает, а карточка монтируется
              // без ожидания (иначе потеряется первый набранный символ пароля).
              <div data-lock-anchor="" className="relative mt-6 w-full min-h-[11.5rem] flex flex-col items-center justify-start">
                <AnimatePresence initial={false} mode="popLayout">
                  {isRevealed ? (
                    <motion.div
                      key="card"
                      /* Без opacity: прозрачность обёртки ломает размытие стекла,
                         карточка гаснет и проявляется сама. */
                      initial={{ y: 16, scale: 0.97 }}
                      animate={{ y: 0, scale: 1 }}
                      exit={{ y: 8, scale: 0.98, transition: { duration: 0.18, ease: "easeIn" } }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="w-full flex justify-center"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <UserCard
                        userData={userData}
                        isDark={isSceneDark}
                        variant="compact"
                        cornerAction={<HideFormButton isDark={isSceneDark} onHide={conceal} />}
                      >
                        {children?.(isSceneDark)}
                      </UserCard>
                    </motion.div>
                  ) : (
                    <RevealHint key="hint" isDark={isSceneDark} onReveal={reveal} />
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <UserCard userData={userData} isDark={isSceneDark} className={classes.card}>
                {children?.(isSceneDark)}
              </UserCard>
            )}
          </div>
        </div>
      </main>

      <footer
        className="relative z-10 flex flex-col items-center gap-2.5 w-full"
        data-lock-footer=""
        onFocus={handleControlFocus}
        onBlur={handleControlBlur}
      >
        {isClockScene && (
          <WatchVariantSwitcher
            value={watchVariant}
            isDark={isSceneDark}
            isVisible={isControlsVisible}
            onChange={selectWatchVariant}
          />
        )}
        {activeScene === "space" && (
          <SpaceVariantSwitcher
            value={spaceVariant}
            isVisible={isControlsVisible}
            onChange={selectSpaceVariant}
          />
        )}
        <SceneSwitcher
          activeScene={activeScene}
          isDark={isSceneDark}
          isVisible={isControlsVisible}
          lang={lang}
          onSelect={selectScene}
        />
      </footer>
    </motion.div>,
    document.body
  );
};
