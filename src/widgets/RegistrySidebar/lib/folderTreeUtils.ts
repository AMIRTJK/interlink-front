import { Folder, MenuItem } from "./types";
import { FOLDER_ORDER } from "./constants";

/**
 * Sorts menu items according to predefined folder order
 */
export const sortMenuItems = (items: MenuItem[]): MenuItem[] => {
  const topNames = FOLDER_ORDER.TOP as readonly string[];
  const bottomNames = FOLDER_ORDER.BOTTOM as readonly string[];

  const topItems = items
    .filter((i) => topNames.includes(i.folderName))
    .sort((a, b) => topNames.indexOf(a.folderName) - topNames.indexOf(b.folderName));

  const bottomItems = items
    .filter((i) => bottomNames.includes(i.folderName))
    .sort((a, b) => bottomNames.indexOf(a.folderName) - bottomNames.indexOf(b.folderName));

  const midItems = items.filter(
    (i) => !topNames.includes(i.folderName) && !bottomNames.includes(i.folderName)
  );

  return [...topItems, ...midItems, ...bottomItems];
};

/**
 * Filters and sorts child folders for a given parent folder
 */
export const getChildFolders = (parentId: number, folders: Folder[]): Folder[] => {
  return folders
    .filter((f) => f.parent_id === parentId)
    .sort((a, b) => a.sort - b.sort);
};

/**
 * Gets all root-level folders (folders with no parent)
 */
export const getRootFolders = (folders: Folder[]): Folder[] => {
  return folders
    .filter((f) => f.parent_id === null || f.parent_id === undefined)
    .sort((a, b) => a.sort - b.sort);
};
