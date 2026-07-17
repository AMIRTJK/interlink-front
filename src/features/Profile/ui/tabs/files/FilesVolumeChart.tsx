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

const tooltipStyle = {
	borderRadius: "12px",
	border: "none",
	boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
	fontSize: "12px",
} as const;

const axisTick = { fontSize: 11, fill: "#9ca3af" } as const;

const mockSizeData = [
	{ name: "Янв", value: 120, fill: "#6366f1" },
	{ name: "Фев", value: 240, fill: "#6366f1" },
	{ name: "Мар", value: 180, fill: "#6366f1" },
	{ name: "Апр", value: 300, fill: "#6366f1" },
	{ name: "Май", value: 150, fill: "#6366f1" },
];

const pieColors = ["#6366f1", "#8b5cf6", "#38bdf8", "#a8a29e", "#a78bfa"];

export const FilesVolumeChart = () => {
	const [chartType, setChartType] = useState<ChartType>("bar");

	let chartElement: React.ReactNode = null;

	if (chartType === "line") {
		chartElement = (
			<LineChart data={mockSizeData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
				<YAxis axisLine={false} tickLine={false} tick={axisTick} width={30} />
				<RechartsTooltip
					formatter={(v: number | undefined) => [(v ?? 0) + " МБ", "Объем"]}
					contentStyle={tooltipStyle}
				/>
				<Line
					type="monotone"
					dataKey="value"
					stroke="#6366f1"
					strokeWidth={2}
					dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
				/>
			</LineChart>
		);
	} else if (chartType === "area") {
		chartElement = (
			<AreaChart data={mockSizeData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<defs>
					<linearGradient id="filesVolumeAreaGrad" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
						<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
					</linearGradient>
				</defs>
				<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
				<YAxis axisLine={false} tickLine={false} tick={axisTick} width={30} />
				<RechartsTooltip
					formatter={(v: number | undefined) => [(v ?? 0) + " МБ", "Объем"]}
					contentStyle={tooltipStyle}
				/>
				<Area
					type="monotone"
					dataKey="value"
					stroke="#6366f1"
					strokeWidth={2}
					fillOpacity={1}
					fill="url(#filesVolumeAreaGrad)"
					dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
					activeDot={{ r: 6, fill: "#6366f1" }}
				/>
			</AreaChart>
		);
	} else if (chartType === "pie") {
		chartElement = (
			<PieChart>
				<Pie
					data={mockSizeData}
					cx="50%"
					cy="50%"
					innerRadius={55}
					outerRadius={95}
					paddingAngle={3}
					dataKey="value"
				>
					{mockSizeData.map((entry, i) => (
						<Cell key={`pie-${i}`} fill={pieColors[i % pieColors.length]} />
					))}
				</Pie>
				<RechartsTooltip
					formatter={(v: number | undefined, n: string | undefined) => [
						(v ?? 0) + " МБ",
						n || "",
					]}
					contentStyle={tooltipStyle}
				/>
			</PieChart>
		);
	} else {
		chartElement = (
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
				<RechartsTooltip
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
		);
	}

	return (
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
				<ChartSwitcher current={chartType} onChange={setChartType} />
			</div>
			<AnimatePresence mode="wait">
				<motion.div
					key={chartType}
					initial={{ opacity: 0, scale: 0.97 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.97 }}
					transition={{ duration: 0.15 }}
				>
					<ResponsiveContainer width="100%" height={220}>
						{chartElement}
					</ResponsiveContainer>
				</motion.div>
			</AnimatePresence>
		</motion.div>
	);
};
