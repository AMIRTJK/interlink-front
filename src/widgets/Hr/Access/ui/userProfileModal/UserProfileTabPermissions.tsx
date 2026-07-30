import { Switch } from "antd";
import { MODULE_TRANSLATIONS } from "./userProfileModalModel";

interface IProps {
  roleGrantedPermissions: string[];
  directPermissionsState: string[];
  deniedPermissionsState: string[];
  onToggleDirect: (permName: string) => void;
  onToggleDenied: (permName: string) => void;
  onResetToStandard: () => void;
  groupedPermissions: Record<string, { label: string; name: string }[]>;
  paginatedGroupEntries: [string, { label: string; name: string }[]][];
  permissionsPage: number;
  onPermissionsPageChange: (fn: (p: number) => number) => void;
  PAGE_SIZE: number;
}

export function UserProfileTabPermissions({
  roleGrantedPermissions,
  directPermissionsState,
  deniedPermissionsState,
  onToggleDirect,
  onToggleDenied,
  onResetToStandard,
  groupedPermissions,
  paginatedGroupEntries,
  permissionsPage,
  onPermissionsPageChange,
  PAGE_SIZE,
}: IProps) {
  const totalModules = Object.keys(groupedPermissions).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pl-1 gap-4">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          Права из роли отмечены меткой «Роль» — их можно только запретить лично
          этому пользователю. Остальные права можно выдать напрямую.
        </p>
        <button
          onClick={onResetToStandard}
          className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          Сбросить к стандартным
        </button>
      </div>
      <div className="space-y-5">
        {paginatedGroupEntries.map(([moduleName, actions]) => (
          <div key={moduleName} className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">
              {MODULE_TRANSLATIONS[moduleName] || moduleName}
            </h4>
            <div className="bg-slate-50/40! border border-slate-100! rounded-2xl! p-4! flex! flex-col! gap-2.5!">
              {actions.map((act) => {
                const inRole = roleGrantedPermissions.includes(act.name);
                const isDenied = deniedPermissionsState.includes(act.name);
                const isDirect = directPermissionsState.includes(act.name);
                const isEffective = inRole ? !isDenied : isDirect;
                return (
                  <div
                    key={act.name}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-slate-600 truncate">
                        {act.label}
                      </span>
                      {inRole && (
                        <span
                          className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide select-none ${
                            isDenied
                              ? "bg-rose-50 text-rose-500"
                              : "bg-blue-50 text-blue-500"
                          }`}
                        >
                          Роль
                        </span>
                      )}
                      {!inRole && isDirect && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded bg-violet-50 text-violet-500 text-[9px] font-bold uppercase tracking-wide select-none">
                          Выдано лично
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold select-none ${
                          isEffective
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isEffective ? "Да" : "Нет"}
                      </span>
                      {inRole ? (
                        <Switch
                          checked={!isDenied}
                          onChange={() => onToggleDenied(act.name)}
                        />
                      ) : (
                        <Switch
                          checked={isDirect}
                          onChange={() => onToggleDirect(act.name)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {totalModules > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
          <span className="text-xs text-slate-400 font-medium mr-auto">
            {(permissionsPage - 1) * PAGE_SIZE + 1}–
            {Math.min(permissionsPage * PAGE_SIZE, totalModules)} из{" "}
            {totalModules} модулей
          </span>
          <button
            onClick={() => onPermissionsPageChange((p) => Math.max(1, p - 1))}
            disabled={permissionsPage === 1}
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
            {permissionsPage} / {Math.ceil(totalModules / PAGE_SIZE)}
          </span>
          <button
            onClick={() =>
              onPermissionsPageChange((p) =>
                Math.min(Math.ceil(totalModules / PAGE_SIZE), p + 1),
              )
            }
            disabled={permissionsPage >= Math.ceil(totalModules / PAGE_SIZE)}
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
    </div>
  );
}
