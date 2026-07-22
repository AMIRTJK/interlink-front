import React from "react";
import { motion } from "framer-motion";
import { Folder, FileText } from "lucide-react";
import { IFilesFolderBreakdownItem } from "./analyticsModel";
import { formatBytes } from "./lib";

interface IProps {
	folderBreakdown?: IFilesFolderBreakdownItem[] | null;
}

export const FilesFolderBreakdown = ({ folderBreakdown }: IProps) => {
	const normalizedFolderBreakdown = Array.isArray(folderBreakdown)
		? folderBreakdown
		: [];

	if (normalizedFolderBreakdown.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.12 }}
				className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5 flex flex-col items-center justify-center min-h-[320px]"
			>
				<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-4">
					Распределение по папкам
				</h3>
				<span className="text-xs text-slate-400">
					Нет данных для отображения
				</span>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.12 }}
			className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5 flex flex-col min-h-[320px]"
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
					Распределение по папкам
				</h3>
			</div>

			<div className="flex-1 overflow-y-auto max-h-[250px] pr-1 space-y-2">
				{normalizedFolderBreakdown.map((item) => {
					const isNullFolder = item.folder_id === null;
					return (
						<div
							key={item.folder_id ?? "null-folder"}
							className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl border border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-all duration-200"
						>
							<div className="flex items-center gap-3 min-w-0">
								<div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-base shrink-0 border border-indigo-100/20 dark:border-indigo-900/10 shadow-sm">
									{isNullFolder ? (
										<FileText
											size={16}
											className="text-indigo-600 dark:text-indigo-400"
										/>
									) : (
										item.emoji || (
											<Folder
												size={16}
												className="text-indigo-600 dark:text-indigo-400"
											/>
										)
									)}
								</div>
								<div className="min-w-0">
									<div className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate">
										{isNullFolder ? "Файлы вне папок" : item.folder_name}
									</div>
									<div className="text-[9px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
										{item.files_count} файлов
									</div>
								</div>
							</div>
							<span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100/30 dark:border-indigo-900/20">
								{item.total_size_human || formatBytes(item.total_size)}
							</span>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
};

