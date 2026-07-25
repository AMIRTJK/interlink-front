import { motion } from "framer-motion";
import { If, Logo } from "@shared/ui";
import { WELCOME_GREETING, WELCOME_TAGLINE } from "../../model";

interface IProps {
  userName: string;
  themeGradient: string;
  delaySec?: number;
  withSweep?: boolean;
}

const EASE_OUT = [0.215, 0.61, 0.355, 1] as const;

export const BrandReveal = ({
  userName,
  themeGradient,
  delaySec = 0,
  withSweep = true,
}: IProps) => (
  <div className="relative z-20 flex flex-col items-center gap-3 px-6 text-center">
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delaySec, ease: EASE_OUT }}
      className="text-[11px] font-semibold tracking-[0.35em] text-white/60 uppercase sm:text-xs"
    >
      {WELCOME_GREETING}
    </motion.p>

    <div className="relative overflow-hidden">
      <motion.h1
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: delaySec + 0.12, ease: EASE_OUT }}
        className="text-3xl leading-tight font-semibold tracking-tight text-white sm:text-5xl"
      >
        {userName}
      </motion.h1>

      <If is={withSweep}>
        <motion.div
          initial={{ x: "-130%" }}
          animate={{ x: "230%" }}
          transition={{ duration: 1.1, delay: delaySec + 0.55, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent mix-blend-overlay"
        />
      </If>
    </div>

    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ duration: 0.7, delay: delaySec + 0.4, ease: EASE_OUT }}
      className={`h-px w-40 origin-center bg-gradient-to-r ${themeGradient} sm:w-56`}
    />

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: delaySec + 0.55, ease: EASE_OUT }}
      className="flex flex-col items-center gap-2"
    >
      <Logo className="text-base text-white/85 sm:text-xl" />
      <p className="max-w-xs text-[10px] leading-relaxed tracking-[0.2em] text-white/62 uppercase sm:max-w-sm sm:text-[11px]">
        {WELCOME_TAGLINE}
      </p>
    </motion.div>
  </div>
);
