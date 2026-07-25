import { motion } from "framer-motion";
import { IWelcomeAnimationProps } from "../../model";
import { BrandReveal } from "../parts/BrandReveal";

const BLOBS = [
  {
    id: "blob-a",
    className: "-top-[15%] -left-[10%] h-[65%] w-[55%]",
    to: { x: 90, y: 60, scale: 1.25 },
    duration: 9,
  },
  {
    id: "blob-b",
    className: "top-[20%] -right-[15%] h-[70%] w-[60%]",
    to: { x: -80, y: 40, scale: 1.15 },
    duration: 11,
  },
  {
    id: "blob-c",
    className: "-bottom-[20%] left-[20%] h-[60%] w-[65%]",
    to: { x: 50, y: -60, scale: 1.3 },
    duration: 13,
  },
];

export const AuroraAnimation = ({
  userName,
  themeGradient,
}: IWelcomeAnimationProps) => (
  <div className="absolute inset-0 overflow-hidden">
    {BLOBS.map((blob) => (
      <motion.div
        key={blob.id}
        initial={{ opacity: 0, scale: 0.85, x: 0, y: 0 }}
        animate={{ opacity: 0.45, ...blob.to }}
        transition={{
          duration: blob.duration,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
          opacity: { duration: 1.6, ease: "easeOut", repeat: 0 },
        }}
        className={`absolute rounded-full bg-gradient-to-br ${themeGradient} blur-[120px] ${blob.className}`}
      />
    ))}

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(2,6,23,0.72)_68%,#020617_100%)]"
    />

    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 0.38, 0.16], scale: [0.6, 1.55, 1.12] }}
      transition={{ duration: 3.4, ease: "easeOut", times: [0, 0.45, 1] }}
      className={`absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${themeGradient} blur-[90px]`}
    />

    <div className="relative flex h-full w-full items-center justify-center">
      <BrandReveal
        userName={userName}
        themeGradient={themeGradient}
        delaySec={1.1}
      />
    </div>
  </div>
);
