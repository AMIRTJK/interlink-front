import React from "react";
import {
	Pin,
	Trash2,
	Archive,
	FileText,
	FileSpreadsheet,
	Eye,
	Share2,
	Download,
	Folder,
	Check,
	Image as ImageIcon,
	Video,
	Presentation,
	GripVertical,
} from "lucide-react";
import { Tooltip, If } from "@shared/ui";
import { IApiFile, getFileType, formatBytes } from "./lib";

interface IProps {
	file: IApiFile;
	index: number;
	isSelected: boolean;
	isDragging: boolean;
	isOver: boolean;
	showSelection?: boolean;
	onTogglePin?: (file: IApiFile) => void;
	onDelete?: (id: number) => void;
	onView: (file: IApiFile) => void;
	onMove?: (file: IApiFile) => void;
	onShare?: (file: IApiFile) => void;
	onToggleSelectFile?: (id: number) => void;
	onReorderFiles?: (fileIds: number[]) => void;
	onDownload: (file: IApiFile) => void;
	handleDragStart: (e: React.DragEvent, index: number) => void;
	handleDragOver: (e: React.DragEvent, index: number) => void;
	handleDrop: (e: React.DragEvent, index: number) => void;
	handleDragEnd: () => void;
}

const COVER_STYLES: Record<
	string,
	{ bg: string; icon: React.ComponentType<any> }
> = {
	image: { bg: "from-pink-500 to-rose-400", icon: ImageIcon },
	archive: { bg: "from-amber-500 to-orange-400!", icon: Archive },
	spreadsheet: { bg: "excel-grid-bg", icon: FileSpreadsheet },
	pdf: { bg: "from-red-500 to-rose-500!", icon: FileText },
	video: { bg: "from-purple-600 to-indigo-600!", icon: Video },
	presentation: { bg: "from-orange-500 to-amber-600!", icon: Presentation },
};

const formatDate = (dateStr: string) => {
	const d = new Date(dateStr);
	return isNaN(d.getTime())
		? ""
		: d.toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "short",
				year: "numeric",
		  });
};

const getCoverContent = (file: IApiFile) => {
	const fileType = getFileType(file.extension);
	const isMarkdown = file.original_name.endsWith(".md");
	const docBg = isMarkdown
		? "from-slate-600 to-slate-500!"
		: "from-blue-600 to-indigo-500!";
	const config = COVER_STYLES[fileType] || { bg: docBg, icon: FileText };
	const Icon = config.icon;
	const bgClass = config.bg.includes(" ")
		? `bg-gradient-to-tr ${config.bg}`
		: config.bg;

	return (
		<div className={`w-full h-full ${bgClass} flex items-center justify-center`}>
			<Icon
				size={42}
				className="text-white! transition-all duration-200 group-hover/cover:opacity-0 group-hover/cover:scale-75"
			/>
		</div>
	);
};

export const FileCard = React.memo(({
	file,
	index,
	isSelected,
	isDragging,
	isOver,
	showSelection = false,
	onTogglePin,
	onDelete,
	onView,
	onMove,
	onShare,
	onToggleSelectFile,
	onReorderFiles,
	onDownload,
	handleDragStart,
	handleDragOver,
	handleDrop,
	handleDragEnd,
}: IProps) => {
	const isReorderEnabled = Boolean(onReorderFiles);

	return (
		<div
			draggable={isReorderEnabled}
			onDragStart={(e) => handleDragStart(e, index)}
			onDragOver={(e) => handleDragOver(e, index)}
			onDrop={(e) => handleDrop(e, index)}
			onDragEnd={handleDragEnd}
			className={`group bg-white dark:bg-slate-800 rounded-[2rem] border shadow-sm transition-all duration-200 overflow-hidden ${
				isDragging ? "opacity-30 border-indigo-400" : ""
			} ${
				isOver
					? "border-2 border-indigo-500 scale-[1.02] shadow-indigo-100"
					: "border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600"
			}`}
		>
			<div
				onClick={() => onView(file)}
				className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer group/cover"
			>
				{getCoverContent(file)}

				<div className="absolute inset-0 bg-black/30 dark:bg-black/55 flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity duration-200">
					<Eye size={42} className="text-white!" />
				</div>

				<If is={showSelection}>
					<div
						onClick={(e) => {
							e.stopPropagation();
							onToggleSelectFile?.(file.id);
						}}
						className={`absolute top-4 left-4 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all z-10 cursor-pointer ${
							isSelected
								? "bg-indigo-600! border-indigo-600! text-white! scale-100 opacity-100 shadow-md"
								: "bg-black/20 border-white/60 text-transparent scale-0 group-hover:scale-100 group-hover:opacity-100 hover:border-white hover:bg-black/35 focus:scale-100 focus:opacity-100"
						}`}
					>
						<If is={isSelected}>
							<Check size={12} className="stroke-[3]" />
						</If>
					</div>
				</If>

				<If is={Boolean(onTogglePin)}>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onTogglePin?.(file);
						}}
						className={`absolute top-3 right-3 p-1.5 rounded-full transition-all cursor-pointer ${
							file.is_starred
								? "bg-amber-500! text-white! scale-100"
								: "bg-black/40 text-white/80 hover:bg-black/60 scale-0 group-hover:scale-100 focus:scale-100"
						}`}
					>
						<Pin
							size={14}
							className={file.is_starred ? "fill-white!" : ""}
						/>
					</button>
				</If>

				<If is={isReorderEnabled}>
					<div
						onClick={(e) => e.stopPropagation()}
						onMouseDown={(e) => e.stopPropagation()}
						className="absolute bottom-3 right-3 p-1.5 bg-black/40 rounded-full text-white/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-20"
					>
						<GripVertical size={14} />
					</div>
				</If>
			</div>

			<div className="p-5 space-y-1">
				<Tooltip title={file.original_name}>
					<h4
						onClick={() => onView(file)}
						className="text-sm font-bold text-slate-800 dark:text-zinc-200 truncate cursor-pointer hover:text-indigo-600 transition-colors"
					>
						{file.original_name}
					</h4>
				</Tooltip>
				<p className="text-[11px] font-semibold text-slate-400 dark:text-zinc-400">
					{formatBytes(file.size)} <span className="mx-1">•</span>{" "}
					{formatDate(file.created_at)}
				</p>

				<div className="flex items-center gap-3 pt-2.5">
					<Tooltip title="Просмотр">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onView(file);
							}}
							className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
						>
							<Eye size={14} />
						</button>
					</Tooltip>

					<Tooltip title="Скачать">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onDownload(file);
							}}
							className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
						>
							<Download size={14} />
						</button>
					</Tooltip>

					<If is={Boolean(onMove)}>
						<Tooltip title="Переместить">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onMove?.(file);
								}}
								className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
							>
								<Folder size={14} />
							</button>
						</Tooltip>
					</If>

					<If is={Boolean(onShare)}>
						<Tooltip title="Поделиться">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onShare?.(file);
								}}
								className="p-1 text-slate-400 hover:text-indigo-600! dark:hover:text-indigo-400! rounded-lg transition-colors cursor-pointer"
							>
								<Share2 size={14} />
							</button>
						</Tooltip>
					</If>

					<If is={Boolean(onDelete)}>
						<Tooltip title="Удалить">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onDelete?.(file.id);
								}}
								className="p-1 text-slate-400 hover:text-red-600! dark:hover:text-red-500! rounded-lg transition-colors cursor-pointer"
							>
								<Trash2 size={14} />
							</button>
						</Tooltip>
					</If>
				</div>
			</div>
		</div>
	);
});
