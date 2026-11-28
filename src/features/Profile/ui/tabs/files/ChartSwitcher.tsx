import React from "react";
import { Tooltip } from "@shared/ui";
import {
	BarChart2,
	LineChart as LineChartIcon,
	PieChart as PieChartIcon,
	TrendingUp,
} from "lucide-react";

export type ChartType = "bar" | "line" | "area" | "pie";

interface IProps {
	current: ChartType;
	onChange: (v: ChartType) => void;
}

export const ChartSwitcher = ({ current, onChange }: IProps) => {
	const btn = (type: ChartType, icon: React.ReactNode, title: string) => (
		<Tooltip title={title} key={type}>
			<button
				onClick={() => onChange(type)}
				className={`rounded-lg p-1.5 transition-all duration-200 cursor-pointer ${
					current === type
						? "bg-th-accent-600 text-white shadow-sm"
						: "bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-th-high/50"
				}`}
			>
				{icon}
			</button>
		</Tooltip>
	);

	return (
		<div className="ui-glass-soft rounded-xl bg-zinc-100 dark:bg-th-raised/90 border border-zinc-200 dark:border-th-high/50 p-0.5 flex gap-0.5">
			{btn("bar", <BarChart2 size={14} />, "Столбцы")}
			{btn("line", <LineChartIcon size={14} />, "Линия")}
			{btn("area", <TrendingUp size={14} />, "Область")}
			{btn("pie", <PieChartIcon size={14} />, "Круговая")}
		</div>
	);
};
