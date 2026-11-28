import * as React from "react";
import { Check } from "lucide-react";
import { T } from "../../theme/tokens";

interface IProps {
  onSave: () => void;
  isDisabled: boolean;
}

export function UserDrawerFooter({ onSave, isDisabled }: IProps) {
  return (
    <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0 bg-white dark:bg-slate-900">
      <button
        onClick={onSave}
        disabled={isDisabled}
        className="flex-1 px-3.5 h-9 rounded-lg border-0 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
        style={{ fontFamily: T.font }}
      >
        <Check size={13} />
        <span>Сохранить</span>
      </button>
    </div>
  );
}
