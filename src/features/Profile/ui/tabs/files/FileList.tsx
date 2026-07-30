import { memo } from "react";
import { IApiFile } from "./lib";
import { FileListHeader } from "./FileListHeader";
import { FileListRow } from "./FileListRow";
import { useFileDragReorder } from "./useFileDragReorder";

interface IProps {
	files: IApiFile[];
	selectedFileIds: number[];
	onToggleSelectFile: (id: number) => void;
	onView: (file: IApiFile) => void;
	onTogglePin?: (file: IApiFile) => void;
	onDelete?: (id: number) => void;
	onMove?: (file: IApiFile) => void;
	onShare?: (file: IApiFile) => void;
	showSharedWith?: boolean;
	onSelectAll?: (ids: number[]) => void;
	onDeselectAll?: (ids: number[]) => void;
	onReorderFiles?: (fileIds: number[]) => void;
}

export const FileList = memo(({
	files,
	selectedFileIds,
	onToggleSelectFile,
	onView,
	onDelete,
	onMove,
	onShare,
	showSharedWith,
	onSelectAll,
	onDeselectAll,
	onReorderFiles,
}: IProps) => {
	const {
		draggedIndex,
		dragOverIndex,
		handleDragStart,
		handleDragOver,
		handleDrop,
		handleDragEnd,
	} = useFileDragReorder(files, onReorderFiles);

	return (
		<div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-4">
			<table className="w-full text-left border-collapse min-w-[700px]">
				<FileListHeader
					files={files}
					selectedFileIds={selectedFileIds}
					showSharedWith={showSharedWith}
					onSelectAll={onSelectAll}
					onDeselectAll={onDeselectAll}
				/>
				<tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
					{files.map((file, index) => (
						<FileListRow
							key={file.id}
							file={file}
							index={index}
							isSelected={selectedFileIds.includes(file.id)}
							isDragging={draggedIndex === index}
							isOver={dragOverIndex === index}
							isReorderable={!!onReorderFiles}
							showSharedWith={showSharedWith}
							onDragStart={handleDragStart}
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							onDragEnd={handleDragEnd}
							onToggleSelectFile={onToggleSelectFile}
							onView={onView}
							onMove={onMove}
							onShare={onShare}
							onDelete={onDelete}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
});
