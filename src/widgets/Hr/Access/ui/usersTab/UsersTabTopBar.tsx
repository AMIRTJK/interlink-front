import React from "react";
import { Plus } from "lucide-react";

interface IProps {
  onOpenCreate: () => void;
}

export function UsersTabTopBar({ onOpenCreate }: IProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Пользователи</h2>
        <p className="text-sm text-slate-400 font-medium">
          Управление сотрудниками и доступами
        </p>
      </div>
      <button
        onClick={onOpenCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-th-accent-600 hover:bg-th-accent-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
      >
        <Plus size={16} />
        <span>Добавить</span>
      </button>
    </div>
  );
}
