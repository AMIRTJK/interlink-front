import { motion } from "framer-motion";

interface IProps {
  accentColor: string;
  appearAt: number;
  flashAt: number;
}

const STAMP_EASE = [0.2, 0.9, 0.2, 1] as const;

export const SignatureStamp = ({ accentColor, appearAt, flashAt }: IProps) => (
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 2.9, rotate: -32 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [2.9, 1, 1, 1.12],
        rotate: [-32, -8, -8, -8],
      }}
      transition={{
        duration: 2.1,
        delay: appearAt,
        times: [0, 0.24, 0.78, 1],
        ease: STAMP_EASE,
      }}
      className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40"
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke={accentColor}
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, delay: appearAt + 0.1, ease: "easeOut" }}
        />
        <circle
          cx="50"
          cy="50"
          r="39"
          fill="none"
          stroke={accentColor}
          strokeWidth="0.8"
          strokeDasharray="3 3"
          opacity="0.7"
        />
      </svg>

      <div className="flex flex-col items-center gap-1">
        <span className="text-xl font-bold tracking-[0.2em] text-white sm:text-2xl">
          ЭЦП
        </span>
        <span className="text-[8px] font-semibold tracking-[0.25em] text-white/70 uppercase sm:text-[9px]">
          Подписано
        </span>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 0.85, 0], scale: [0.4, 2.4, 3.2] }}
      transition={{ duration: 0.75, delay: flashAt, ease: "easeOut" }}
      className="absolute h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0)_0_34%,rgba(255,255,255,0.9)_48%,rgba(255,255,255,0)_72%)] mix-blend-screen"
    />
  </div>
);
