import { useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { PieChart as PieIcon, LayoutGrid } from "lucide-react";
import { Pagination } from "antd";
import { If } from "@shared/ui";
import { UserAvatar } from "./UserAvatar";
import {
	ISharedWithMeEntry,
	ISharesPagination,
	tooltipStyle,
} from "./filesSharesLib";
import { FilesSharesEmptyBar } from "./FilesSharesEmptyBar";

interface IProps {
	data: ISharedWithMeEntry[];
	pagination?: ISharesPagination;
	onPageChange?: (page: number) => void;
}

export const SharedWithMeCard = ({ data, pagination, onPageChange }: IProps) => {
	const [viewType, setViewType] = useState<"pie" | "list">("pie");

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.12 }}
			className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5 flex flex-col justify-between min-h-[340px]"
		>
			<div>
				<div className="flex items-center justify-between mb-1">
					<div className="flex items-center gap-2">
						<span className="text-base">🤝</span>
						<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
							Кто делится со мной
						</h3>
					</div>
					<If is={data.length > 0}>
						<div className="flex items-center gap-0.5 bg-slate-100/60 dark:bg-slate-900/50 p-0.5 rounded-lg border border-slate-200/30 dark:border-slate-800/40">
							<button
								type="button"
								onClick={() => setViewType("pie")}
								className={`p-1 rounded-md transition-all cursor-pointer ${
									viewType === "pie"
										? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
										: "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
								}`}
								title="Диаграмма"
							>
								<PieIcon size={12} />
							</button>
							<button
								type="button"
								onClick={() => setViewType("list")}
								className={`p-1 rounded-md transition-all cursor-pointer ${
									viewType === "list"
										? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
										: "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
								}`}
								title="Карточки"
							>
								<LayoutGrid size={12} />
							</button>
						</div>
					</If>
				</div>
				<p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-4 ml-6">
					Файлов по пользователям
				</p>

				<If is={data.length === 0}>
					<FilesSharesEmptyBar
						label="Никто ещё не поделился файлами"
						icon="👥"
					/>
				</If>

				<If is={data.length > 0}>
					<div className="min-h-[220px]">
						<If is={viewType === "pie"}>
							<div className="animate-in fade-in duration-200">
								<ResponsiveContainer width="100%" height={180}>
									<PieChart>
										<Pie
											data={data}
											cx="50%"
											cy="50%"
											innerRadius={45}
											outerRadius={80}
											paddingAngle={3}
											dataKey="value"
										>
											{data.map((entry, i) => (
												<Cell key={`pie-user-${i}`} fill={entry.fill} />
											))}
										</Pie>
										<Tooltip
											formatter={(v: number | undefined, n: string | undefined) => [
												(v ?? 0) + " ф.",
												n || "",
											]}
											contentStyle={tooltipStyle}
										/>
									</PieChart>
								</ResponsiveContainer>
								<div className="flex flex-wrap gap-3 mt-2 justify-center">
									{data.map((d) => (
										<div key={d.name} className="flex items-center gap-1.5">
											<span
												className="w-2.5 h-2.5 rounded-full shrink-0"
												style={{ background: d.fill }}
											/>
											<span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
												{d.name}
											</span>
											<span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-200">
												{d.value} ф.
											</span>
										</div>
									))}
								</div>
							</div>
						</If>

						<If is={viewType === "list"}>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
								{data.map((item, index) => (
									<motion.div
										key={item.user.id}
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.04 }}
										className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl border border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-all duration-200"
									>
										<div className="flex items-center gap-3 min-w-0">
											<UserAvatar user={item.user} size={36} className="shrink-0 shadow-sm" />
											<div className="min-w-0">
												<div className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate">
													{item.name}
												</div>
												<div className="text-[9px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
													{item.user.position || "Сотрудник"}
												</div>
											</div>
										</div>
										<span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100/30 dark:border-indigo-900/20">
											{item.value} ф.
										</span>
									</motion.div>
								))}
							</div>
						</If>
					</div>
				</If>
			</div>

			<If is={data.length > 0 && !!pagination}>
				<div className="flex justify-end pt-3 border-t border-slate-100/40 dark:border-slate-800/20 mt-4 shrink-0">
					<Pagination
						size="small"
						current={pagination!.currentPage}
						total={pagination!.total}
						pageSize={pagination!.perPage}
						onChange={onPageChange}
						showSizeChanger={false}
						hideOnSinglePage={false}
						showTotal={(total, range) => `${range[0]}–${range[1]} из ${total}`}
					/>
				</div>
			</If>
		</motion.div>
	);
};
