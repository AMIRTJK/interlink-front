import { Trash2, Eye, Share2, Download, Folder } from "lucide-react";
import { Tooltip, If } from "@shared/ui";
import { IApiFile } from "./lib";

interface IProps {
	file: IApiFile;
	onView: (file: IApiFile) => void;
	onDownload: (file: IApiFile) => void;
	onMove?: (file: IApiFile) => void;
	onShare?: (file: IApiFile) => void;
	onDelete?: (id: number) => void;
}

export const FileCardActions = ({
	file,
	onView,
	onDownload,
	onMove,
	onShare,
	onDelete,
}: IProps) => (
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
);
