import * as React from "react";
import { X } from "lucide-react";
import { T, getRoleColor } from "../../theme/tokens";
import type { RoleCard } from "../../model";

interface IProps {
  role: RoleCard;
  onClose: () => void;
}

export function RoleDrawerHeader({ role, onClose }: IProps) {
  const roleName = role.name;
  const roleCfg = getRoleColor(roleName);

  return (
    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: roleCfg.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 700,
              color: roleCfg.text,
              flexShrink: 0,
              border: `1px solid ${roleCfg.text}25`,
            }}
          >
            {roleName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {roleName}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {role.description}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="bg-transparent border-0 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 p-1 rounded-md flex shrink-0"
      >
        <X size={15} />
      </button>
    </div>
  );
}
