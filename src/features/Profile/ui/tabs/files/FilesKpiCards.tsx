import { motion } from "framer-motion";
import { IFilesAnalyticsSummary } from "./analyticsModel";

const kpiColorMap: Record<string, string> = {
	emerald: "text-emerald-700 dark:text-emerald-400",
	indigo: "text-indigo-700 dark:text-indigo-400",
	red: "text-red-600 dark:text-red-400",
	blue: "text-blue-700 dark:text-blue-400",
};

const kpiBgMap: Record<string, string> = {
	emerald: "bg-emerald-50 dark:bg-emerald-900/20",
	indigo: "bg-indigo-50 dark:bg-indigo-900/20",
	red: "bg-red-50/70 dark:bg-red-900/20",
	blue: "bg-blue-50 dark:bg-blue-900/20",
};

interface IProps {
	summary: IFilesAnalyticsSummary;
}

export const FilesKpiCards = ({ summary }: IProps) => {
	const kpiCards = [
		{
			label: "Всего файлов",
			value: String(summary.files_count),
			sub: "В хранилище",
			color: "indigo",
		},
		{
			label: "Всего папок",
			value: String(summary.folders_count),
			sub: "В структуре",
			color: "emerald",
		},
		{
			label: "Поделились",
			value: String(summary.shared_count),
			sub: "Файлов доступно",
			color: "blue",
		},
		{
			label: "В избранном",
			value: String(summary.starred_count),
			sub: "Отмечено звездой",
			color: "red",
		},
	];

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
			{kpiCards.map((card, index) => (
				<motion.div
					key={card.label}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.15 }}
					className="rounded-2xl p-4 bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200"
				>
					<div className={`text-[10px] tracking-wider font-bold uppercase mb-1 ${kpiColorMap[card.color]}`}>
						{card.label}
					</div>
					<div className={`text-2xl font-black leading-none ${kpiColorMap[card.color]}`}>
						{card.value}
					</div>
					<div
						className={`text-[10px] font-semibold mt-1.5 px-2 py-0.5 rounded-full inline-block ${kpiBgMap[card.color]} ${kpiColorMap[card.color]}`}
					>
						{card.sub}
					</div>
				</motion.div>
			))}
		</div>
	);
};
