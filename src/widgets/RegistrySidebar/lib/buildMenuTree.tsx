import { PlusOutlined } from "@ant-design/icons";
import { MenuProps } from "antd";
import folderIcon from "../../../assets/icons/folder-icon.svg";
import { Folder, FolderDefinition, MenuItem, BuildMenuTreeParams } from "./types";
import { buildFolderPath, isIncomingOrOutgoingFolder } from "./folderPathUtils";
import { getChildFolders, getRootFolders, sortMenuItems } from "./folderTreeUtils";
import { createDragHandlers } from "./dragHandlers";
import { createFolderMenuActions } from "./menuActionBuilder";
import { FolderLabel } from "./FolderLabel";
import { SystemFolderLabel } from "./SystemFolderLabel";

export type { BuildMenuTreeParams, MenuItem, Folder, FolderDefinition };

export const buildMenuTree = ({
  folders,
  collapsed,
  definitions,
  handleEditClick,
  deleteFolder,
  handleAddClick,
  onNavigate,
  onDrop,
}: BuildMenuTreeParams): MenuItem[] => {
  const dragHandlers = createDragHandlers();

  /**
   * Recursively builds a menu item for a folder and its children
   */
  const buildFullItem = (folder: Folder, visited = new Set<number>(), depth = 0): MenuItem | null => {
    // Prevent circular references
    if (folder.id && visited.has(folder.id)) return null;
    if (folder.id) visited.add(folder.id);

    const definition = definitions[folder.name];
    const isSystemFolder = !!definition;
    const folderKey = definition ? definition.key : `folder-${folder.id}`;
    const folderPath = buildFolderPath(folder, folders, definition);

    // Build children recursively
    const childFolders = getChildFolders(folder.id, folders);
    const nestedFolders = childFolders
      .map((f) => buildFullItem(f, new Set(visited), depth + 1))
      .filter(Boolean) as MenuItem[];

    let children: MenuItem[] | undefined = nestedFolders.length > 0 ? nestedFolders : undefined;

    // Add "Create new folder" placeholder for Incoming/Outgoing folders
    if (isIncomingOrOutgoingFolder(folder.name)) {
      const createPlaceholder: MenuItem = {
        key: `create-placeholder-${folder.id || folder.name}`,
        folderName: "Создать новую папку",
        icon: <PlusOutlined />,
        label: <span className="text-[#0037AF] font-medium">Создать новую папку</span>,
        path: "",
        parent_id: folder.id || null,
      };
      children = children ? [createPlaceholder, ...children] : [createPlaceholder];
    }

    // Create context menu actions for custom folders
    const menuActions: MenuProps["items"] = isSystemFolder
      ? []
      : createFolderMenuActions({
          folderId: folder.id,
          folderName: folder.name,
          depth,
          handleEditClick,
          handleAddClick,
          deleteFolder,
        });

    // Create drag handlers
    const isDraggable = !isSystemFolder;
    const handleDragStart = (e: React.DragEvent) => dragHandlers.handleDragStart(e, folder.id);
    const handleDrop = (e: React.DragEvent) => dragHandlers.handleDrop(e, folder.id, onDrop);

    return {
      key: folderKey,
      folderName: folder.name,
      icon: definition ? definition.icon : <img src={folderIcon} />,
      path: folderPath,
      children,
      onTitleClick: () => {
        // Ant Design Menu workaround if needed
      },
      label: (
        <FolderLabel
          folder={folder}
          folderPath={folderPath}
          collapsed={collapsed}
          definition={definition}
          menuActions={menuActions}
          onNavigate={onNavigate}
          onDragStart={handleDragStart}
          onDragOver={dragHandlers.handleDragOver}
          onDragLeave={dragHandlers.handleDragLeave}
          onDrop={handleDrop}
          isDraggable={isDraggable}
        />
      ),
    };
  };

  // Build root-level items
  const rootFolders = getRootFolders(folders);
  const rootItems = rootFolders.map((f) => buildFullItem(f)).filter(Boolean) as MenuItem[];

  // Add missing system folders (if they don't exist in DB)
  Object.keys(definitions).forEach((name) => {
    if (!rootItems.find((i) => i.folderName === name || i.key === definitions[name].key)) {
      const def = definitions[name];
      rootItems.push({
        key: def.key,
        folderName: name,
        icon: def.icon,
        label: <SystemFolderLabel name={name} definition={def} collapsed={collapsed} onNavigate={onNavigate} />,
        path: def.path,
      });
    }
  });

  // Sort items according to predefined order
  return sortMenuItems(rootItems);
};
