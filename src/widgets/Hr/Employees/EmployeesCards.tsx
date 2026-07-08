import { Pencil, Trash2, Copy, Mail, Phone, Wallet, Building2 } from "lucide-react";
import { IEmployee, money } from "./model";
import { Avatar, StatusChip } from "./parts";

interface IProps {
  items: IEmployee[];
  onEdit: (e: IEmployee) => void;
  onDelete: (id: number) => void;
  onDuplicate: (e: IEmployee) => void;
  onCardClick: (e: IEmployee) => void;
}

export const EmployeesCards = ({ items, onEdit, onDelete, onDuplicate, onCardClick }: IProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((e) => (
        <div
          key={e.id}
          onClick={() => onCardClick(e)}
          className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Avatar e={e} size={44} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800 truncate">{e.fullName}</p>
              <p className="text-xs text-blue-500 truncate">{e.position}</p>
              <div className="mt-1.5">
                <StatusChip status={e.status} />
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <Building2 size={14} className="text-slate-400" /> {e.department}
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" /> {e.email || "—"}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400" /> {e.phone || "—"}
            </p>
            <p className="flex items-center gap-2 font-semibold text-slate-800">
              <Wallet size={14} className="text-slate-400" /> {money(e.salary)}
            </p>
          </div>
          <div
            className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3"
            onClick={(ev) => ev.stopPropagation()}
          >
            <button
              onClick={() => onEdit(e)}
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
            >
              <Pencil size={14} /> Изменить
            </button>
            <button
              onClick={() => onDelete(e.id)}
              className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600"
            >
              <Trash2 size={14} /> Удалить
            </button>
            <button
              onClick={() => onDuplicate(e)}
              className="ml-auto p-1 text-slate-400 hover:text-slate-600"
              title="Дублировать"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
