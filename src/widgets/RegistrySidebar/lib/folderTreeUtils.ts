import { IFolder, MenuItem } from "../model";
import { FOLDER_ORDER } from "./constants";

/**
 * Сортировка меню по порядку
 */
export const sortMenuItems = (items: MenuItem[]): MenuItem[] => {
	const topNames = FOLDER_ORDER.TOP as readonly string[];
	const bottomNames = FOLDER_ORDER.BOTTOM as readonly string[];

	const topItems = items
		.filter((i: any) => i.folderName && topNames.includes(i.folderName))
		.sort(
			(a: any, b: any) =>
				topNames.indexOf(a.folderName) - topNames.indexOf(b.folderName),
		);

	const bottomItems = items
		.filter((i: any) => i.folderName && bottomNames.includes(i.folderName))
		.sort(
			(a: any, b: any) =>
				bottomNames.indexOf(a.folderName) - bottomNames.indexOf(b.folderName),
		);

	const midItems = items.filter(
		(i: any) =>
			!i.folderName ||
			(!topNames.includes(i.folderName) && !bottomNames.includes(i.folderName)),
	);

	return [...topItems, ...midItems, ...bottomItems];
};

/**
 * Фильтр и сортировка дочерних папок
 */
export const getChildFolders = (
	parentId: number,
	folders: IFolder[],
): IFolder[] => {
	return folders
		.filter((f) => f.parent_id === parentId)
		.sort((a, b) => a.sort - b.sort);
};

/**
 * Список корневых папок
 */
export const getRootFolders = (folders: IFolder[]): IFolder[] => {
	return folders
		.filter((f) => f.parent_id === null || f.parent_id === undefined)
		.sort((a, b) => a.sort - b.sort);
};
