import { Tooltip } from "@shared/ui";
import { LOCK_TOOLTIP_Z_INDEX } from "../../model";
import { WATCH_SWITCHER_LABEL, WATCH_VARIANTS, type TWatchVariant } from "../model";
import { WATCH_SPECS } from "../specs";

interface IProps {
  value: TWatchVariant;
  isDark: boolean;
  onChange: (variant: TWatchVariant) => void;
}

const CHIP_TONES = {
  dark: {
    active: "bg-white/18 text-white",
    idle: "text-white/55 hover:text-white/90 hover:bg-white/8",
  },
  light: {
    active: "bg-slate-900/8 text-slate-900",
    idle: "text-slate-600 hover:text-slate-900 hover:bg-black/5",
  },
} as const;

export const WatchVariantSwitcher = ({ value, isDark, onChange }: IProps) => (
  <div
    role="group"
    aria-label={WATCH_SWITCHER_LABEL}
    className={`flex flex-wrap justify-center items-center gap-1 p-1 rounded-full backdrop-blur-2xl border ${isDark ? "bg-black/30 border-white/10" : "bg-white/55 border-black/8"}`}
  >
    {WATCH_VARIANTS.map((option) => {
      const spec = WATCH_SPECS[option.key];
      const isActive = option.key === value;
      const palette = isDark ? CHIP_TONES.dark : CHIP_TONES.light;
      const tone = isActive ? palette.active : palette.idle;
      return (
        <Tooltip key={option.key} title={option.hint} placement="top" zIndex={LOCK_TOOLTIP_Z_INDEX}>
          <button
            type="button"
            onClick={() => onChange(option.key)}
            aria-label={`${option.label}: ${option.hint}`}
            aria-pressed={isActive}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide transition-colors duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-400 ${tone}`}
          >
            <span
              aria-hidden="true"
              className="w-3.5 h-3.5 rounded-full border-2 shrink-0"
              style={{ background: spec.dial.center, borderColor: spec.metal.mid }}
            />
            {option.label}
          </button>
        </Tooltip>
      );
    })}
  </div>
);
