import React from "react";
import { motion } from "framer-motion";
import { ROLE_CHIP_STYLE_MAP } from "./usersTabModel";

interface IProps {
  selectedQuickRole: string;
  onQuickRoleChange: (role: string) => void;
  roles: string[];
}

export function UsersTabRoleChips({
  selectedQuickRole,
  onQuickRoleChange,
  roles,
}: IProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1 relative z-1">
      <button
        onClick={() => onQuickRoleChange("all")}
        className={`relative px-3 py-1.5 border rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer select-none outline-none! ${
          selectedQuickRole === "all"
            ? "border-blue-600 text-blue-600"
            : "border-slate-200 text-slate-500 hover:bg-slate-50"
        }`}
      >
        {selectedQuickRole === "all" && (
          <motion.div
            layoutId="activeQuickRolePill"
            className="absolute inset-0 bg-blue-50/50 -z-10 rounded-xl"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span className="relative z-10">Все</span>
      </button>
      {roles.map((role) => {
        const isSelected = selectedQuickRole === role;
        const activeStyle = ROLE_CHIP_STYLE_MAP[role] || {
          border: "border-blue-400!",
          bg: "bg-blue-50/50!",
          text: "text-blue-600!",
          dot: "bg-blue-500!",
        };

        return (
          <button
            key={role}
            onClick={() => onQuickRoleChange(role)}
            className={`relative px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors duration-200 cursor-pointer select-none outline-none! ${
              isSelected
                ? `${activeStyle.border} ${activeStyle.text}`
                : "border-slate-200 text-slate-500 hover:bg-slate-50"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="activeQuickRolePill"
                className={`absolute inset-0 -z-10 rounded-xl ${activeStyle.bg}`}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                isSelected
                  ? `${activeStyle.dot} opacity-100 scale-100`
                  : "bg-slate-400 opacity-0 scale-50"
              }`}
            />
            <span className="relative z-10">{role}</span>
          </button>
        );
      })}
    </div>
  );
}
