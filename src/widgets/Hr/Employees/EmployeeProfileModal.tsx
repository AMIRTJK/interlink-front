import { useState } from "react";
import { motion } from "framer-motion";
import {
  X, Mail, Phone, Building2, Briefcase, Wallet, Pencil, Trash2, Copy,
  Info, Activity, FileText, TrendingUp, ClipboardList, Award, CalendarClock,
} from "lucide-react";
import { Popconfirm } from "antd";
import { IEmployee, money } from "./model";
import { Avatar, StatusChip } from "./parts";

interface IProps {
  employee: IEmployee;
  onClose: () => void;
  onEdit: (e: IEmployee) => void;
  onDelete: (id: number) => void;
  onDuplicate: (e: IEmployee) => void;
}

type TTab = "info" | "activity" | "docs";

// Карточка поля в просмотре
const Field = ({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent?: boolean;
}) => (
  <div className={`rounded-xl border p-3 flex items-start gap-3 ${
    accent ? "bg-indigo-50 border-indigo-100" : "border-slate-100"
  }`}>
    <div className="text-slate-400 mt-0.5">{icon}</div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-sm font-medium truncate ${accent ? "text-indigo-600" : "text-slate-700"}`}>
        {value || "—"}
      </p>
    </div>
  </div>
);

// Показатель в шапке
const Stat = ({ icon, value, label, color }: {
  icon: React.ReactNode; value: React.ReactNode; label: string; color: string;
}) => (
  <div className="text-center">
    <div className={`w-9 h-9 mx-auto rounded-xl flex items-center justify-center mb-1 ${color}`}>{icon}</div>
    <p className="text-lg font-bold text-slate-800 leading-none">{value}</p>
    <p className="text-[11px] text-slate-400 mt-0.5">{label}</p>
  </div>
);

const TABS: { key: TTab; label: string; icon: React.ReactNode }[] = [
  { key: "info", label: "Информация", icon: <Info size={14} /> },
  { key: "activity", label: "Активность", icon: <Activity size={14} /> },
  { key: "docs", label: "Документы", icon: <FileText size={14} /> },
];

// Просмотр сотрудника (bottom-sheet, выезжает снизу)
export const EmployeeProfileModal = ({ employee: e, onClose, onEdit, onDelete, onDuplicate }: IProps) => {
  const [tab, setTab] = useState<TTab>("info");
  const r = e.raw;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9998] bg-slate-900/40 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        onClick={(ev) => ev.stopPropagation()}
        className="bg-white w-full max-w-xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]"
      >
        <div className="mx-auto mt-2 mb-1 h-1.5 w-10 rounded-full bg-slate-200" />

        {/* Шапка */}
        <div className="px-5 pt-3 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <StatusChip status={e.status} />
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar e={e} size={64} />
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-800 truncate">{e.fullName}</p>
                <p className="text-sm text-indigo-500 truncate">{e.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Stat icon={<TrendingUp size={16} />} color="bg-blue-50 text-blue-600" value={r.projects_count ?? "—"} label="Проектов" />
              <Stat icon={<ClipboardList size={16} />} color="bg-emerald-50 text-emerald-600" value={r.tasks_count ?? "—"} label="Задач" />
              <Stat icon={<Award size={16} />} color="bg-amber-50 text-amber-600" value={r.awards_count ?? "—"} label="Наград" />
              <Stat icon={<CalendarClock size={16} />} color="bg-violet-50 text-violet-600" value={r.years ?? "—"} label="Лет" />
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="px-5 pt-3">
          <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className="px-5 py-4 overflow-auto">
          {tab === "info" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field icon={<Mail size={16} />} label="Email" value={r.personal_email || e.email} />
              <Field icon={<Phone size={16} />} label="Телефон" value={r.personal_phone || e.phone} />
              <Field icon={<Mail size={16} />} label="Корпоративный email" value={e.email} />
              <Field icon={<Phone size={16} />} label="Корпоративный телефон" value={e.phone} />
              <Field icon={<Building2 size={16} />} label="Отдел" value={e.department} />
              <Field icon={<Briefcase size={16} />} label="Должность" value={e.position} />
              <div className="sm:col-span-2">
                <Field icon={<Wallet size={16} />} label="Заработная плата" value={money(e.salary)} accent />
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-400">Раздел в разработке</div>
          )}
        </div>

        {/* Футер */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => onEdit(e)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Pencil size={15} /> Редактировать
          </button>
          <Popconfirm
            title="Удалить сотрудника?" okText="Удалить" cancelText="Отмена"
            okButtonProps={{ danger: true }} onConfirm={() => onDelete(e.id)}
          >
            <button className="p-2.5 rounded-xl text-rose-500 border border-rose-100 bg-rose-50 hover:bg-rose-100">
              <Trash2 size={16} />
            </button>
          </Popconfirm>
          <button
            onClick={() => onDuplicate(e)}
            className="p-2.5 rounded-xl text-slate-500 border border-slate-200 hover:bg-slate-50"
            title="Дублировать"
          >
            <Copy size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
