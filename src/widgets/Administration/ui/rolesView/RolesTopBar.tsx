import * as React from "react";
import { Plus, LayoutGrid, List, ShieldPlus } from "lucide-react";
import { T } from "../../theme/tokens";
import type { RolesViewMode } from "./rolesViewModel";

interface IProps {
  viewMode: RolesViewMode;
  onSwitchView: (mode: RolesViewMode) => void;
  onCreateUiPerm: () => void;
  onCreateRole: () => void;
}

export function RolesTopBar({
  viewMode,
  onSwitchView,
  onCreateUiPerm,
  onCreateRole,
}: IProps) {
  return (
    <div className="flex flex-wrap items-end justify-between mb-5 gap-4">
      <div>
        <h1
          className="m-0 text-xl font-bold tracking-tight text-slate-900 dark:text-white"
          style={{ fontFamily: T.font }}
        >
          Роли и доступы
        </h1>
        <p className="mt-0.5 mb-0 text-[13px] text-slate-500 dark:text-slate-400">
          Управление ролями пользователей СЭД
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSwitchView("block")}
            title="Блочный вид"
            aria-label="Блочный вид"
            className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all shrink-0 p-0 ${
              viewMode === "block"
                ? "border-0 bg-blue-500 text-white"
                : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onSwitchView("registry")}
            title="Реестровый вид"
            aria-label="Реестровый вид"
            className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all shrink-0 p-0 ${
              viewMode === "registry"
                ? "border-0 bg-blue-500 text-white"
                : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
            }`}
          >
            <List size={15} />
          </button>
        </div>
        <button
          onClick={onCreateUiPerm}
          className="flex items-center gap-1.5 px-4 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-colors"
          style={{ fontFamily: T.font }}
        >
          <ShieldPlus size={14} />
          <span>Создать UI-право</span>
        </button>
        <button
          onClick={onCreateRole}
          className="flex items-center gap-1.5 px-4 h-9 rounded-lg border-0 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold cursor-pointer whitespace-nowrap shadow-sm transition-colors"
          style={{ fontFamily: T.font }}
        >
          <Plus size={14} />
          <span>Создать роль</span>
        </button>
      </div>
    </div>
  );
}
