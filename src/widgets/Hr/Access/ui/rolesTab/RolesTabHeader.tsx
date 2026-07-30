import React from "react";
import { LayoutGrid, List, ShieldPlus, Plus } from "lucide-react";

interface IProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenCreateUiPerm: () => void;
  onOpenCreateRole: () => void;
}

export function RolesTabHeader({
  viewMode,
  onViewModeChange,
  onOpenCreateUiPerm,
  onOpenCreateRole,
}: IProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-xl font-bold text-slate-800 leading-tight">
          {"Роли и доступы"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {"Управление ролями пользователей СЭД"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer select-none outline-none! ${
              viewMode === "grid"
                ? "bg-white text-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer select-none outline-none! ${
              viewMode === "list"
                ? "bg-white text-slate-700 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <List size={15} />
          </button>
        </div>
        <button
          onClick={onOpenCreateUiPerm}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <ShieldPlus size={14} />
          <span>{"Создать UI-право"}</span>
        </button>
        <button
          onClick={onOpenCreateRole}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={14} />
          <span>{"Создать роль"}</span>
        </button>
      </div>
    </div>
  );
}
