import { ROUTES, SYSTEM_FOLDERS } from "./constants";
import { IFolder } from "../model";

/**
 * Поиск родительской системной папки вверх по дереву
 */
export const getRootSystemFolder = (
  folderId: number,
  folders: IFolder[],
): string | null => {
  const findParent = (id: number): string | null => {
    const currentFolder = folders.find((f) => f.id === id);
    if (!currentFolder) return null;

    if (
      currentFolder.name === SYSTEM_FOLDERS.INCOMING ||
      currentFolder.name === SYSTEM_FOLDERS.OUTGOING ||
      currentFolder.name === SYSTEM_FOLDERS.ARCHIVE
    ) {
      return currentFolder.name;
    }

    if (currentFolder.parent_id) {
      return findParent(currentFolder.parent_id);
    }

    return null;
  };

  return findParent(folderId);
};

/**
 * Путь навигации для папки
 */
export const buildFolderPath = (
  folder: IFolder,
  folders: IFolder[],
  definitions: Record<string, any>,
  definition?: { path: string },
): string => {
  // Путь для системной папки
  if (definition?.path) {
    return definition.path;
  }

  // Путь для пользовательской папки
  if (folder.id) {
    const rootFolderName = getRootSystemFolder(folder.id, folders);

    if (rootFolderName && definitions[rootFolderName]) {
      const basePath = definitions[rootFolderName].path;
      return `${basePath}?folder_id=${folder.id}`;
    }
  }

  // Default fallback (если не нашли родителя, ведем в базу реестра)
  return `${ROUTES.CORRESPONDENCE_BASE}?folder_id=${folder.id}`;
};

export const canHaveSubfolders = (folderName: string): boolean => {
  return (
    folderName === SYSTEM_FOLDERS.INCOMING ||
    folderName === SYSTEM_FOLDERS.OUTGOING ||
    folderName === SYSTEM_FOLDERS.ARCHIVE
  );
};
