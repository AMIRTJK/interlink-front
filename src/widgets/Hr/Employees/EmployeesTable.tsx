import { Pencil, Trash2 } from "lucide-react";
import { Popconfirm } from "antd";
import { IEmployee, money } from "./model";
import { Avatar, StatusChip } from "./parts";

interface IProps {
  items: IEmployee[];
  onEdit: (e: IEmployee) => void;
  onDelete: (id: number) => void;
}

// Табличный вид списка сотрудников
export const EmployeesTable = ({ items, onEdit, onDelete }: IProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <th className="text-left font-semibold px-4 py-3">Сотрудник</th>
            <th className="text-left font-semibold px-4 py-3">Отдел</th>
            <th className="text-left font-semibold px-4 py-3">Статус</th>
            <th className="text-left font-semibold px-4 py-3">Email</th>
            <th className="text-left font-semibold px-4 py-3">Телефон</th>
            <th className="text-left font-semibold px-4 py-3">Оклад</th>
            <th className="text-right font-semibold px-4 py-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr
              key={e.id}
              className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar e={e} size={36} />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{e.fullName}</p>
                    <p className="text-xs text-slate-400 truncate">{e.position}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600">{e.department}</td>
              <td className="px-4 py-3">
                <StatusChip status={e.status} />
              </td>
              <td className="px-4 py-3 text-slate-600">{e.email || "—"}</td>
              <td className="px-4 py-3 text-slate-600">{e.phone || "—"}</td>
              <td className="px-4 py-3 font-semibold text-slate-800">{money(e.salary)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(e)}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50"
                    title="Изменить"
                  >
                    <Pencil size={15} />
                  </button>
                  <Popconfirm
                    title="Удалить сотрудника?"
                    okText="Удалить"
                    cancelText="Отмена"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => onDelete(e.id)}
                  >
                    <button className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50" title="Удалить">
                      <Trash2 size={15} />
                    </button>
                  </Popconfirm>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
