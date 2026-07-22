import { useState, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer } from "recharts";
import { Loader, EmptyState, If } from "@shared/ui";
import { usePersonalAnalytics } from "./analytics/usePersonalAnalytics";
import { AnalyticsKpiCards } from "./analytics/AnalyticsKpiCards";
import { AnalyticsChartSwitcher, ChartType } from "./analytics/AnalyticsChartSwitcher";
import { CategoricalChart, ProgressChart, CalendarEventsChart } from "./analytics/AnalyticsCharts";

export const AnalyticsTab = memo(() => {
	const [statusChartType, setStatusChartType] = useState<ChartType>("bar");
	const [priorityChartType, setPriorityChartType] = useState<ChartType>("bar");
	const [progressChartType, setProgressChartType] = useState<ChartType>("area");
	const [calEventsChartType, setCalEventsChartType] = useState<ChartType>("area");

	const {
		summary,
		statusData,
		priorityData,
		progressData,
		calEventsData,
		isLoading,
		isError,
		refetch,
	} = usePersonalAnalytics();

	const handleStatusChartChange = useCallback((v: ChartType) => setStatusChartType(v), []);
	const handlePriorityChartChange = useCallback((v: ChartType) => setPriorityChartType(v), []);
	const handleProgressChartChange = useCallback((v: ChartType) => setProgressChartType(v), []);
	const handleCalEventsChartChange = useCallback((v: ChartType) => setCalEventsChartType(v), []);

	return (
		<div>
			<If is={isLoading}>
				<div className="flex! justify-center! items-center! min-h-[440px]!">
					<Loader />
				</div>
			</If>

			<If is={isError || !summary}>
				<div className="flex! justify-center! items-center! min-h-[440px]!">
					<EmptyState
						title="Не удалось загрузить аналитику"
						description="Проверьте подключение и попробуйте обновить данные."
						actionText="Повторить"
						onAction={() => refetch()}
					/>
				</div>
			</If>

			<If is={!isLoading && !isError && !!summary}>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="flex! flex-col! gap-5! pb-6!"
				>
					<AnalyticsKpiCards summary={summary!} />

					<div className="grid! grid-cols-1! lg:grid-cols-2! gap-4!">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.2 }}
							className="rounded-3xl! bg-white/70! dark:bg-slate-800/90! backdrop-blur-sm! border! border-white/40! dark:border-slate-700/50! shadow-md! p-5!"
						>
							<div className="flex! items-center! justify-between! mb-4!">
								<h3 className="text-sm! font-bold! text-zinc-700! dark:text-zinc-200!">
									Статус задач
								</h3>
								<AnalyticsChartSwitcher current={statusChartType} onChange={handleStatusChartChange} />
							</div>
							<AnimatePresence mode="wait">
								<motion.div key={statusChartType} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
									<ResponsiveContainer width="100%" height={220}>
										<CategoricalChart type={statusChartType} data={statusData} stroke="#6366f1" gradId="mainStatusGrad" />
									</ResponsiveContainer>
								</motion.div>
							</AnimatePresence>
							<div className="flex! flex-wrap! gap-2! mt-2!">
								{statusData.map((d) => (
									<div key={d.name} className="flex! items-center! gap-1.5!">
										<span className="w-2! h-2! rounded-full! flex-shrink-0!" style={{ background: d.fill }} />
										<span className="text-[10px]! text-zinc-500! dark:text-zinc-400!">{d.name}</span>
										<span className="text-[10px]! font-bold! text-zinc-700! dark:text-zinc-200!">{d.value}</span>
									</div>
								))}
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.2 }}
							className="rounded-3xl! bg-white/70! dark:bg-slate-800/90! backdrop-blur-sm! border! border-white/40! dark:border-slate-700/50! shadow-md! p-5!"
						>
							<div className="flex! items-center! justify-between! mb-4!">
								<h3 className="text-sm! font-bold! text-zinc-700! dark:text-zinc-200!">
									Приоритет задач
								</h3>
								<AnalyticsChartSwitcher current={priorityChartType} onChange={handlePriorityChartChange} />
							</div>
							<AnimatePresence mode="wait">
								<motion.div key={priorityChartType} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
									<ResponsiveContainer width="100%" height={220}>
										<CategoricalChart type={priorityChartType} data={priorityData} stroke="#f97316" gradId="mainPriorityGrad" />
									</ResponsiveContainer>
								</motion.div>
							</AnimatePresence>
							<div className="flex! flex-wrap! gap-2! mt-2!">
								{priorityData.map((d) => (
									<div key={d.name} className="flex! items-center! gap-1.5!">
										<span className="w-2! h-2! rounded-full! flex-shrink-0!" style={{ background: d.fill }} />
										<span className="text-[10px]! text-zinc-500! dark:text-zinc-400!">{d.name}</span>
										<span className="text-[10px]! font-bold! text-zinc-700! dark:text-zinc-200!">{d.value}</span>
									</div>
								))}
							</div>
						</motion.div>
					</div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.2 }}
						className="rounded-3xl! bg-white/70! dark:bg-slate-800/90! backdrop-blur-sm! border! border-white/40! dark:border-slate-700/50! shadow-md! p-5!"
					>
						<div className="flex! items-center! justify-between! mb-4!">
							<h3 className="text-sm! font-bold! text-zinc-700! dark:text-zinc-200!">
								Прогресс выполнения
							</h3>
							<AnalyticsChartSwitcher current={progressChartType} onChange={handleProgressChartChange} />
						</div>
						<AnimatePresence mode="wait">
							<motion.div key={progressChartType} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
								<ResponsiveContainer width="100%" height={220}>
									<ProgressChart type={progressChartType} data={progressData} />
								</ResponsiveContainer>
							</motion.div>
						</AnimatePresence>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.2 }}
						className="rounded-3xl! bg-white/70! dark:bg-slate-800/90! backdrop-blur-sm! border! border-white/40! dark:border-slate-700/50! shadow-md! p-5!"
					>
						<div className="flex! items-center! justify-between! mb-4!">
							<h3 className="text-sm! font-bold! text-zinc-700! dark:text-zinc-200!">
								События календаря
							</h3>
							<AnalyticsChartSwitcher current={calEventsChartType} onChange={handleCalEventsChartChange} />
						</div>
						<AnimatePresence mode="wait">
							<motion.div key={calEventsChartType} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
								<ResponsiveContainer width="100%" height={220}>
									<CalendarEventsChart type={calEventsChartType} data={calEventsData} />
								</ResponsiveContainer>
							</motion.div>
						</AnimatePresence>
					</motion.div>
				</motion.div>
			</If>
		</div>
	);
});
