import { useMemo, useState } from "react";
import {
  BarChart3,
  X,
  FileSpreadsheet,
  Loader2,
  Users,
  TrendingUp,
  Wallet,
  Building2,
} from "lucide-react";
import { IEmployee, money } from "./model";

interface IProps {
  employees: IEmployee[];
  onClose: () => void;
  onExport: () => Promise<void> | void;
}

// Карточка показателя
const StatCard = ({
  icon,
  color,
  value,
  label,
}: {
  icon: React.ReactNode;
  color: string;
  value: React.ReactNode;
  label: string;
}) => (
  <div className="border border-slate-100 rounded-xl p-3 dark:border-th-high">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>{icon}</div>
    <p className="text-lg font-bold text-slate-800 leading-tight dark:text-slate-100">{value}</p>
    <p className="text-xs text-slate-400">{label}</p>
  </div>
);

// Модалка аналитики персонала
export const EmployeesAnalyticsModal = ({ employees, onClose, onExport }: IProps) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  const a = useMemo(() => {
    const byStatus: Record<string, number> = {};
    const byDept: Record<string, number> = {};
    let payroll = 0;
    let salaryCount = 0;
    employees.forEach((e) => {
      byStatus[e.status || "—"] = (byStatus[e.status || "—"] || 0) + 1;
      byDept[e.department] = (byDept[e.department] || 0) + 1;
      if (e.salary != null) {
        payroll += e.salary;
        salaryCount++;
      }
    });
    return {
      total: employees.length,
      active: byStatus["active"] || 0,
      avgSalary: salaryCount ? Math.round(payroll / salaryCount) : 0,
      deptCount: Object.keys(byDept).length,
      byDept: Object.entries(byDept).sort((x, y) => y[1] - x[1]),
      payroll,
    };
  }, [employees]);

  return (
    <div
      className="fixed inset-0 z-[9998] bg-th-base/40 backdrop-blur-sm flex items-start justify-center overflow-auto p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4 dark:bg-th-raised"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-th-high">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-th-accent-500 flex items-center justify-center text-white">
              <BarChart3 size={18} />
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-tight dark:text-slate-100">Аналитика персонала</p>
              <p className="text-xs text-slate-400">{a.total} сотрудников</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 bg-emerald-50 rounded-lg hover:bg-emerald-100 disabled:opacity-60 dark:bg-emerald-900/35 dark:text-emerald-400 dark:border-emerald-800/50"
            >
              {exporting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <FileSpreadsheet size={13} />
              )}
              Excel
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Users size={16} />} color="bg-th-accent-50 text-th-accent-600 dark:bg-th-accent-900/35 dark:text-th-accent-400" value={a.total} label="Всего" />
            <StatCard icon={<TrendingUp size={16} />} color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/35 dark:text-emerald-400" value={a.active} label="Активны" />
            <StatCard icon={<Wallet size={16} />} color="bg-violet-50 text-violet-600 dark:bg-violet-900/35 dark:text-violet-400" value={money(a.avgSalary)} label="Ср. оклад" />
            <StatCard icon={<Building2 size={16} />} color="bg-amber-50 text-amber-600 dark:bg-amber-900/35 dark:text-amber-400" value={a.deptCount} label="Отделов" />
          </div>

          <div className="border border-slate-100 rounded-xl p-3 dark:border-th-high">
            <p className="text-sm font-bold text-slate-700 mb-2 dark:text-slate-300">По отделам</p>
            <div className="space-y-1.5">
              {a.byDept.map(([dept, count]) => {
                const max = a.byDept[0]?.[1] || 1;
                return (
                  <div key={dept} className="flex items-center gap-2 text-xs">
                    <span className="w-28 truncate text-slate-500 dark:text-slate-400">{dept}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden dark:bg-th-high">
                      <div className="h-full bg-th-accent-500 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="w-5 text-right font-semibold text-slate-700 dark:text-slate-300">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl p-4 bg-th-accent-50 flex items-center justify-between dark:bg-th-accent-900/35">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-th-accent-400">
                Фонд оплаты труда
              </p>
              <p className="text-2xl font-bold text-th-accent-600">{money(a.payroll)}</p>
              <p className="text-xs text-th-accent-400">в месяц · {a.total} сотрудников</p>
            </div>
            <Wallet size={28} className="text-th-accent-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
