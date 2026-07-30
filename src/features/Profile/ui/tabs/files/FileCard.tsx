import React from "react";
import { Tooltip } from "@shared/ui";
import { IApiFile, formatBytes } from "./lib";
import { formatFileDate } from "./fileListLib";
import { FileCardCover } from "./FileCardCover";
import { FileCardActions } from "./FileCardActions";

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
			<FileCardCover
				file={file}
				isSelected={isSelected}
				isReorderEnabled={isReorderEnabled}
				showSelection={showSelection}
				onView={onView}
				onTogglePin={onTogglePin}
				onToggleSelectFile={onToggleSelectFile}
			/>

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
					{formatFileDate(file.created_at)}
				</p>

				<FileCardActions
					file={file}
					onView={onView}
					onDownload={onDownload}
					onMove={onMove}
					onShare={onShare}
					onDelete={onDelete}
				/>
			</div>
		</div>
	);
});
