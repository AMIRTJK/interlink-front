import React from "react";
import { X } from "lucide-react";

interface IProps {
  roleName: string;
  initials: string;
  colors: { bg: string };
  onClose: () => void;
}

export function RolePermissionsHeader({
  roleName,
  initials,
  colors,
  onClose,
}: IProps) {
  return (
    <div className="p-5 border-b border-slate-50 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${colors.bg}`}
        >
          {initials || "РД"}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm leading-tight">
            {roleName}
          </h4>
          <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
            {roleName}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
