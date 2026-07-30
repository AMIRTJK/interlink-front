import {
	Archive,
	FileText,
	FileSpreadsheet,
	Image as ImageIcon,
} from "lucide-react";
import { IApiFile, getFileType } from "./lib";

export const getSmallIcon = (file: IApiFile) => {
	const fileType = getFileType(file.extension);
	const baseClass =
		"w-7 h-7 rounded-lg flex items-center justify-center text-white! font-bold text-[10px]";

	switch (fileType) {
		case "pdf":
			return (
				<div className={`${baseClass} bg-red-500!`}>
					<FileText size={13} />
				</div>
			);
		case "spreadsheet":
			return (
				<div className={`${baseClass} bg-emerald-500!`}>
					<FileSpreadsheet size={13} />
				</div>
			);
		case "image":
			return (
				<div className={`${baseClass} bg-rose-500!`}>
					<ImageIcon size={13} />
				</div>
			);
		case "archive":
			return (
				<div className={`${baseClass} bg-amber-500!`}>
					<Archive size={13} />
				</div>
			);
		case "document":
		default:
			const isMarkdown = file.original_name.endsWith(".md");
			const bg = isMarkdown ? "bg-slate-500!" : "bg-blue-500!";
			return (
				<div className={`${baseClass} ${bg}`}>
					<FileText size={13} />
				</div>
			);
	}
};

export const getTypeBadge = (file: IApiFile) => {
	const fileType = getFileType(file.extension);

	switch (fileType) {
		case "archive":
			return (
				<div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
					<span className="w-1.5 h-1.5 rounded-full bg-amber-500!" />
					<span>Архив</span>
				</div>
			);
		case "spreadsheet":
			return (
				<div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
					<span className="w-1.5 h-1.5 rounded-full bg-emerald-500!" />
					<span>Таблица</span>
				</div>
			);
		case "pdf":
			return (
				<div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
					<span className="w-1.5 h-1.5 rounded-full bg-indigo-500!" />
					<span>PDF</span>
				</div>
			);
		case "image":
			return (
				<div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
					<span className="w-1.5 h-1.5 rounded-full bg-rose-500!" />
					<span>Изображение</span>
				</div>
			);
		case "document":
		default:
			const isMarkdown = file.original_name.endsWith(".md");
			return (
				<div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300">
					<span
						className={`w-1.5 h-1.5 rounded-full ${isMarkdown ? "bg-slate-400!" : "bg-blue-500!"}`}
					/>
					<span>{isMarkdown ? "Файл" : "Документ"}</span>
				</div>
			);
	}
};
