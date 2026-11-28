import * as React from "react";
import { T } from "../../theme/tokens";
import { ToggleSwitch } from "../components";
import type { PermModule } from "../../model";

interface IProps {
  isLoading: boolean;
  perms: PermModule[] | null;
  staggerGen: number;
  togglePerm: (mIdx: number, pIdx: number, spIdx: number) => void;
}

export function UserDrawerPermsList({
  isLoading,
  perms,
  staggerGen,
  togglePerm,
}: IProps) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Права пользователя
      </div>
      {isLoading || !perms ? (
        <div className="text-[13px] text-slate-500 dark:text-slate-400 py-1.5">
          Загрузка...
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {perms.map((mod, mIdx) => (
            <div
              key={`${mod.module}-${staggerGen}`}
              className="bg-slate-50 dark:bg-slate-800/70 rounded-lg px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/80"
              style={{
                animation: `permRowIn 200ms ease-out ${mIdx * 40}ms both`,
              }}
            >
              <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100 mb-2.5 uppercase tracking-wide">
                {mod.module}
              </div>
              {mod.perms.map((perm, pIdx) => (
                <div
                  key={`${perm.label}-${pIdx}-${staggerGen}`}
                  className="flex flex-col gap-1.5"
                >
                  {perm.subperms &&
                    perm.subperms.map((sp, spIdx) => (
                      <div
                        key={`${sp.label}-${staggerGen}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span
                          className={`text-xs ${
                            sp.value
                              ? "text-slate-900 dark:text-slate-100 font-medium"
                              : "text-slate-400 dark:text-slate-500 font-normal"
                          }`}
                        >
                          {sp.label}
                        </span>
                        <ToggleSwitch
                          checked={sp.value}
                          onChange={() => togglePerm(mIdx, pIdx, spIdx)}
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
