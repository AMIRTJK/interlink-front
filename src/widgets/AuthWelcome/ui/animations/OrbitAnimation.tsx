import { motion } from "framer-motion";
import { BarChart2, ClipboardList, Mail, Users } from "lucide-react";
import { IWelcomeAnimationProps, MODULE_LABELS } from "../../model";
import { BrandReveal } from "../parts/BrandReveal";
import { ProgressRing } from "../parts/ProgressRing";

const ORBIT_SIZES = [
  "h-[300px] w-[300px]",
  "h-[400px] w-[400px]",
  "h-[500px] w-[500px]",
  "h-[600px] w-[600px]",
];

const SATELLITES = [
  {
    icon: Mail,
    offset: "-translate-y-[calc(50%+150px)]",
    from: 0,
    spin: 16,
  },
  {
    icon: ClipboardList,
    offset: "-translate-y-[calc(50%+200px)]",
    from: 95,
    spin: 20,
  },
  {
    icon: Users,
    offset: "-translate-y-[calc(50%+250px)]",
    from: 195,
    spin: 24,
  },
  {
    icon: BarChart2,
    offset: "-translate-y-[calc(50%+300px)]",
    from: 285,
    spin: 28,
  },
];

const POP_EASE = [0.34, 1.56, 0.64, 1] as const;

export const OrbitAnimation = ({
  userName,
  themeGradient,
  accentColor,
  progress,
}: IWelcomeAnimationProps) => (
  <div className="absolute inset-0 overflow-hidden">
    <div
      className={`absolute top-1/2 left-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br ${themeGradient} opacity-20 blur-[130px]`}
    />

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.9, 1, 1, 1.08] }}
      transition={{ duration: 5, times: [0, 0.12, 0.7, 0.92], ease: "easeInOut" }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative h-[620px] w-[620px] scale-[0.5] sm:scale-[0.8] lg:scale-100">
        {ORBIT_SIZES.map((size, index) => (
          <motion.div
            key={size}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 0.18, scale: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.15 + index * 0.12,
              ease: "easeOut",
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white ${size}`}
          />
        ))}

        {SATELLITES.map((satellite, index) => {
          const Icon = satellite.icon;
          const spinTransition = {
            duration: satellite.spin,
            ease: "linear" as const,
            repeat: Infinity,
          };

          return (
            <motion.div
              key={MODULE_LABELS[index]}
              initial={{ rotate: satellite.from }}
              animate={{ rotate: satellite.from + 360 }}
              transition={spinTransition}
              className="absolute inset-0"
            >
              <div
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 ${satellite.offset}`}
              >
                <motion.div
                  initial={{ rotate: -satellite.from, opacity: 0, scale: 0 }}
                  animate={{
                    rotate: -(satellite.from + 360),
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    rotate: spinTransition,
                    opacity: { duration: 0.6, delay: 0.5 + index * 0.16 },
                    scale: {
                      duration: 0.6,
                      delay: 0.5 + index * 0.16,
                      ease: POP_EASE,
                    },
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
                    <Icon className="h-5 w-5 text-white/85" />
                  </div>
                  <span className="text-[10px] font-semibold tracking-[0.18em] whitespace-nowrap text-white/60 uppercase">
                    {MODULE_LABELS[index]}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}

        <div className="absolute top-1/2 left-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2">
          <ProgressRing progress={progress} accentColor={accentColor} />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-gradient-to-br ${themeGradient} shadow-[0_0_60px_rgba(255,255,255,0.15)]`}
          />
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0, 1] }}
      transition={{ duration: 4.7, times: [0, 0.82, 1], ease: "easeOut" }}
      className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.4)_0%,#020617_72%)]"
    />

    <div className="relative flex h-full w-full items-center justify-center">
      <BrandReveal
        userName={userName}
        themeGradient={themeGradient}
        delaySec={4.2}
      />
    </div>
  </div>
);
