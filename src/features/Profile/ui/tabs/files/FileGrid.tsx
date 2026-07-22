import React, { useState, useEffect } from "react";
import { _axios } from "@shared/api";
import { toast } from "@shared/lib/toast";
import { IApiFile } from "./lib";
import { FileCard } from "./FileCard";

interface IProps {
	files: IApiFile[];
	onTogglePin?: (file: IApiFile) => void;
	onDelete?: (id: number) => void;
	onView: (file: IApiFile) => void;
	onMove?: (file: IApiFile) => void;
	onShare?: (file: IApiFile) => void;
	selectedFileIds?: number[];
	onToggleSelectFile?: (id: number) => void;
	showSelection?: boolean;
	onReorderFiles?: (fileIds: number[]) => void;
}

export const FileGrid = ({
	files,
	onTogglePin,
	onDelete,
	onView,
	onMove,
	onShare,
	selectedFileIds = [],
	onToggleSelectFile,
	showSelection = false,
	onReorderFiles,
}: IProps) => {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	const [localFiles, setLocalFiles] = useState<IApiFile[]>(files);

	useEffect(() => {
		setLocalFiles(files);
	}, [files]);

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

		const updated = [...localFiles];
		const [moved] = updated.splice(draggedIndex, 1);
		updated.splice(targetIndex, 0, moved);

		setLocalFiles(updated);
		setDraggedIndex(null);
		setDragOverIndex(null);

		if (onReorderFiles) {
			onReorderFiles(updated.map((f) => f.id));
		}
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
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

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
			{localFiles.map((file, index) => (
				<FileCard
					key={file.id}
					file={file}
					index={index}
					isSelected={selectedFileIds.includes(file.id)}
					isDragging={draggedIndex === index}
					isOver={dragOverIndex === index}
					showSelection={showSelection}
					onTogglePin={onTogglePin}
					onDelete={onDelete}
					onView={onView}
					onMove={onMove}
					onShare={onShare}
					onToggleSelectFile={onToggleSelectFile}
					onReorderFiles={onReorderFiles}
					onDownload={handleDownload}
					handleDragStart={handleDragStart}
					handleDragOver={handleDragOver}
					handleDrop={handleDrop}
					handleDragEnd={handleDragEnd}
				/>
			))}
		</div>
	);
};
