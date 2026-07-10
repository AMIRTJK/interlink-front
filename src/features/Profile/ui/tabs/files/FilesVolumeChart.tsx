import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip } from "recharts";

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

export const FilesVolumeChart = () => {
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
	);
};
