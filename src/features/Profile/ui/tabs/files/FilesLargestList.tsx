import React from "react";
import { motion } from "framer-motion";
import {
	Archive,
	FileText,
	FileSpreadsheet,
	Image as ImageIcon,
	Video,
	Presentation,
} from "lucide-react";
import { IApiFile, getFileType, formatBytes } from "./lib";
import { If } from "@shared/ui";

const getIconConfig = (ext: string) => {
	const type = getFileType(ext);
	switch (type) {
		case "image":
			return { icon: ImageIcon, color: "text-yellow-500! bg-yellow-50 dark:bg-yellow-950/20" };
		case "archive":
			return { icon: Archive, color: "text-amber-500! bg-amber-50 dark:bg-amber-950/20" };
		case "spreadsheet":
			return { icon: FileSpreadsheet, color: "text-emerald-500! bg-emerald-50 dark:bg-emerald-950/20" };
		case "pdf":
			return { icon: FileText, color: "text-red-500! bg-red-50 dark:bg-red-950/20" };
		case "video":
			return { icon: Video, color: "text-cyan-500! bg-cyan-50 dark:bg-cyan-950/20" };
		case "presentation":
			return { icon: Presentation, color: "text-orange-500! bg-orange-50 dark:bg-orange-950/20" };
		default:
			return { icon: FileText, color: "text-blue-500! bg-blue-50 dark:bg-blue-950/20" };
	}
};

const formatDate = (dateStr: string) => {
	const d = new Date(dateStr);
	return isNaN(d.getTime())
		? ""
		: d.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
};

interface IProps {
	largestFiles?: IApiFile[];
}

export const FilesLargestList = ({ largestFiles = [] }: IProps) => {
	if (largestFiles.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
				className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5 flex flex-col items-center justify-center min-h-[320px]"
			>
				<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-4">
					Самые крупные файлы
				</h3>
				<span className="text-xs text-slate-400">Нет файлов для отображения</span>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 0.2 }}
			className="rounded-3xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-sm border border-white/40 dark:border-slate-700/50 shadow-md p-5 flex flex-col min-h-[320px]"
		>
			<h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-4">
				Самые крупные файлы
			</h3>

			<div className="flex-1 overflow-y-auto max-h-[250px] pr-1 space-y-2">
				{largestFiles.map((file) => {
					const { icon: Icon, color } = getIconConfig(file.extension);
					return (
						<div
							key={file.id}
							className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850/50 rounded-2xl border border-slate-100/70 dark:border-slate-800/40 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-all duration-200"
						>
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/20 shadow-sm ${color}`}>
									<Icon size={16} />
								</div>
								<div className="min-w-0 flex-1">
									<div className="text-[11px] font-bold text-slate-700 dark:text-zinc-200 truncate">
										{file.original_name}
									</div>
									<div className="flex items-center gap-1.5 text-[9px] text-slate-400 dark:text-zinc-500 truncate mt-0.5">
										<span className="font-bold text-slate-650 dark:text-zinc-350">
											{file.size_human || formatBytes(file.size)}
										</span>
										<span>•</span>
										<span>{formatDate(file.created_at)}</span>
										<If is={!!file.folder}>
											<>
												<span>•</span>
												<span className="text-indigo-600/80 dark:text-indigo-400/80 truncate">
													{file.folder?.emoji || "📁"} {file.folder?.name}
												</span>
											</>
										</If>
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
};
