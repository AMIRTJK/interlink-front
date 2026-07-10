import { useMemo } from "react";
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
	CartesianGrid,
} from "recharts";
import { IApiFile, getUserFullName } from "./files/lib";

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

const SHARE_COLORS = [
	"#6366f1",
	"#8b5cf6",
	"#38bdf8",
	"#10b981",
	"#f59e0b",
	"#ec4899",
];

interface IProps {
	sharedWithMe?: IApiFile[];
	myFiles?: IApiFile[];
}

export const FilesAnalytics = ({ sharedWithMe = [], myFiles = [] }: IProps) => {
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

	const sharedWithMeData = useMemo(() => {
		const map = new Map<string, number>();
		sharedWithMe.forEach((file) => {
			const name = getUserFullName(file.owner);
			if (name === "—") return;
			map.set(name, (map.get(name) ?? 0) + 1);
		});
		return Array.from(map.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 6);
	}, [sharedWithMe]);

	const iSharedData = useMemo(() => {
		const map = new Map<string, number>();
		myFiles.forEach((file) => {
			if (!file.folder) return;
			const name = file.folder.name;
			map.set(name, (map.get(name) ?? 0) + 1);
		});
		return Array.from(map.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 6);
	}, [myFiles]);

	const EmptyBar = ({ label }: { label: string }) => (
		<div className="flex flex-col items-center justify-center h-[180px] gap-3">
			<div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
				👥
			</div>
			<p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 text-center">
				{label}
			</p>
		</div>
	);

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
						<div className={`text-xs font-semibold mb-1 ${kpiColorMap[card.color]}`}>
							{card.label}
						</div>
						<div className={`text-3xl font-black leading-none ${kpiColorMap[card.color]}`}>
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

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.12 }}
					className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5"
				>
					<div className="flex items-center gap-2 mb-1">
						<span className="text-base">🤝</span>
						<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
							Кто делится со мной
						</h3>
					</div>
					<p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-4 ml-6">
						Файлов по пользователям
					</p>

					{sharedWithMeData.length === 0 ? (
						<EmptyBar label="Никто ещё не поделился файлами" />
					) : (
						<ResponsiveContainer width="100%" height={Math.max(180, sharedWithMeData.length * 40)}>
							<BarChart
								layout="vertical"
								data={sharedWithMeData}
								margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
								barSize={14}
							>
								<CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.05)" />
								<XAxis
									type="number"
									axisLine={false}
									tickLine={false}
									tick={axisTick}
									allowDecimals={false}
								/>
								<YAxis
									type="category"
									dataKey="name"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 11, fill: "#6b7280" }}
									width={110}
									tickFormatter={(v: string) =>
										v.length > 14 ? v.slice(0, 13) + "…" : v
									}
								/>
								<Tooltip
									cursor={{ fill: "rgba(99,102,241,0.06)" }}
									contentStyle={tooltipStyle}
									formatter={(v: number) => [v, "Файлов"]}
								/>
								<Bar dataKey="count" radius={[0, 6, 6, 0]}>
									{sharedWithMeData.map((_, i) => (
										<Cell key={`swm-${i}`} fill={SHARE_COLORS[i % SHARE_COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					)}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.18 }}
					className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5"
				>
					<div className="flex items-center gap-2 mb-1">
						<span className="text-base">📤</span>
						<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
							С кем я делюсь
						</h3>
					</div>
					<p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-4 ml-6">
						Файлов по получателям
					</p>

					{iSharedData.length === 0 ? (
						<EmptyBar label="Вы ещё не делились файлами" />
					) : (
						<ResponsiveContainer width="100%" height={Math.max(180, iSharedData.length * 40)}>
							<BarChart
								layout="vertical"
								data={iSharedData}
								margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
								barSize={14}
							>
								<CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.05)" />
								<XAxis
									type="number"
									axisLine={false}
									tickLine={false}
									tick={axisTick}
									allowDecimals={false}
								/>
								<YAxis
									type="category"
									dataKey="name"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 11, fill: "#6b7280" }}
									width={110}
									tickFormatter={(v: string) =>
										v.length > 14 ? v.slice(0, 13) + "…" : v
									}
								/>
								<Tooltip
									cursor={{ fill: "rgba(16,185,129,0.06)" }}
									contentStyle={tooltipStyle}
									formatter={(v: number) => [v, "Файлов"]}
								/>
								<Bar dataKey="count" radius={[0, 6, 6, 0]}>
									{iSharedData.map((_, i) => (
										<Cell key={`ish-${i}`} fill={SHARE_COLORS[(i + 3) % SHARE_COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					)}
				</motion.div>
			</div>
		</motion.div>
	);
};
