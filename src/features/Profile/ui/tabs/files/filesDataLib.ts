import type { IApiFile } from "./lib";
import type { IFilesCategory, IFilesParams } from "./filesDataModel";

export const buildFolderFileCounts = (
	items: IApiFile[],
): Record<number, number> =>
	items.reduce<Record<number, number>>((acc, file) => {
		if (file.folder_id != null) {
			acc[file.folder_id] = (acc[file.folder_id] ?? 0) + 1;
		}
		return acc;
	}, {});

export const getArrayData = (response: any): any[] => {
	if (!response) return [];
	if (Array.isArray(response)) return response;
	if (response.data && Array.isArray(response.data)) return response.data;
	return [];
};

export const sortByManualOrder = <T extends { id?: number; sort_order?: number }>(
	arr: T[],
	manualOrderMap: Record<number, number>,
	sort: IFilesParams["sort"],
): T[] => {
	if (sort && sort !== "manual") return arr;
	return [...arr].sort((a, b) => {
		const orderA =
			a.id != null && manualOrderMap[a.id] !== undefined
				? manualOrderMap[a.id]
				: (a.sort_order ?? 0);
		const orderB =
			b.id != null && manualOrderMap[b.id] !== undefined
				? manualOrderMap[b.id]
				: (b.sort_order ?? 0);
		return orderA - orderB;
	});
};

export const getFolderIcon = (name: string): string => {
	const n = name.toLowerCase();
	if (n.includes("рабоч")) return "💼";
	if (n.includes("документ")) return "📄";
	if (n.includes("договор")) return "📑";
	if (n.includes("фото") || n.includes("изображ")) return "🖼️";
	return "📁";
};

export const buildCategoriesList = (
	rootEntry: { name: string; icon: string; count: number },
	folders: any[],
	folderFileCounts: Record<number, number>,
): IFilesCategory[] => {
	const list: IFilesCategory[] = [];
	list.push({
		id: "all" as const,
		name: rootEntry.name,
		icon: rootEntry.icon,
		count: rootEntry.count,
	});
	folders.forEach((f) => {
		list.push({
			id: f.id,
			name: f.name,
			icon: f.emoji || getFolderIcon(f.name),
			count: f.files_count ?? folderFileCounts[f.id] ?? 0,
		});
	});
	return list;
};
