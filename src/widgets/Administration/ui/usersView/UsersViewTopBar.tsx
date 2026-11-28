import * as React from "react";
import { Plus } from "lucide-react";
import { T } from "../../theme/tokens";

interface IProps {
  onOpenAdd: () => void;
}

export function UsersViewTopBar({ onOpenAdd }: IProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1
          className="m-0 text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          style={{ fontFamily: T.font }}
        >
          Пользователи
        </h1>
        <p className="mt-0.5 mb-0 text-[13px] text-slate-500 dark:text-slate-400">
          Управление сотрудниками и доступами
        </p>
      </div>
      <button
        onClick={onOpenAdd}
        className="flex items-center gap-1.5 px-4 h-9 rounded-lg border-0 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap shadow-sm transition-colors"
        style={{ fontFamily: T.font }}
      >
        <Plus size={14} />
        <span>Добавить</span>
      </button>
    </div>
  );
}
