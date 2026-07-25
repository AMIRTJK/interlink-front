import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { WELCOME_SKIP_DELAY_MS } from "@shared/config";
import { If } from "@shared/ui";

interface IProps {
  onSkip: () => void;
}

export const SkipButton = ({ onSkip }: IProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIsVisible(true),
      WELCOME_SKIP_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <If is={isVisible}>
      <motion.button
        type="button"
        onClick={onSkip}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute bottom-8 right-8 z-30 flex cursor-pointer items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold tracking-wider text-white/60 uppercase backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        Пропустить
        <ChevronRight className="h-3.5 w-3.5" />
      </motion.button>
    </If>
  );
};
