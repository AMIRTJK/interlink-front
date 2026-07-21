import React, { useState } from "react";
import { motion } from "framer-motion";
import { Select } from "antd";
import { Loader, EmptyState } from "@shared/ui";
import { useFilesAnalytics } from "./useFilesAnalytics";
import { FilesKpiCards } from "./FilesKpiCards";
import { FilesTypeChart } from "./FilesTypeChart";
import { FilesVolumeChart } from "./FilesVolumeChart";
import { FilesFolderBreakdown } from "./FilesFolderBreakdown";
import { FilesRecentList } from "./FilesRecentList";
import { FilesLargestList } from "./FilesLargestList";
import { IFilesAnalyticsStorage } from "./analyticsModel";
import { IApiFile, formatBytes } from "./lib";

const StorageCard = ({ storage }: { storage: IFilesAnalyticsStorage }) => {
	const pct = storage.used_pct;
	const used = storage.used_bytes_human || formatBytes(storage.used_bytes);
	const total = storage.total_bytes_human || formatBytes(storage.total_bytes);
	const free = storage.free_bytes_human || formatBytes(storage.free_bytes);

	return (
		<div className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5 flex flex-col justify-between min-h-[320px]">
			<div>
				<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">
					Использование диска
				</h3>
				<p className="text-[11px] text-slate-400 dark:text-zinc-500 mb-6">
					Статистика дискового пространства
				</p>
				<div className="relative flex items-center justify-center h-28 w-28 mx-auto mb-6">
					<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
						<path
							className="text-slate-100 dark:text-slate-800"
							strokeWidth="3"
							stroke="currentColor"
							fill="none"
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						/>
						<path
							className="text-indigo-600 dark:text-indigo-400"
							strokeWidth="3.2"
							strokeDasharray={`${pct}, 100`}
							strokeLinecap="round"
							stroke="currentColor"
							fill="none"
							d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
						/>
					</svg>
					<div className="absolute flex flex-col items-center justify-center">
						<span className="text-xl font-black text-slate-700 dark:text-zinc-200">
							{pct}%
						</span>
						<span className="text-[9px] font-bold text-slate-400">Занято</span>
					</div>
				</div>
			</div>
			<div className="space-y-2 border-t border-slate-100/60 dark:border-slate-850/60 pt-4">
				<div className="flex justify-between text-xs">
					<span className="text-slate-500 dark:text-zinc-400 font-semibold">Занято</span>
					<span className="text-slate-700 dark:text-zinc-200 font-bold">{used}</span>
				</div>
				<div className="flex justify-between text-xs">
					<span className="text-slate-500 dark:text-zinc-400 font-semibold">Свободно</span>
					<span className="text-slate-700 dark:text-zinc-200 font-bold">{free}</span>
				</div>
				<div className="flex justify-between text-xs">
					<span className="text-slate-500 dark:text-zinc-400 font-semibold">Всего места</span>
					<span className="text-slate-700 dark:text-zinc-200 font-bold">{total}</span>
				</div>
			</div>
		</div>
	);
};

interface IProps {
	onView: (file: IApiFile) => void;
}

export const FilesAnalytics = ({ onView }: IProps) => {
	const [months, setMonths] = useState(12);
	const [limit, setLimit] = useState(5);
	const { data, isLoading, isError, refetch } = useFilesAnalytics({ months, limit });

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[440px]">
				<Loader />
			</div>
		);
	}

	if (isError || !data) {
		return (
			<div className="flex justify-center items-center min-h-[440px]">
				<EmptyState
					title="Не удалось загрузить аналитику"
					description="Проверьте подключение и попробуйте обновить данные."
					actionText="Повторить"
					onAction={() => refetch()}
				/>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col gap-5 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
		>
			<div className="flex flex-wrap items-center justify-end gap-3 bg-white/40 dark:bg-slate-800/40 p-3 rounded-2xl border border-white/20 dark:border-slate-700/30">
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Период:</span>
					<Select
						value={months}
						onChange={setMonths}
						size="small"
						className="w-28"
						options={[
							{ value: 3, label: "3 месяца" },
							{ value: 6, label: "6 месяцев" },
							{ value: 12, label: "12 месяцев" },
							{ value: 24, label: "24 месяца" },
						]}
					/>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Лимит файлов:</span>
					<Select
						value={limit}
						onChange={setLimit}
						size="small"
						className="w-24"
						options={[
							{ value: 5, label: "5 файлов" },
							{ value: 10, label: "10 файлов" },
							{ value: 15, label: "15 файлов" },
							{ value: 20, label: "20 файлов" },
						]}
					/>
				</div>
			</div>

			<FilesKpiCards summary={data.summary} />

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<FilesTypeChart typeBreakdown={data.type_breakdown} />
				<FilesVolumeChart uploadActivity={data.upload_activity} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<StorageCard storage={data.storage} />
				<FilesFolderBreakdown folderBreakdown={data.folder_breakdown} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<FilesRecentList recentFiles={data.recent_files} onView={onView} />
				<FilesLargestList largestFiles={data.largest_files} onView={onView} />
			</div>
		</motion.div>
	);
};
