import { ROUTES, SYSTEM_FOLDERS } from "./constants";
import { Folder } from "./types";

/**
 * Determines the parent system folder type (incoming/outgoing) for a given folder
 * by traversing up the folder tree
 */
export const getParentSystemFolder = (
  folderId: number,
  folders: Folder[]
): "incoming" | "outgoing" | null => {
  const findParent = (id: number): "incoming" | "outgoing" | null => {
    const currentFolder = folders.find((f) => f.id === id);
    if (!currentFolder) return null;

    // Check if this is a system folder
    if (currentFolder.name === SYSTEM_FOLDERS.INCOMING) return "incoming";
    if (currentFolder.name === SYSTEM_FOLDERS.OUTGOING) return "outgoing";

    // If has parent, continue searching
    if (currentFolder.parent_id) {
      return findParent(currentFolder.parent_id);
    }

    return null;
  };

  return findParent(folderId);
};

/**
 * Builds the navigation path for a folder based on its type and parent
 */
export const buildFolderPath = (
  folder: Folder,
  folders: Folder[],
  definition?: { path: string }
): string => {
  // If it's a system folder with a defined path, use that
  if (definition?.path) {
    return definition.path;
  }

  // For custom folders, determine the path based on parent system folder
  if (folder.id) {
    const parentType = getParentSystemFolder(folder.id, folders);
    
    if (parentType === "incoming") {
      return `${ROUTES.INCOMING}?folderId=${folder.id}`;
    } else if (parentType === "outgoing") {
      return `${ROUTES.OUTGOING}?folderId=${folder.id}`;
    }
  }

  // Default fallback
  return `${ROUTES.FOLDERS}?folderId=${folder.id}`;
};

/**
 * Checks if a folder is one of the system folders that should have a "Create new folder" placeholder
 */
export const isIncomingOrOutgoingFolder = (folderName: string): boolean => {
  return folderName === SYSTEM_FOLDERS.INCOMING || folderName === SYSTEM_FOLDERS.OUTGOING;
};
