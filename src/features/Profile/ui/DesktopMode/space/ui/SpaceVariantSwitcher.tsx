import { motion } from "framer-motion";
import { Tooltip } from "@shared/ui";
import { CONTROLS_FADE_TRANSITION, LOCK_TOOLTIP_Z_INDEX } from "../../model";
import { SPACE_SWITCHER_LABEL, SPACE_VARIANTS, type TSpaceVariant } from "../model";

interface IProps {
  value: TSpaceVariant;
  isVisible: boolean;
  onChange: (variant: TSpaceVariant) => void;
}

// Космос всегда ночной, поэтому панель только в тёмном оформлении.
const ACTIVE_CLASS = "bg-white/18 text-white";
const IDLE_CLASS = "text-white/55 hover:text-white/90 hover:bg-white/8";

export const SpaceVariantSwitcher = ({ value, isVisible, onChange }: IProps) => (
  <motion.div
    role="group"
    aria-label={SPACE_SWITCHER_LABEL}
    initial={false}
    animate={{ opacity: isVisible ? 1 : 0 }}
    transition={isVisible ? CONTROLS_FADE_TRANSITION.show : CONTROLS_FADE_TRANSITION.hide}
    className={`flex flex-wrap justify-center items-center gap-1 p-1 rounded-full backdrop-blur-2xl border bg-black/30 border-white/10 ${isVisible ? "" : "pointer-events-none"}`}
  >
    {SPACE_VARIANTS.map((option) => {
      const isActive = option.key === value;
      return (
        <Tooltip
          key={option.key}
          title={option.hint}
          placement="top"
          zIndex={LOCK_TOOLTIP_Z_INDEX}
          open={isVisible ? undefined : false}
        >
          <button
            type="button"
            onClick={() => onChange(option.key)}
            aria-label={`${option.label}: ${option.hint}`}
            aria-pressed={isActive}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-th-accent-400 ${isActive ? ACTIVE_CLASS : IDLE_CLASS}`}
          >
            {option.label}
          </button>
        </Tooltip>
      );
    })}
  </motion.div>
);
