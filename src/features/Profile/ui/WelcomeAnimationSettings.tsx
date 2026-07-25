import { useState } from "react";
import { CheckCircle, Play, Sparkles } from "lucide-react";
import {
  DEFAULT_WELCOME_ANIMATION,
  TWelcomeAnimation,
  TWelcomeMode,
  WELCOME_ANIMATIONS,
  WELCOME_MODES,
  welcomeStorage,
} from "@shared/config";
import { If, Tooltip } from "@shared/ui";
import { WelcomePreview } from "@widgets/AuthWelcome";

export const WelcomeAnimationSettings = () => {
  const [animation, setAnimation] = useState<TWelcomeAnimation>(
    welcomeStorage.getAnimation,
  );
  const [mode, setMode] = useState<TWelcomeMode>(welcomeStorage.getMode);
  const [previewKey, setPreviewKey] = useState<TWelcomeAnimation | null>(null);

  const isDisabled = mode === "off";

  const handleSelect = (key: TWelcomeAnimation) => {
    setAnimation(key);
    welcomeStorage.setAnimation(key);
  };

  const handleMode = (next: TWelcomeMode) => {
    setMode(next);
    welcomeStorage.setMode(next);
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
          <Sparkles className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Анимация входа
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Играет после входа, пока загружается личный кабинет
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-900/60">
        {WELCOME_MODES.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handleMode(item.key)}
            className={`flex-1 cursor-pointer rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
              mode === item.key
                ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {item.labelRu}
          </button>
        ))}
      </div>

      <div
        className={`mt-3 space-y-1.5 transition-opacity ${
          isDisabled ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {WELCOME_ANIMATIONS.map((item) => {
          const Icon = item.icon;
          const isActive = animation === item.key;

          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 rounded-xl border p-2 transition-colors ${
                isActive
                  ? "border-indigo-300 bg-white dark:border-indigo-500/40 dark:bg-slate-800/80"
                  : "border-transparent hover:bg-white dark:hover:bg-slate-800/50"
              }`}
            >
              <button
                type="button"
                onClick={() => handleSelect(item.key)}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${item.swatch}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.labelRu}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.descriptionRu}
                  </span>
                </span>
              </button>

              <If is={isActive}>
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              </If>

              <Tooltip title="Посмотреть">
                <button
                  type="button"
                  onClick={() => setPreviewKey(item.key)}
                  className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
          );
        })}
      </div>

      <If is={previewKey !== null}>
        <WelcomePreview
          animation={previewKey || DEFAULT_WELCOME_ANIMATION}
          onClose={() => setPreviewKey(null)}
        />
      </If>
    </div>
  );
};
