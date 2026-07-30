import { useCallback, useEffect, useState } from "react";
import type { IApiFile } from "./lib";

export const useFilesSelection = (currentFiles: IApiFile[]) => {
	const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);

	useEffect(() => {
		setSelectedFileIds((prev) => {
			if (prev.length === 0) return prev;
			const existingIds = new Set(currentFiles.map((f) => f.id));
			const valid = prev.filter((id) => existingIds.has(id));
			return valid.length === prev.length ? prev : valid;
		});
	}, [currentFiles]);

	const toggle = useCallback((id: number) => {
		setSelectedFileIds((prev) =>
			prev.includes(id)
				? prev.filter((fileId) => fileId !== id)
				: [...prev, id],
		);
	}, []);

	const selectAll = (ids: number[]) =>
		setSelectedFileIds((prev) => Array.from(new Set([...prev, ...ids])));

	const deselectAll = (ids: number[]) =>
		setSelectedFileIds((prev) => prev.filter((id) => !ids.includes(id)));

	const clear = () => setSelectedFileIds([]);

	return { selectedFileIds, toggle, selectAll, deselectAll, clear };
};

export type TFilesSelection = ReturnType<typeof useFilesSelection>;
