import { ROUTES, SYSTEM_FOLDERS } from "./constants";
import { IFolder } from "../model";

/**
 * Поиск родительской системной папки вверх по дереву
 */
export const getParentSystemFolder = (
  folderId: number,
  folders: IFolder[],
): "incoming" | "outgoing" | null => {
  const findParent = (id: number): "incoming" | "outgoing" | null => {
    const currentFolder = folders.find((f) => f.id === id);
    if (!currentFolder) return null;

    if (currentFolder.name === SYSTEM_FOLDERS.INCOMING) return "incoming";
    if (currentFolder.name === SYSTEM_FOLDERS.OUTGOING) return "outgoing";

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
  definition?: { path: string },
): string => {
  // Путь для системной папки
  if (definition?.path) {
    return definition.path;
  }

  // Путь для пользовательской папки
  if (folder.id) {
    const parentType = getParentSystemFolder(folder.id, folders);

    if (parentType === "incoming") {
      return `${ROUTES.INCOMING}?folder_id=${folder.id}`;
    } else if (parentType === "outgoing") {
      return `${ROUTES.OUTGOING}?folder_id=${folder.id}`;
    }
  }

  // Default fallback
  return `${ROUTES.FOLDERS}?folder_id=${folder.id}`;
};

export const isIncomingOrOutgoingFolder = (folderName: string): boolean => {
  return (
    folderName === SYSTEM_FOLDERS.INCOMING ||
    folderName === SYSTEM_FOLDERS.OUTGOING
  );
};
