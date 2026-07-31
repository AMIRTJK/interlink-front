import React from "react";
import { Check } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";
import { ActionUser, initialsOf } from "./incomingViewModel";

interface IProps {
  label: string;
  users: ActionUser[];
  accent: { avatar: string; date: string };
}

export const UserActionCluster: React.FC<IProps> = ({
  label,
  users,
  accent,
}) => {
  if (!users || users.length === 0) return null;
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-default">
        <div className="flex -space-x-2">
          {users.slice(0, 3).map((au) => {
            const u = au.user || {};
            return (
              <span
                key={au.id || u.id}
                title={u.full_name || "Без имени"}
                className={cn(
                  "w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white",
                  accent.avatar
                )}
              >
                {initialsOf(u.full_name)}
              </span>
            );
          })}
        </div>
        <span>
          {label}: {users.length}
        </span>
      </button>
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[1000] max-h-80 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label} ({users.length})
        </div>
        <div className="space-y-1">
          {users.map((au) => {
            const u = au.user || {};
            const when = au.action_at || au.acknowledged_at;
            const isAck = Boolean(when);
            return (
              <div
                key={au.id || u.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
                  isAck
                    ? "bg-emerald-50/70 border border-emerald-100/80"
                    : "hover:bg-slate-50"
                )}
              >
                <div className="relative flex-shrink-0">
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full text-white text-[11px] font-bold flex items-center justify-center",
                      accent.avatar
                    )}
                  >
                    {initialsOf(u.full_name)}
                  </span>
                  <If is={isAck}>
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center border border-white">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  </If>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {u.full_name || "Без имени"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {u.position || "Сотрудник"}
                  </p>
                </div>
                <If is={isAck}>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                      Ознакомлен
                    </span>
                    <If is={Boolean(when)}>
                      <span
                        className={cn(
                          "text-[9px] font-medium mt-0.5",
                          accent.date
                        )}
                      >
                        {when ? new Date(when).toLocaleDateString("ru-RU") : ""}
                      </span>
                    </If>
                  </div>
                </If>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
