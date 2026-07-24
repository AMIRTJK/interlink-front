import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	ResponsiveContainer,
	BarChart,
	Bar,
	LineChart,
	Line,
	AreaChart,
	Area,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	Tooltip as RechartsTooltip,
} from "recharts";
import { ChartSwitcher, ChartType } from "./ChartSwitcher";
import { IFilesTypeBreakdownItem } from "./analyticsModel";

const tooltipStyle = {
	borderRadius: "12px",
	border: "none",
	boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
	fontSize: "12px",
} as const;

const axisTick = { fontSize: 11, fill: "#9ca3af" } as const;

const TYPE_COLORS: Record<string, string> = {
	pdf: "#ef4444",
	image: "#eab308",
	spreadsheet: "#10b981",
	archive: "#78716c",
	presentation: "#f97316",
	video: "#06b6d4",
	audio: "#ec4899",
	document: "#3b82f6",
	other: "#64748b",
};

const TYPE_LABELS: Record<string, string> = {
	pdf: "PDF",
	image: "Изображения",
	spreadsheet: "Таблицы",
	archive: "Архивы",
	presentation: "Презентации",
	video: "Видео",
	audio: "Аудио",
	document: "Документы",
	other: "Другие",
};

interface IProps {
	typeBreakdown?: IFilesTypeBreakdownItem[];
}

export const FilesTypeChart = ({ typeBreakdown = [] }: IProps) => {
	const [chartType, setChartType] = useState<ChartType>("pie");

	const totalSize = typeBreakdown.reduce((acc, item) => acc + item.total_size, 0);

	const chartData = typeBreakdown
		.map((item) => {
			const label = TYPE_LABELS[item.type.toLowerCase()] || item.type;
			const color = TYPE_COLORS[item.type.toLowerCase()] || "#6366f1";
			const pct = item.percentage ?? (totalSize > 0 ? parseFloat(((item.total_size / totalSize) * 100).toFixed(1)) : 0);
			return {
				name: label,
				value: pct,
				count: item.count,
				sizeHuman: item.total_size_human || "",
				fill: color,
			};
		})
		.filter((item) => item.value > 0 || item.count > 0);

	const renderChartContent = () => {
		if (chartType === "line") {
			return (
				<LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
					<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
					<YAxis axisLine={false} tickLine={false} tick={axisTick} width={24} />
					<RechartsTooltip formatter={(v: any, _, props: any) => [`${v}% (${props.payload.count} ф., ${props.payload.sizeHuman})`, "Доля"]} contentStyle={tooltipStyle} />
					<Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
				</LineChart>
			);
		}
		if (chartType === "area") {
			return (
				<AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
					<defs>
						<linearGradient id="filesTypeAreaGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
							<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
						</linearGradient>
					</defs>
					<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
					<YAxis axisLine={false} tickLine={false} tick={axisTick} width={24} />
					<RechartsTooltip formatter={(v: any, _, props: any) => [`${v}% (${props.payload.count} ф., ${props.payload.sizeHuman})`, "Доля"]} contentStyle={tooltipStyle} />
					<Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#filesTypeAreaGrad)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: "#6366f1" }} />
				</AreaChart>
			);
		}
		if (chartType === "bar") {
			return (
				<BarChart data={chartData} barSize={36} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
					<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
					<YAxis axisLine={false} tickLine={false} tick={axisTick} width={24} />
					<RechartsTooltip formatter={(v: any, _, props: any) => [`${v}% (${props.payload.count} ф., ${props.payload.sizeHuman})`, "Доля"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
					<Bar dataKey="value" radius={[6, 6, 0, 0]}>
						{chartData.map((entry, i) => (
							<Cell key={`bar-${i}`} fill={entry.fill} />
						))}
					</Bar>
				</BarChart>
			);
		}
		return (
			<PieChart>
				<Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
					{chartData.map((entry, i) => (
						<Cell key={`pie-${i}`} fill={entry.fill} />
					))}
				</Pie>
				<RechartsTooltip formatter={(v: any, n: any, props: any) => [`${v}% (${props.payload.count} ф., ${props.payload.sizeHuman})`, n || ""]} contentStyle={tooltipStyle} />
			</PieChart>
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5 min-h-[320px] flex flex-col justify-between"
		>
			{chartData.length === 0 ? (
				<div className="flex flex-col items-center justify-center h-full min-h-[260px]">
					<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-4">
						Типы файлов
					</h3>
					<span className="text-xs text-slate-400">Нет данных для отображения</span>
				</div>
			) : (
				<>
					<div>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
								Типы файлов
							</h3>
							<ChartSwitcher current={chartType} onChange={setChartType} />
						</div>
						<AnimatePresence mode="wait">
							<motion.div
								key={chartType}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
							>
								<ResponsiveContainer width="100%" height={220}>
									{renderChartContent()}
								</ResponsiveContainer>
							</motion.div>
						</AnimatePresence>
					</div>
					<div className="flex flex-wrap gap-3 mt-4 justify-center">
						{chartData.map((d) => (
							<div key={d.name} className="flex items-center gap-1.5">
								<span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.fill }} />
								<span className="text-[11px] text-zinc-500 dark:text-zinc-400">{d.name}</span>
								<span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">{d.value}%</span>
							</div>
						))}
					</div>
				</>
			)}
		</motion.div>
	);
};
