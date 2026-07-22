import React, { memo } from "react";
import {
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
	Tooltip,
} from "recharts";
import { ChartType } from "./AnalyticsChartSwitcher";
import type { ICategoricalDatum, IProgressItem, IMonthEventsItem } from "./lib";

const tooltipStyle = {
	borderRadius: "12px",
	border: "none",
	boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
	fontSize: "12px",
} as const;

const axisTick = { fontSize: 11, fill: "#9ca3af" } as const;

type ProgressTooltipItem = { payload?: { fullTitle?: string } };

interface ICategoricalChartProps {
	type: ChartType;
	data: ICategoricalDatum[];
	stroke: string;
	gradId: string;
}

export const CategoricalChart = memo(({ type, data, stroke, gradId }: ICategoricalChartProps) => {
	if (type === "line") {
		return (
			<LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
				<YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
				<Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " задач", "Кол-во"]} contentStyle={tooltipStyle} />
				<Line type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
			</LineChart>
		);
	}
	if (type === "area") {
		return (
			<AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<defs>
					<linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
						<stop offset="95%" stopColor={stroke} stopOpacity={0} />
					</linearGradient>
				</defs>
				<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
				<YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
				<Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " задач", "Кол-во"]} contentStyle={tooltipStyle} />
				<Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} fillOpacity={1} fill={`url(#${gradId})`} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
			</AreaChart>
		);
	}
	if (type === "pie") {
		return (
			<PieChart>
				<Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
					{data.map((entry, i) => (
						<Cell key={`pie-${gradId}-${i}`} fill={entry.fill} />
					))}
				</Pie>
				<Tooltip formatter={(v: number | undefined, name: string | undefined) => [(v ?? 0) + " задач", name]} contentStyle={tooltipStyle} />
			</PieChart>
		);
	}
	return (
		<BarChart data={data} barSize={36} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
			<XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisTick} />
			<YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
			<Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " задач", "Кол-во"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
			<Bar dataKey="value" radius={[6, 6, 0, 0]}>
				{data.map((entry, i) => (
					<Cell key={`bar-${gradId}-${i}`} fill={entry.fill} />
				))}
			</Bar>
		</BarChart>
	);
});

interface IProgressChartProps {
	type: ChartType;
	data: IProgressItem[];
}

export const ProgressChart = memo(({ type, data }: IProgressChartProps) => {
	if (type === "line") {
		return (
			<LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
				<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
				<Tooltip formatter={(v: number | undefined, _n: string | undefined, p: ProgressTooltipItem) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
				<Line type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} />
			</LineChart>
		);
	}
	if (type === "bar") {
		return (
			<BarChart data={data} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
				<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
				<Tooltip formatter={(v: number | undefined, _n: string | undefined, p: ProgressTooltipItem) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
				<Bar dataKey="progress" fill="#6366f1" radius={[6, 6, 0, 0]} />
			</BarChart>
		);
	}
	if (type === "pie") {
		const pieColors = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#4f46e5", "#7c3aed", "#6d28d9", "#4338ca", "#3730a3"];
		return (
			<PieChart>
				<Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="progress">
					{data.map((_e, i) => (
						<Cell key={`pg-pie-${i}`} fill={pieColors[i % pieColors.length]} />
					))}
				</Pie>
				<Tooltip formatter={(v: number | undefined, _n: string | undefined, p: ProgressTooltipItem) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
			</PieChart>
		);
	}
	return (
		<AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
			<defs>
				<linearGradient id="mainProgressGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
					<stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
				</linearGradient>
			</defs>
			<XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
			<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} domain={[0, 100]} width={28} />
			<Tooltip formatter={(v: number | undefined, _n: string | undefined, p: ProgressTooltipItem) => [(v ?? 0) + "%", p?.payload?.fullTitle || "Прогресс"]} contentStyle={tooltipStyle} />
			<Area type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#mainProgressGrad)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: "#6366f1" }} />
		</AreaChart>
	);
});

interface ICalendarChartProps {
	type: ChartType;
	data: IMonthEventsItem[];
}

export const CalendarEventsChart = memo(({ type, data }: ICalendarChartProps) => {
	const stroke = "#38bdf8";
	if (type === "line") {
		return (
			<LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
				<YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
				<Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " событий", "Кол-во"]} contentStyle={tooltipStyle} />
				<Line type="monotone" dataKey="count" stroke={stroke} strokeWidth={2} dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} />
			</LineChart>
		);
	}
	if (type === "bar") {
		return (
			<BarChart data={data} barSize={36} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
				<XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
				<YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
				<Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " событий", "Кол-во"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
				<Bar dataKey="count" fill={stroke} radius={[6, 6, 0, 0]} />
			</BarChart>
		);
	}
	if (type === "pie") {
		const pieColors = ["#38bdf8", "#0ea5e9", "#7dd3fc", "#0369a1", "#bae6fd", "#0284c7"];
		return (
			<PieChart>
				<Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="count" nameKey="month">
					{data.map((_e, i) => (
						<Cell key={`cal-pie-${i}`} fill={pieColors[i % pieColors.length]} />
					))}
				</Pie>
				<Tooltip formatter={(v: number | undefined, name: string | undefined) => [(v ?? 0) + " событий", name]} contentStyle={tooltipStyle} />
			</PieChart>
		);
	}
	return (
		<AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
			<defs>
				<linearGradient id="calEventsAreaGrad" x1="0" y1="0" x2="0" y2="1">
					<stop offset="5%" stopColor={stroke} stopOpacity={0.35} />
					<stop offset="95%" stopColor={stroke} stopOpacity={0} />
				</linearGradient>
			</defs>
			<XAxis dataKey="month" axisLine={false} tickLine={false} tick={axisTick} />
			<YAxis axisLine={false} tickLine={false} tick={axisTick} allowDecimals={false} width={24} />
			<Tooltip formatter={(v: number | undefined) => [(v ?? 0) + " событий", "Кол-во"]} contentStyle={tooltipStyle} />
			<Area type="monotone" dataKey="count" stroke={stroke} strokeWidth={2} fillOpacity={1} fill="url(#calEventsAreaGrad)" dot={{ r: 4, fill: stroke, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, fill: stroke }} />
		</AreaChart>
	);
});
