import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  KeyRound,
  ScrollText,
  CalendarCheck,
  Network,
} from "lucide-react";
import { If } from "@shared/ui";
import { IHrHeaderProps, IHrTab } from "./model";

const TABS: IHrTab[] = [
  {
    key: "employees",
    label: "Сотрудники",
    path: "/modules/hr/employees",
    icon: <Users size={16} />,
  },
  {
    key: "access",
    label: "Доступ",
    path: "/modules/hr/access",
    icon: <KeyRound size={16} />,
  },
  {
    key: "orders",
    label: "Приказы",
    path: "/modules/hr/orders",
    icon: <ScrollText size={16} />,
  },
  {
    key: "timesheet",
    label: "Табель",
    path: "/modules/hr/timesheet",
    icon: <CalendarCheck size={16} />,
  },
  {
    key: "staffing",
    label: "Штатное расписание",
    path: "/modules/hr/staffing",
    icon: <Network size={16} />,
  },
];

export const HrHeader = ({ title, subtitle }: IHrHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
      <div>
        <If is={!!title}>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        </If>
        <If is={subtitle != null}>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </If>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 rounded-xl p-1 border border-gray-200 bg-white shadow-sm flex-wrap">
          {TABS.map((t) => (
            <NavLink key={t.key} to={t.path} className="relative">
              {({ isActive }) => (
                <span
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <If is={isActive}>
                    <motion.span
                      layoutId="hr-tab-active"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                      className="absolute inset-0 bg-indigo-600 rounded-lg shadow-md shadow-indigo-900/30"
                    />
                  </If>
                  <span className="relative z-10 flex items-center gap-1.5">
                    {t.icon}
                    <span className="hidden sm:inline">{t.label}</span>
                  </span>
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};
