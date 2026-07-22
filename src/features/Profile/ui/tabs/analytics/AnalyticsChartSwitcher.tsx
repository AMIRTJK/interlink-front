import React, { memo } from "react";
import {
	BarChart2,
	LineChart as LineChartIcon,
	PieChart as PieChartIcon,
	TrendingUp,
} from "lucide-react";
import { Tooltip } from "@shared/ui";

export type ChartType = "bar" | "line" | "area" | "pie";

interface IProps {
	current: ChartType;
	onChange: (v: ChartType) => void;
}

export const AnalyticsChartSwitcher = memo(({ current, onChange }: IProps) => {
	const renderBtn = (type: ChartType, icon: React.ReactNode, title: string) => (
		<Tooltip title={title} key={type}>
			<button
				type="button"
				onClick={() => onChange(type)}
				className={`rounded-lg! p-1.5! transition-all! duration-200! cursor-pointer! ${
					current === type
						? "bg-white! dark:bg-zinc-700! shadow-sm! text-indigo-600! dark:text-indigo-400!"
						: "bg-transparent! text-zinc-400! hover:text-zinc-600! dark:hover:text-zinc-200! hover:bg-zinc-200/50! dark:hover:bg-zinc-700/50!"
				}`}
			>
				{icon}
			</button>
		</Tooltip>
	);

	return (
		<div className="rounded-xl! bg-zinc-100! dark:bg-zinc-800! p-0.5! flex! gap-0.5!">
			{renderBtn("bar", <BarChart2 size={14} />, "Столбцы")}
			{renderBtn("line", <LineChartIcon size={14} />, "Линия")}
			{renderBtn("area", <TrendingUp size={14} />, "Область")}
			{renderBtn("pie", <PieChartIcon size={14} />, "Круговая")}
		</div>
	);
});
