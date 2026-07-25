import { motion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { If } from "@shared/ui";
import { IWelcomeAnimationProps, PROTOCOL_STEPS } from "../../model";
import { BrandReveal } from "../parts/BrandReveal";
import { ScrambleText } from "../parts/ScrambleText";
import { useTimedPhase } from "../../lib";

const PHASES = [
  { phase: "console", at: 0 },
  { phase: "brand", at: 4200 },
] as const;

const HEADLINE = "Установка защищённого соединения";
const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

export const ProtocolAnimation = ({
  userName,
  themeGradient,
  accentColor,
  progress,
}: IWelcomeAnimationProps) => {
  const phase = useTimedPhase(PHASES);
  const isConsole = phase === "console";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-[0.18]"
      >
        <defs>
          <pattern
            id="protocolGrid"
            width="46"
            height="46"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 46 0 L 0 0 0 46"
              fill="none"
              stroke={accentColor}
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#protocolGrid)" />
      </svg>

      <motion.div
        initial={{ y: "-20%" }}
        animate={{ y: "120%" }}
        transition={{ duration: 3.2, ease: "linear", repeat: Infinity }}
        className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-white/8 to-transparent"
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(2,6,23,0.85)_75%,#020617_100%)]" />

      <motion.div
        animate={{ opacity: isConsole ? 1 : 0, y: isConsole ? 0 : -18 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-7 px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${themeGradient}`}
        >
          <ShieldCheck className="h-6 w-6 text-white" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-center text-[10px] font-semibold tracking-[0.35em] text-white/60 uppercase sm:text-xs"
        >
          {HEADLINE}
        </motion.p>

        <ScrambleText
          text={userName}
          durationMs={2400}
          delayMs={700}
          className="text-center text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-4xl"
        />

        <div className="flex w-full max-w-xs flex-col gap-3">
          {PROTOCOL_STEPS.map((step) => (
            <div key={step.label} className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: progress >= step.at ? 1 : 0.85,
                  opacity: progress >= step.at ? 1 : 0.3,
                }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                  progress >= step.at
                    ? "border-transparent bg-gradient-to-br " + themeGradient
                    : "border-white/20 bg-white/5"
                }`}
              >
                <If is={progress >= step.at}>
                  <Check className="h-3.5 w-3.5 text-white" />
                </If>
              </motion.div>
              <span
                className={`text-xs tracking-wider transition-colors sm:text-sm ${
                  progress >= step.at ? "text-white/85" : "text-white/50"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] font-semibold tracking-[0.3em] text-white/50 tabular-nums">
          {Math.round(progress * 100)}%
        </p>
      </motion.div>

      <motion.div
        animate={{ opacity: isConsole ? 0 : 1 }}
        transition={{ duration: 0.6, delay: isConsole ? 0 : 0.15, ease: EASE_OUT }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <If is={!isConsole}>
          <BrandReveal userName={userName} themeGradient={themeGradient} />
        </If>
      </motion.div>
    </div>
  );
};
