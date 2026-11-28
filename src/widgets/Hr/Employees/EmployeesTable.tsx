import { Copy, Pencil, Trash2 } from "lucide-react";
import { IEmployee, copyLogin, money, statusMeta } from "./model";
import { Avatar } from "./parts";

interface IProps {
  items: IEmployee[];
  onEdit: (e: IEmployee) => void;
  onDelete: (id: number) => void;
  onRowClick: (e: IEmployee) => void;
}

const REGISTRY_STATUS_STYLE: Record<string, { chip: string; dot: string }> = {
  active: { chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-400", dot: "bg-emerald-500" },
  vacation: { chip: "bg-red-100 text-red-700 dark:bg-red-900/35 dark:text-red-400", dot: "bg-red-500" },
  business_trip: { chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-400", dot: "bg-amber-500" },
};

const RegistryStatusChip = ({ status }: { status: string }) => {
  const s = REGISTRY_STATUS_STYLE[status] || { chip: "bg-gray-100 text-gray-500 dark:bg-th-high dark:text-slate-400", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {statusMeta(status).label}
    </span>
  );
};

export const EmployeesTable = ({ items, onEdit, onDelete, onRowClick }: IProps) => {
  return (
    <div className="ui-glass rounded-2xl border overflow-hidden bg-white border-gray-200 dark:bg-th-raised dark:border-th-high">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider bg-gray-50 text-gray-400 border-b border-gray-100 dark:bg-th-base dark:border-th-high">
              <th className="px-4 py-3 font-semibold">Сотрудник</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Должность</th>
              <th className="px-4 py-3 font-semibold hidden md:table-cell">Отдел</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Статус</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Email</th>
              <th className="px-4 py-3 font-semibold hidden lg:table-cell">Логин</th>
              <th className="px-4 py-3 font-semibold text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr
                key={e.id}
                onClick={() => onRowClick(e)}
                className="border-b last:border-b-0 transition-colors cursor-pointer border-gray-100 hover:bg-th-accent-50/30 dark:border-th-high"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar e={e} size={44} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate dark:text-slate-100">{e.nameMain}</p>
                      {e.middleName && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate dark:text-slate-400">{e.middleName}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-500 max-w-[160px] dark:text-slate-400">
                  <span className="truncate block">{e.position}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs font-medium text-gray-600 dark:text-slate-300">
                  {e.department}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <RegistryStatusChip status={e.status} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600 max-w-[180px] dark:text-slate-300">
                  <span className="truncate block">{e.email || "—"}</span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600 dark:text-slate-300">
                  {e.raw.phone ? (
                    <div className="inline-flex items-center gap-1.5 group/login">
                      <span className="truncate">{e.raw.phone}</span>
                      <button
                        type="button"
                        onClick={(ev) => copyLogin(e.raw.phone, ev)}
                        className="p-1 rounded-md text-gray-400 hover:text-th-accent-600 hover:bg-th-accent-50 transition-colors shrink-0 cursor-pointer"
                        title="Копировать логин"
                        aria-label="Копировать логин"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3" onClick={(ev) => ev.stopPropagation()}>
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => onEdit(e)}
                      className="p-1.5 rounded-lg transition-colors text-th-accent-600 hover:bg-th-accent-50"
                      title="Изменить"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="p-1.5 rounded-lg transition-colors text-red-500 hover:bg-red-50"
                      title="Удалить"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
