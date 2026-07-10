import { motion } from "framer-motion";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	Tooltip,
} from "recharts";

const tooltipStyle = {
	borderRadius: "12px",
	border: "none",
	boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
	fontSize: "12px",
} as const;

const axisTick = { fontSize: 11, fill: "#9ca3af" } as const;

const mockTypeData = [
	{ name: "Изображения", value: 45, fill: "#6366f1" },
	{ name: "Документы", value: 30, fill: "#8b5cf6" },
	{ name: "Видео", value: 10, fill: "#38bdf8" },
	{ name: "Архивы", value: 15, fill: "#a8a29e" },
];

const mockSizeData = [
	{ name: "Янв", value: 120, fill: "#6366f1" },
	{ name: "Фев", value: 240, fill: "#6366f1" },
	{ name: "Мар", value: 180, fill: "#6366f1" },
	{ name: "Апр", value: 300, fill: "#6366f1" },
	{ name: "Май", value: 150, fill: "#6366f1" },
];

const kpiColorMap: Record<string, string> = {
	emerald: "text-emerald-700 dark:text-emerald-400",
	indigo: "text-indigo-700 dark:text-indigo-400",
	red: "text-red-600 dark:text-red-400",
	blue: "text-blue-700 dark:text-blue-400",
};

const kpiBgMap: Record<string, string> = {
	emerald: "bg-emerald-50 dark:bg-emerald-900/20",
	indigo: "bg-indigo-50 dark:bg-indigo-900/20",
	red: "bg-red-50 dark:bg-red-900/20",
	blue: "bg-blue-50 dark:bg-blue-900/20",
};

export const FilesAnalytics = () => {
	const kpiCards = [
		{
			label: "Всего файлов",
			value: "245",
			sub: "В хранилище",
			color: "indigo",
		},
		{
			label: "Занято места",
			value: "4.2 ГБ",
			sub: "Из 15 ГБ",
			color: "emerald",
		},
		{ label: "Поделились", value: "12", sub: "Файлов", color: "blue" },
		{ label: "Удалено", value: "3", sub: "За месяц", color: "red" },
	];

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col gap-5 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
		>
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
				{kpiCards.map((card, index) => (
					<motion.div
						key={card.label}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: index * 0.07 }}
						className="rounded-2xl p-4 bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200"
					>
						<div
							className={`text-xs font-semibold mb-1 ${kpiColorMap[card.color]}`}
						>
							{card.label}
						</div>
						<div
							className={`text-3xl font-black leading-none ${kpiColorMap[card.color]}`}
						>
							{card.value}
						</div>
						<div
							className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${kpiBgMap[card.color]} ${kpiColorMap[card.color]}`}
						>
							{card.sub}
						</div>
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* Распределение по типам (Pie) */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5"
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
							Типы файлов
						</h3>
					</div>
					<ResponsiveContainer width="100%" height={220}>
						<PieChart>
							<Pie
								data={mockTypeData}
								cx="50%"
								cy="50%"
								innerRadius={55}
								outerRadius={95}
								paddingAngle={3}
								dataKey="value"
							>
								{mockTypeData.map((entry, i) => (
									<Cell key={`pie-${i}`} fill={entry.fill} />
								))}
							</Pie>
							<Tooltip
								formatter={(v: number | undefined, n: string | undefined) => [
									(v ?? 0) + "%",
									n || "",
								]}
								contentStyle={tooltipStyle}
							/>
						</PieChart>
					</ResponsiveContainer>
					<div className="flex flex-wrap gap-3 mt-4 justify-center">
						{mockTypeData.map((d) => (
							<div key={d.name} className="flex items-center gap-1.5">
								<span
									className="w-2.5 h-2.5 rounded-full shrink-0"
									style={{ background: d.fill }}
								/>
								<span className="text-[11px] text-zinc-500 dark:text-zinc-400">
									{d.name}
								</span>
								<span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
									{d.value}%
								</span>
							</div>
						))}
					</div>
				</motion.div>

				{/* Использование места по месяцам (Bar) */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.08 }}
					className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5"
				>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
							Загрузки за полгода (МБ)
						</h3>
					</div>
					<ResponsiveContainer width="100%" height={220}>
						<BarChart
							data={mockSizeData}
							barSize={36}
							margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
						>
							<XAxis
								dataKey="name"
								axisLine={false}
								tickLine={false}
								tick={axisTick}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={axisTick}
								width={30}
							/>
							<Tooltip
								cursor={{ fill: "rgba(0,0,0,0.04)" }}
								contentStyle={tooltipStyle}
								formatter={(v: number | undefined) => [
									(v ?? 0) + " МБ",
									"Объем",
								]}
							/>
							<Bar dataKey="value" radius={[6, 6, 0, 0]}>
								{mockSizeData.map((entry, i) => (
									<Cell key={`bar-${i}`} fill={entry.fill} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</motion.div>
			</div>
		</motion.div>
	);
};

