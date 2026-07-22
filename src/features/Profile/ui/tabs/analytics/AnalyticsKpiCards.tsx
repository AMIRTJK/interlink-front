import { memo } from "react";
import { motion } from "framer-motion";
import { IPersonalAnalyticsSummary } from "./lib";

interface IProps {
	summary: IPersonalAnalyticsSummary;
}

const kpiColorMap: Record<string, string> = {
	emerald: "text-emerald-700! dark:text-emerald-400!",
	indigo: "text-indigo-700! dark:text-indigo-400!",
	red: "text-red-600! dark:text-red-400!",
	blue: "text-blue-700! dark:text-blue-400!",
};

const kpiBgMap: Record<string, string> = {
	emerald: "bg-emerald-50! dark:bg-emerald-900/20!",
	indigo: "bg-indigo-50! dark:bg-indigo-900/20!",
	red: "bg-red-50! dark:bg-red-900/20!",
	blue: "bg-blue-50! dark:bg-blue-900/20!",
};

export const AnalyticsKpiCards = memo(({ summary }: IProps) => {
	const kpiCards = [
		{
			label: "Выполнено",
			value: `${summary.completion_pct ?? 0}%`,
			sub: `${summary.completed_tasks ?? 0} из ${summary.total_tasks ?? 0}`,
			color: "emerald",
		},
		{
			label: "Средний прогресс",
			value: `${summary.avg_progress ?? 0}%`,
			sub: "по всем задачам",
			color: "indigo",
		},
		{
			label: "Просрочено",
			value: String(summary.overdue_tasks ?? 0),
			sub: "задач",
			color: "red",
		},
		{
			label: "В работе",
			value: String(summary.in_progress_tasks ?? 0),
			sub: "активных",
			color: "blue",
		},
	];

	return (
		<div className="grid! grid-cols-2! lg:grid-cols-4! gap-3!">
			{kpiCards.map((card) => (
				<motion.div
					key={card.label}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.15 }}
					className="rounded-2xl! p-4! bg-white/70! dark:bg-slate-800/90! backdrop-blur-sm! border! border-white/40! dark:border-slate-700/50! shadow-sm! hover:shadow-md! transition-all! duration-200!"
				>
					<div className={`text-xs! font-semibold! mb-1! ${kpiColorMap[card.color]}`}>
						{card.label}
					</div>
					<div className={`text-3xl! font-black! leading-none! ${kpiColorMap[card.color]}`}>
						{card.value}
					</div>
					<div
						className={`text-xs! mt-1! px-2! py-0.5! rounded-full! inline-block! ${kpiBgMap[card.color]} ${kpiColorMap[card.color]}`}
					>
						{card.sub}
					</div>
				</motion.div>
			))}
		</div>
	);
});
