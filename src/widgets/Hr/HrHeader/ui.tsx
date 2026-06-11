import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Users, KeyRound, ScrollText, CalendarCheck, Network, Moon, Sun } from "lucide-react";
import { IHrHeaderProps, IHrTab } from "./model";

// Вкладки HR-модуля (роуты)
const TABS: IHrTab[] = [
  { key: "employees", label: "Сотрудники", path: "/modules/hr/employees", icon: <Users size={15} /> },
  { key: "access", label: "Доступ", path: "/modules/hr/access", icon: <KeyRound size={15} /> },
  { key: "orders", label: "Приказы", path: "/modules/hr/orders", icon: <ScrollText size={15} /> },
  { key: "timesheet", label: "Табель", path: "/modules/hr/timesheet", icon: <CalendarCheck size={15} /> },
  { key: "staffing", label: "Штатное расписание", path: "/modules/hr/staffing", icon: <Network size={15} /> },
];

// Шапка HR: заголовок слева, таб-бар и переключатель темы справа
export const HrHeader = ({ title, subtitle }: IHrHeaderProps) => {
  const [dark, setDark] = useState(false);

  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle != null && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setDark((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          title="Тема"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="flex items-center gap-1.5 flex-wrap">
          {TABS.map((t) => (
            <NavLink
              key={t.key}
              to={t.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors border ${
                  isActive
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`
              }
            >
              {t.icon}
              <span>{t.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};
