import {
	Trash2,
	Eye,
	Download,
	Folder,
	Share2,
	GripVertical,
} from "lucide-react";
import { Tooltip, If } from "@shared/ui";
import { IApiFile, formatBytes, getUserFullName } from "./lib";
import { UserAvatar } from "./UserAvatar";
import { SharedAccessCell } from "./SharedAccessCell";
import { getSmallIcon, getTypeBadge } from "./fileRowVisuals";
import { downloadFile, formatFileDate } from "./fileListLib";

interface IProps {
	file: IApiFile;
	index: number;
	isSelected: boolean;
	isDragging: boolean;
	isOver: boolean;
	isReorderable: boolean;
	showSharedWith?: boolean;
	onDragStart: (e: React.DragEvent, index: number) => void;
	onDragOver: (e: React.DragEvent, index: number) => void;
	onDrop: (e: React.DragEvent, index: number) => void;
	onDragEnd: () => void;
	onToggleSelectFile: (id: number) => void;
	onView: (file: IApiFile) => void;
	onMove?: (file: IApiFile) => void;
	onShare?: (file: IApiFile) => void;
	onDelete?: (id: number) => void;
}

export const FileListRow = ({
	file,
	index,
	isSelected,
	isDragging,
	isOver,
	isReorderable,
	showSharedWith,
	onDragStart,
	onDragOver,
	onDrop,
	onDragEnd,
	onToggleSelectFile,
	onView,
	onMove,
	onShare,
	onDelete,
}: IProps) => {
	return (
		<tr
			draggable={isReorderable}
			onDragStart={(e) => onDragStart(e, index)}
			onDragOver={(e) => onDragOver(e, index)}
			onDrop={(e) => onDrop(e, index)}
			onDragEnd={onDragEnd}
			className={`group transition-all ${
				isDragging ? "opacity-30 bg-indigo-50/50 dark:bg-indigo-950/20" : ""
			} ${
				isOver ? "border-t-2 border-t-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
			}`}
		>
			{/* Checkbox */}
			<If is={!!showSharedWith}>
				<td className="py-3 px-4 text-center">
					<input
						type="checkbox"
						checked={isSelected}
						onChange={() => onToggleSelectFile(file.id)}
						className="rounded border-slate-200 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
					/>
				</td>
			</If>

			{/* Name */}
			<td className="py-3 px-4">
				<div className="flex items-center gap-3">
					<If is={isReorderable}>
						<div
							onClick={(e) => e.stopPropagation()}
							onMouseDown={(e) => e.stopPropagation()}
							className="cursor-grab active:cursor-grabbing shrink-0"
						>
							<GripVertical size={14} className="text-slate-300 group-hover:text-slate-400" />
						</div>
					</If>
					{getSmallIcon(file)}
					<span
						onClick={() => onView(file)}
						className="text-sm font-bold text-slate-800 dark:text-zinc-200 hover:text-indigo-600 transition-colors cursor-pointer"
					>
						{file.original_name}
					</span>
				</div>
			</td>

			{/* Owner */}
			<td className="py-3 px-4">
				<div className="flex items-center gap-2.5">
					<UserAvatar user={file.owner} size={32} />
					<div className="min-w-0">
						<div className="text-xs font-bold text-slate-700 dark:text-zinc-300 truncate max-w-[150px]">
							{getUserFullName(file.owner)}
						</div>
						<div className="text-[11px] text-slate-400 dark:text-zinc-500 truncate max-w-[150px]">
							{file.owner?.position || "—"}
						</div>
					</div>
				</div>
			</td>

			{/* Shared access */}
			<If is={!!showSharedWith}>
				<td className="py-3 px-4">
					<SharedAccessCell fileId={file.id} />
				</td>
			</If>

			{/* Type */}
			<td className="py-3 px-4">{getTypeBadge(file)}</td>

			{/* Size */}
			<td className="py-3 px-4 text-xs font-semibold text-slate-500 dark:text-zinc-400">
				{formatBytes(file.size)}
			</td>

			{/* Date */}
			<td className="py-3 px-4 text-xs font-semibold text-slate-400 dark:text-zinc-500">
				{formatFileDate(file.created_at)}
			</td>

			{/* Actions */}
			<td className="py-3 px-4 text-right">
				<div className="flex items-center justify-end gap-1.5">
					<Tooltip title="Просмотр">
						<button
							type="button"
							onClick={() => onView(file)}
							className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
						>
							<Eye size={15} />
						</button>
					</Tooltip>

					<Tooltip title="Скачать">
						<button
							type="button"
							onClick={() => downloadFile(file)}
							className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
						>
							<Download size={15} />
						</button>
					</Tooltip>

					{onMove && (
						<Tooltip title="Переместить">
							<button
								type="button"
								onClick={() => onMove(file)}
								className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
							>
								<Folder size={15} />
							</button>
						</Tooltip>
					)}

					{onShare && (
						<Tooltip title="Поделиться">
							<button
								type="button"
								onClick={() => onShare(file)}
								className="p-1.5 text-slate-400 hover:text-indigo-600! dark:hover:text-indigo-400! hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
							>
								<Share2 size={15} />
							</button>
						</Tooltip>
					)}

					{onDelete && (
						<Tooltip title="Удалить">
							<button
								type="button"
								onClick={() => onDelete(file.id)}
								className="p-1.5 text-slate-400 hover:text-red-600! hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer"
							>
								<Trash2 size={15} />
							</button>
						</Tooltip>
					)}
				</div>
			</td>
		</tr>
	);
};
