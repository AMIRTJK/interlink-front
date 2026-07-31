import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const SHRED_STRIP_COUNT = 12;
const SHRED_ROTATIONS = Array.from(
  { length: SHRED_STRIP_COUNT },
  (_, i) => (i % 2 === 0 ? 1 : -1) * (3 + ((i * 7) % 9)),
);
const SHRED_HEIGHTS = Array.from(
  { length: SHRED_STRIP_COUNT },
  (_, i) => 32 + ((i * 13) % 24),
);

interface PaperShredderProps {
  onComplete: () => void;
  isDark: boolean;
}

export const PaperShredder: React.FC<PaperShredderProps> = ({
  onComplete,
}) => {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timer = setTimeout(() => onCompleteRef.current(), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full h-5 rounded-t-lg flex items-center justify-center gap-px bg-white/20">
        {Array.from({ length: SHRED_STRIP_COUNT }, (_, i) => (
          <div
            key={`tooth-${i}`}
            className="w-2 h-3 rounded-b-sm bg-white/30"
          />
        ))}
      </div>
      <div
        className="flex items-start justify-center gap-px overflow-hidden"
        style={{
          height: "48px",
          width: "100%",
        }}
      >
        {Array.from({ length: SHRED_STRIP_COUNT }, (_, i) => (
          <motion.div
            key={`strip-${i}`}
            initial={{
              y: -48,
              scaleY: 0,
              opacity: 1,
            }}
            animate={{
              y: [0, 20, 60],
              scaleY: [0.2, 1, 0.6],
              opacity: [1, 1, 0],
              rotate: SHRED_ROTATIONS[i],
            }}
            transition={{
              duration: 0.9,
              delay: i * 0.05,
              ease: [0.4, 0, 0.6, 1],
            }}
            className="flex-1 rounded-b-sm bg-gradient-to-b from-violet-400/60 to-fuchsia-400/40"
            style={{
              height: `${SHRED_HEIGHTS[i]}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
