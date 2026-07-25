import { motion } from "framer-motion";

interface IProps {
  progress: number;
  accentColor: string;
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing = ({
  progress,
  accentColor,
  size = 220,
  strokeWidth = 2,
}: IProps) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={accentColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </svg>
  );
};
