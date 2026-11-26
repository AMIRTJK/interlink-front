import { X } from "lucide-react";
import { LOCK_TEXTS } from "../lockModel";

interface IProps {
  isDark: boolean;
  onHide: () => void;
}

export const HideFormButton = ({ isDark, onHide }: IProps) => (
  <button
    type="button"
    onClick={onHide}
    aria-label={LOCK_TEXTS.hideForm}
    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-indigo-400 ${isDark ? "text-white/45 hover:text-white/90 hover:bg-white/10" : "text-slate-400 hover:text-slate-700 hover:bg-black/5"}`}
  >
    <X size={16} />
  </button>
);
