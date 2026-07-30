import React from "react";
import { Switch } from "antd";
import { If, Loader } from "@shared/ui";
import { MODULE_TRANSLATIONS } from "../rolePermissionsSidebar/rolePermissionsSidebarModel";

interface IProps {
  isDataLoading: boolean;
  filteredGroups: Record<string, { label: string; name: string }[]>;
  paginatedGroups: [string, { label: string; name: string }[]][];
  sidebarPage: number;
  totalSidebarPages: number;
  roleGrantedPermissions: string[];
  deniedPermissionsState: string[];
  directPermissionsState: string[];
  onToggleDenied: (name: string) => void;
  onToggleDirect: (name: string) => void;
  onPageChange: (page: number) => void;
}

export function UserPermissionsGroupList({
  isDataLoading,
  filteredGroups,
  paginatedGroups,
  sidebarPage,
  totalSidebarPages,
  roleGrantedPermissions,
  deniedPermissionsState,
  directPermissionsState,
  onToggleDenied,
  onToggleDirect,
  onPageChange,
}: IProps) {
  const hasGroups = Object.keys(filteredGroups).length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 pt-2 relative">
      <If is={isDataLoading}>
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
          <Loader />
        </div>
      </If>
      <div className="flex items-center justify-between pl-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
          {"ПРАВА ПОЛЬЗОВАТЕЛЯ"}
        </p>
        {hasGroups && (
          <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100/60">
            {sidebarPage} / {totalSidebarPages || 1}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {paginatedGroups.map(([moduleName, actions]) => (
          <div
            key={moduleName}
            className="border border-slate-50 rounded-xl p-3 bg-slate-50/20 space-y-2.5"
          >
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-0.5 leading-none">
              {MODULE_TRANSLATIONS[moduleName] || moduleName}
            </h5>
            <div className="space-y-2">
              {actions?.map((act) => {
                const inRole = roleGrantedPermissions.includes(act.name);
                const isDenied = deniedPermissionsState.includes(act.name);
                const isDirect = directPermissionsState.includes(act.name);
                const checked = inRole ? !isDenied : isDirect;
                return (
                  <div
                    key={act.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-600">
                      {act.label}
                    </span>
                    <Switch
                      size="small"
                      checked={checked}
                      onChange={() =>
                        inRole
                          ? onToggleDenied(act.name)
                          : onToggleDirect(act.name)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {!hasGroups && (
          <div className="text-center py-6 text-xs text-slate-400 font-medium">
            Ничего не найдено
          </div>
        )}
      </div>

      {totalSidebarPages > 1 && (() => {
        const pagesList: number[] = [];
        const pageLimit = 4;
        let start = Math.max(1, sidebarPage - 1);
        let end = Math.min(totalSidebarPages, start + pageLimit - 1);
        if (end - start + 1 < pageLimit) {
          start = Math.max(1, end - pageLimit + 1);
        }
        for (let i = start; i <= end; i++) {
          pagesList.push(i);
        }

        return (
          <div className="flex justify-center pt-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, sidebarPage - 1))}
                disabled={sidebarPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              {pagesList.map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    sidebarPage === p
                      ? "bg-blue-600 text-white border border-blue-600 shadow-sm"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() =>
                  onPageChange(Math.min(totalSidebarPages, sidebarPage + 1))
                }
                disabled={sidebarPage === totalSidebarPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
