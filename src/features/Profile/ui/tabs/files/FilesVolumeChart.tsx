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
import { IFilesUploadActivityItem } from "./analyticsModel";

const tooltipStyle = {
	borderRadius: "12px",
	border: "none",
	boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
	fontSize: "12px",
} as const;

const axisTick = { fontSize: 11, fill: "#9ca3af" } as const;
const pieColors = ["#6366f1", "#8b5cf6", "#38bdf8", "#a8a29e", "#a78bfa"];
const MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];

const formatMonthLabel = (mStr?: string): string => {
	if (!mStr || typeof mStr !== "string") {
		return "";
	}
	const parts = mStr.split("-");
	if (parts.length === 2) {
		const monthIdx = parseInt(parts[1], 10) - 1;
		return MONTHS[monthIdx] ? `${MONTHS[monthIdx]} '${parts[0].slice(-2)}` : mStr;
	}
	return mStr;
};

interface IProps {
	uploadActivity?: IFilesUploadActivityItem[];
}

export const FilesVolumeChart = ({ uploadActivity = [] }: IProps) => {
	const [chartType, setChartType] = useState<ChartType>("bar");

	const chartData = uploadActivity.map((item) => {
		const valMb = parseFloat((item.total_size / (1024 * 1024)).toFixed(1));
		return {
			name: formatMonthLabel(item.month),
			value: valMb,
			count: item.count,
			sizeHuman: item.total_size_human || `${valMb} МБ`,
		};
	});

	const renderTooltipFormatter = (props: any) => [
		`${props.payload.sizeHuman} (${props.payload.count} файлов)`,
		"Объем",
	];

	const renderChartContent = () => {
		if (chartType === "line") {
			return (
				<LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
					<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
					<YAxis axisLine={false} tickLine={false} tick={axisTick} width={30} />
					<RechartsTooltip formatter={(_, __, props) => renderTooltipFormatter(props)} contentStyle={tooltipStyle} />
					<Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
				</LineChart>
			);
		}
		if (chartType === "area") {
			return (
				<AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
					<defs>
						<linearGradient id="filesVolumeAreaGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
							<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
						</linearGradient>
					</defs>
					<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
					<YAxis axisLine={false} tickLine={false} tick={axisTick} width={30} />
					<RechartsTooltip formatter={(_, __, props) => renderTooltipFormatter(props)} contentStyle={tooltipStyle} />
					<Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#filesVolumeAreaGrad)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: "#6366f1" }} />
				</AreaChart>
			);
		}
		if (chartType === "pie") {
			return (
				<PieChart>
					<Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
						{chartData.map((_, i) => (
							<Cell key={`pie-${i}`} fill={pieColors[i % pieColors.length]} />
						))}
					</Pie>
					<RechartsTooltip formatter={(_, n, props) => [`${props.payload.sizeHuman} (${props.payload.count} файлов)`, n || ""]} contentStyle={tooltipStyle} />
				</PieChart>
			);
		}
		return (
			<BarChart data={chartData} barSize={36} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
				<YAxis axisLine={false} tickLine={false} tick={axisTick} width={30} />
				<RechartsTooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} contentStyle={tooltipStyle} formatter={(_, __, props) => renderTooltipFormatter(props)} />
				<Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} />
			</BarChart>
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
						Динамика загрузок
					</h3>
					<span className="text-xs text-slate-400">
						Нет данных для отображения
					</span>
				</div>
			) : (
				<>
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
							Динамика загрузок
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
				</>
			)}
		</motion.div>
	);
};


