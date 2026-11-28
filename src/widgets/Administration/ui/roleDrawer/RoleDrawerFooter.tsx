import * as React from "react";
import { Check, LogOut } from "lucide-react";
import { T } from "../../theme/tokens";

interface IProps {
  onSave: () => void;
  isPending: boolean;
  onDeleteRequest: () => void;
}

export function RoleDrawerFooter({
  onSave,
  isPending,
  onDeleteRequest,
}: IProps) {
  return (
    <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex gap-2 shrink-0 bg-white dark:bg-slate-900">
      <button
        onClick={onSave}
        disabled={isPending}
        className="flex-1 px-3.5 h-9 rounded-lg border-0 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-colors disabled:opacity-70"
        style={{ fontFamily: T.font }}
      >
        <Check size={13} />
        <span>Сохранить</span>
      </button>
      <button
        onClick={onDeleteRequest}
        className="px-3 h-9 rounded-lg border-[1.5px] border-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap transition-colors"
        style={{ fontFamily: T.font }}
      >
        <LogOut size={13} />
        <span>Удалить</span>
      </button>
    </div>
  );
}
