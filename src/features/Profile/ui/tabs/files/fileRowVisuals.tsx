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
		default: {
			const isMarkdown = file.original_name.endsWith(".md");
			const bg = isMarkdown ? "bg-slate-500!" : "bg-blue-500!";
			return (
				<div className={`${baseClass} ${bg}`}>
					<FileText size={13} />
				</div>
			);
		}
	}
};

export const getTypeBadge = (file: IApiFile) => {
	const fileType = getFileType(file.extension);

	switch (fileType) {
		case "archive":
			return (
				<div className="inline-flex items-center text-amber-600 dark:text-amber-400">
					<Archive size={14} className="shrink-0" />
				</div>
			);
		case "spreadsheet":
			return (
				<div className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
					<FileSpreadsheet size={14} className="shrink-0" />
				</div>
			);
		case "pdf":
			return (
				<div className="inline-flex items-center text-red-500 dark:text-red-400">
					<FileText size={14} className="shrink-0" />
				</div>
			);
		case "image":
			return (
				<div className="inline-flex items-center text-rose-500 dark:text-rose-400">
					<ImageIcon size={14} className="shrink-0" />
				</div>
			);
		case "document":
		default:
			return (
				<div className="inline-flex items-center text-blue-600 dark:text-blue-400">
					<FileText size={14} className="shrink-0" />
				</div>
			);
	}
};
