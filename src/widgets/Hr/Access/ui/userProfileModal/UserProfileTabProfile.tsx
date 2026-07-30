import { useMemo } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { ChevronDown } from "lucide-react";
import {
  ROLE_CHIP_STYLE_MAP,
  ROLE_DOT_COLOR_MAP,
  MODULE_TRANSLATIONS,
  ACTION_TRANSLATIONS,
} from "./userProfileModalModel";

interface IProps {
  selectedRoles: string[];
  availableRolesToAdd: { id: number; name: string }[];
  onAddRole: (roleName: string) => void;
  onRemoveRole: (roleName: string) => void;
  relevantPermissions: string[];
  paginatedAccessLevels: string[];
  effectivePermissions: string[];
  accessPage: number;
  onAccessPageChange: (fn: (p: number) => number) => void;
  ACCESS_PAGE_SIZE: number;
}

export function UserProfileTabProfile({
  selectedRoles,
  availableRolesToAdd,
  onAddRole,
  onRemoveRole,
  relevantPermissions,
  paginatedAccessLevels,
  effectivePermissions,
  accessPage,
  onAccessPageChange,
  ACCESS_PAGE_SIZE,
}: IProps) {
  const dropdownItems: MenuProps["items"] = useMemo(() => {
    return availableRolesToAdd.map((r) => ({
      key: r.name,
      label: (
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${ROLE_DOT_COLOR_MAP[r.name] || "bg-slate-400!"}`}
          />
          <span>{r.name}</span>
        </div>
      ),
      onClick: () => onAddRole(r.name),
    }));
  }, [availableRolesToAdd, onAddRole]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-center">
          <div className="text-2xl font-bold text-slate-800">142</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Документов</div>
        </div>
        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-center">
          <div className="text-2xl font-bold text-slate-800">38</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Поручений</div>
        </div>
        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 flex flex-col justify-center">
          <div className="text-2xl font-bold text-slate-800">3</div>
          <div className="text-xs text-slate-400 font-medium mt-1">Сессий</div>
        </div>
      </div>

      <div className="border border-slate-100 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Роли пользователя
        </h4>
        <div className="flex flex-wrap gap-2.5 items-center">
          {selectedRoles.length === 0 && (
            <span className="text-slate-400 text-xs font-semibold italic mr-2 select-none">
              Роли не назначены
            </span>
          )}
          {selectedRoles.map((role) => {
            const style = ROLE_CHIP_STYLE_MAP[role] || {
              border: "border-blue-100!",
              bg: "bg-blue-50/50!",
              text: "text-blue-600!",
            };
            return (
              <div
                key={role}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-medium border ${style.border} ${style.bg} ${style.text}`}
              >
                <span>{role}</span>
                <button
                  onClick={() => onRemoveRole(role)}
                  className="opacity-75 hover:opacity-100 font-bold ml-1 text-xs transition-opacity"
                >
                  &times;
                </button>
              </div>
            );
          })}
        </div>
        <div className="pt-1">
          <Dropdown
            menu={{ items: dropdownItems }}
            trigger={["click"]}
            disabled={availableRolesToAdd.length === 0}
          >
            <button
              type="button"
              className="px-3 py-1 border border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 rounded-xl text-sm text-slate-500 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50! disabled:cursor-not-allowed!"
            >
              <span>Добавить роль</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>
          </Dropdown>
        </div>
      </div>

      <div className="border border-slate-100 rounded-2xl p-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Уровни доступа
        </h4>
        {relevantPermissions.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              {paginatedAccessLevels.map((perm) => {
                const parts = perm.split(".");
                const mod = MODULE_TRANSLATIONS[parts[0]] || parts[0];
                const action =
                  ACTION_TRANSLATIONS[parts.slice(1).join(".")] ||
                  parts.slice(1).join(".");
                const hasPermission = effectivePermissions.includes(perm);
                return (
                  <div
                    key={perm}
                    className="flex items-center justify-between py-2 border-b border-slate-50/50"
                  >
                    <span className="text-xs text-slate-600 font-semibold">
                      {mod} — {action}
                    </span>
                    {hasPermission ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[10px] font-bold select-none">
                        Да
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px] font-bold select-none">
                        Нет
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {relevantPermissions.length > ACCESS_PAGE_SIZE && (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                <span className="text-xs text-slate-400 font-medium mr-auto">
                  {(accessPage - 1) * ACCESS_PAGE_SIZE + 1}–
                  {Math.min(
                    accessPage * ACCESS_PAGE_SIZE,
                    relevantPermissions.length,
                  )}{" "}
                  из {relevantPermissions.length} прав
                </span>
                <button
                  onClick={() => onAccessPageChange((p) => Math.max(1, p - 1))}
                  disabled={accessPage === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
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
                <span className="text-xs font-bold text-slate-600 min-w-[32px] text-center">
                  {accessPage} /{" "}
                  {Math.ceil(relevantPermissions.length / ACCESS_PAGE_SIZE)}
                </span>
                <button
                  onClick={() =>
                    onAccessPageChange((p) =>
                      Math.min(
                        Math.ceil(relevantPermissions.length / ACCESS_PAGE_SIZE),
                        p + 1,
                      ),
                    )
                  }
                  disabled={
                    accessPage >=
                    Math.ceil(relevantPermissions.length / ACCESS_PAGE_SIZE)
                  }
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
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
            )}
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center gap-1 text-slate-400 select-none">
            <span className="text-xs font-semibold text-slate-550">
              Уровни доступа не назначены
            </span>
            <span className="text-[10px] font-semibold opacity-75">
              Назначьте роль сотруднику для автоматической активации прав
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
