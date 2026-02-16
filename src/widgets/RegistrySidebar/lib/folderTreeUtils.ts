import { IFolder, MenuItem } from "../model";
import { FOLDER_ORDER } from "./constants";

/**
 * Группировка папок по parent_id для оптимизации O(N)
 */
export const groupFoldersByParent = (folders: IFolder[]): Map<number | null, IFolder[]> => {
	const map = new Map<number | null, IFolder[]>();
	
	folders.forEach(folder => {
		const parentId = folder.parent_id;
		if (!map.has(parentId)) {
			map.set(parentId, []);
		}
		map.get(parentId)?.push(folder);
	});

	// Сортировка каждой группы по полю sort
	map.forEach(group => {
		group.sort((a, b) => a.sort - b.sort);
	});

	return map;
};

/**
 * Сортировка меню по порядку
 */
export const sortMenuItems = (items: MenuItem[]): MenuItem[] => {
	const topNames = FOLDER_ORDER.TOP as readonly string[];
	const bottomNames = FOLDER_ORDER.BOTTOM as readonly string[];

	const topItems = items
		.filter((i) => i.folderName && topNames.includes(i.folderName))
		.sort(
			(a, b) =>
				topNames.indexOf(a.folderName!) - topNames.indexOf(b.folderName!),
		);

	const bottomItems = items
		.filter((i) => i.folderName && bottomNames.includes(i.folderName))
		.sort(
			(a, b) =>
				bottomNames.indexOf(a.folderName!) - bottomNames.indexOf(b.folderName!),
		);

	const midItems = items.filter(
		(i) =>
			!i.folderName ||
			(!topNames.includes(i.folderName) && !bottomNames.includes(i.folderName)),
	);

	return [...topItems, ...midItems, ...bottomItems];
};

/**
 * Список корневых папок
 */
export const getRootFolders = (folders: IFolder[]): IFolder[] => {
	return folders
		.filter((f) => f.parent_id === null || f.parent_id === undefined)
		.sort((a, b) => a.sort - b.sort);
};
