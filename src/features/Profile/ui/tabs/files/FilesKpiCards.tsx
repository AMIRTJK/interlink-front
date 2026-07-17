import { motion } from "framer-motion";
import { IDiskMeta, formatBytes } from "./lib";

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
	meta: IDiskMeta | null;
	sharedCount: number;
}

export const FilesKpiCards = ({ meta, sharedCount }: IProps) => {
	const totalFiles = meta?.total_count ?? 0;
	const usedBytes = meta?.storage_used_bytes ?? 0;
	const limitBytes = meta?.storage_limit_bytes ?? 15 * 1024 * 1024 * 1024;

	const kpiCards = [
		{
			label: "Всего файлов",
			value: String(totalFiles),
			sub: "В хранилище",
			color: "indigo",
		},
		{
			label: "Занято места",
			value: formatBytes(usedBytes),
			sub: `Из ${formatBytes(limitBytes)}`,
			color: "emerald",
		},
		{
			label: "Поделились",
			value: String(sharedCount),
			sub: "Файлов доступно",
			color: "blue",
		},
		{
			label: "Удалено",
			value: "3",
			sub: "В корзине",
			color: "red",
		},
	];

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
			{kpiCards.map((card, index) => (
				<motion.div
					key={card.label}
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3, delay: index * 0.05 }}
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
