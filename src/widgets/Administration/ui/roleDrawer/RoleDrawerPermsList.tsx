import * as React from "react";
import { T, getRoleColor } from "../../theme/tokens";
import { ToggleSwitch } from "../components";
import type { PermModule } from "../../model";

interface IProps {
  perms: PermModule[];
  staggerGen: number;
  togglePerm: (mIdx: number, pIdx: number, spIdx: number) => void;
  toggleChildPerm: (
    mIdx: number,
    pIdx: number,
    cIdx: number,
    spIdx: number,
  ) => void;
  roleName: string;
  userCount: number;
  memberInitials: string[];
}

export function RoleDrawerPermsList({
  perms,
  staggerGen,
  togglePerm,
  toggleChildPerm,
  roleName,
  userCount,
  memberInitials,
}: IProps) {
  const roleCfg = getRoleColor(roleName);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        Права доступа
      </div>
      <div className="flex flex-col gap-2 mb-6">
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
                className={`bg-white dark:bg-slate-900/80 rounded-md px-3 py-2.5 border border-slate-200 dark:border-slate-700/80 ${
                  pIdx < mod.perms.length - 1 ? "mb-1.5" : ""
                }`}
              >
                {perm.label && (
                  <div className="text-[11px] font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {perm.label}
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
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
                {perm.children &&
                  perm.children.map((child, cIdx) => (
                    <div
                      key={`${child.label}-${staggerGen}`}
                      className="mt-2.5 ml-2 pl-2.5 border-l-2 border-slate-200 dark:border-slate-700"
                    >
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                        {child.label}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {child.subperms &&
                          child.subperms.map((csp, cspIdx) => (
                            <div
                              key={`${csp.label}-${staggerGen}`}
                              className="flex items-center justify-between gap-2"
                            >
                              <span
                                className={`text-[11px] ${
                                  csp.value
                                    ? "text-slate-900 dark:text-slate-100 font-medium"
                                    : "text-slate-400 dark:text-slate-500 font-normal"
                                }`}
                              >
                                {csp.label}
                              </span>
                              <ToggleSwitch
                                checked={csp.value}
                                onChange={() =>
                                  toggleChildPerm(mIdx, pIdx, cIdx, cspIdx)
                                }
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
        <span>Пользователи роли</span>
        <span
          style={{
            background: roleCfg.bg,
            color: roleCfg.text,
            borderRadius: 10,
            padding: "1px 8px",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "none",
            letterSpacing: 0,
          }}
        >
          {userCount}
        </span>
      </div>
      <div>
        {userCount === 0 ? (
          <div className="text-[13px] text-slate-500 dark:text-slate-400 py-1.5 pb-2.5 italic">
            Нет назначенных пользователей
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {memberInitials.map((initials, idx) => (
              <div
                key={`${initials}-${idx}`}
                title={initials}
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[9px] font-bold border border-white dark:border-slate-900 shrink-0"
                style={{
                  background: roleCfg.bg,
                  color: roleCfg.text,
                }}
              >
                {initials}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
