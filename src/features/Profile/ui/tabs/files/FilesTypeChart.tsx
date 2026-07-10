import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const tooltipStyle = {
	borderRadius: "12px",
	border: "none",
	boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
	fontSize: "12px",
} as const;

const mockTypeData = [
	{ name: "Изображения", value: 45, fill: "#6366f1" },
	{ name: "Документы", value: 30, fill: "#8b5cf6" },
	{ name: "Видео", value: 10, fill: "#38bdf8" },
	{ name: "Архивы", value: 15, fill: "#a8a29e" },
];

export const FilesTypeChart = () => {
	return (
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
	);
};
