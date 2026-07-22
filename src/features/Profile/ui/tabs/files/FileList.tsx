import {
	Trash2,
	Archive,
	FileText,
	FileSpreadsheet,
	Image as ImageIcon,
	Eye,
	Download,
	Folder,
	Share2,
	GripVertical,
} from "lucide-react";
import { IApiFile, getFileType, formatBytes, getUserFullName } from "./lib";
import { Tooltip, If } from "@shared/ui";
import { _axios } from "@shared/api";
import { toast } from "@shared/lib/toast";
import { useState, memo } from "react";
import { UserAvatar } from "./UserAvatar";
import { SharedAccessCell } from "./SharedAccessCell";

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
	onTogglePin,
	onDelete,
	onMove,
	onShare,
	showSharedWith,
	onSelectAll,
	onDeselectAll,
	onReorderFiles,
}: IProps) => {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setData("text/plain", String(index));
	};

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
		if (dragOverIndex !== index) {
			setDragOverIndex(index);
		}
	};

	const handleDrop = (e: React.DragEvent, targetIndex: number) => {
		e.preventDefault();
		if (draggedIndex === null || draggedIndex === targetIndex) return;

		const updated = [...files];
		const [moved] = updated.splice(draggedIndex, 1);
		updated.splice(targetIndex, 0, moved);

		setDraggedIndex(null);
		setDragOverIndex(null);

		if (onReorderFiles) {
			onReorderFiles(updated.map((f) => f.id));
		}
	};
	const getSmallIcon = (file: IApiFile) => {
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

	const getTypeBadge = (file: IApiFile) => {
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

	const handleDownload = async (file: IApiFile) => {
		try {
			const response = await _axios.get(file.download_url, {
				responseType: "blob",
			});
			const blob = new Blob([response.data], {
				type: response.headers["content-type"],
			});
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = file.original_name;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Download failed", error);
			toast.error("Не удалось скачать файл");
		}
	};

	const formatDate = (dateStr: string) => {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return "";
		return d.toLocaleDateString("ru-RU", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	return (
		<div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm p-4">
			<table className="w-full text-left border-collapse min-w-[700px]">
				<thead>
					<tr className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase border-b border-slate-100 dark:border-slate-800">
						<If is={!!showSharedWith}>
							<th className="py-4 px-4 w-12 text-center">
								<input
									type="checkbox"
									checked={files.length > 0 && files.every((file) => selectedFileIds.includes(file.id))}
									onChange={(e) => {
										const fileIds = files.map((f) => f.id);
										if (e.target.checked) {
											onSelectAll?.(fileIds);
										} else {
											onDeselectAll?.(fileIds);
										}
									}}
									className="rounded border-slate-200 dark:border-slate-800 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4 cursor-pointer"
								/>
							</th>
						</If>
						<th className="py-4 px-4">НАЗВАНИЕ</th>
						<th className="py-4 px-4 w-56">ВЛАДЕЛЕЦ</th>
						<If is={!!showSharedWith}>
							<th className="py-4 px-4 w-32">ДОСТУП</th>
						</If>
						<th className="py-4 px-4 w-36">ТИП</th>
						<th className="py-4 px-4 w-28">РАЗМЕР</th>
						<th className="py-4 px-4 w-36">ДАТА</th>
						<th className="py-4 px-4 w-48 text-right">ДЕЙСТВИЯ</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
					{files.map((file, index) => {
						const isSelected = selectedFileIds.includes(file.id);
						const isDragging = draggedIndex === index;
						const isOver = dragOverIndex === index;

						return (
							<tr
								key={file.id}
								draggable={!!onReorderFiles}
								onDragStart={(e) => handleDragStart(e, index)}
								onDragOver={(e) => handleDragOver(e, index)}
								onDrop={(e) => handleDrop(e, index)}
								onDragEnd={() => {
									setDraggedIndex(null);
									setDragOverIndex(null);
								}}
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
										<If is={!!onReorderFiles}>
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
									{formatDate(file.created_at)}
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
												onClick={() => handleDownload(file)}
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
					})}
				</tbody>
			</table>
		</div>
	);
});

