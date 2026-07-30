import { useState } from "react";
import type { IApiFile } from "./lib";

export const useFileDragReorder = (
	files: IApiFile[],
	onReorderFiles?: (fileIds: number[]) => void,
) => {
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

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	return {
		draggedIndex,
		dragOverIndex,
		handleDragStart,
		handleDragOver,
		handleDrop,
		handleDragEnd,
	};
};
