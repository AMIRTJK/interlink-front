import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
	Users,
	KeyRound,
	ScrollText,
	CalendarCheck,
	Network,
} from "lucide-react";
import { IHrHeaderProps, IHrTab } from "./model";

const TABS: IHrTab[] = [
	{
		key: "employees",
		label: "Сотрудники",
		path: "/modules/hr/employees",
		icon: <Users size={15} />,
	},
	{
		key: "access",
		label: "Доступ",
		path: "/modules/hr/access",
		icon: <KeyRound size={15} />,
	},
	{
		key: "orders",
		label: "Приказы",
		path: "/modules/hr/orders",
		icon: <ScrollText size={15} />,
	},
	{
		key: "timesheet",
		label: "Табель",
		path: "/modules/hr/timesheet",
		icon: <CalendarCheck size={15} />,
	},
	{
		key: "staffing",
		label: "Штатное расписание",
		path: "/modules/hr/staffing",
		icon: <Network size={15} />,
	},
];

export const HrHeader = ({ title, subtitle }: IHrHeaderProps) => {
	return (
		<div className="flex items-start justify-between gap-4 flex-wrap mb-5">
			<div>
				{title && (
					<h1 className="text-2xl font-bold text-slate-800">{title}</h1>
				)}
				{subtitle != null && (
					<p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
				)}
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				<div className="flex items-center gap-1 flex-wrap bg-white border border-slate-200 rounded-xl p-1">
					{TABS.map((t) => (
						<NavLink key={t.key} to={t.path} className="relative">
							{({ isActive }) => (
								<span className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold">
									{isActive && (
										<motion.span
											layoutId="hr-tab-active"
											transition={{
												type: "spring",
												stiffness: 420,
												damping: 34,
											}}
											className="absolute inset-0 bg-indigo-600 rounded-lg"
										/>
									)}
									<span
										className={`relative z-10 flex items-center gap-2 transition-colors ${
											isActive
												? "text-white"
												: "text-slate-600 hover:text-slate-800"
										}`}
									>
										{t.icon}
										{t.label}
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

