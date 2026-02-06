import { PlusOutlined } from "@ant-design/icons";
import { MenuProps } from "antd";
import folderIcon from "../../../assets/icons/folder.svg?raw";
import {
  IFolder,
  IFolderDefinition,
  MenuItem,
  IBuildMenuTreeParams,
} from "../model";
import { buildFolderPath, canHaveSubfolders } from "./folderPathUtils";
import {
  getChildFolders,
  getRootFolders,
  sortMenuItems,
} from "./folderTreeUtils";
import { createDragHandlers } from "./dragHandlers";
import { createFolderMenuActions } from "./menuActionBuilder";
import { FolderLabel } from "./FolderLabel";
import { SystemFolderLabel } from "./SystemFolderLabel";

export type { IBuildMenuTreeParams, MenuItem, IFolder, IFolderDefinition };

export const buildMenuTree = ({
  folders,
  collapsed,
  definitions,
  handleEditClick,
  deleteFolder,
  handleAddClick,
  onNavigate,
  onDrop,
}: IBuildMenuTreeParams): MenuItem[] => {
  const dragHandlers = createDragHandlers();
  const buildFullItem = (
    folder: IFolder,
    visited = new Set<number>(),
    depth = 0,
  ): MenuItem | null => {
    if (folder.id && visited.has(folder.id)) return null;
    if (folder.name === "Полученные" || folder.name === "Отправленные") return null;
    if (folder.id) visited.add(folder.id);

    const definition = definitions[folder.name];
    const isSystemFolder = !!definition;
    const folderKey = definition ? definition.key : `folder-${folder.id}`;
    const folderPath = buildFolderPath(folder, folders, definitions, definition);

    const childFolders = getChildFolders(folder.id, folders);
    const nestedFolders = childFolders
      .map((f) => buildFullItem(f, new Set(visited), depth + 1))
      .filter(Boolean) as MenuItem[];

    let children: MenuItem[] | undefined =
      nestedFolders.length > 0 ? nestedFolders : undefined;
      
    if (folder.id && canHaveSubfolders(folder.name)) {
      const createPlaceholder: MenuItem = {
        key: `create-placeholder-${folder.id || folder.name}`,
        folderName: "Создать новую папку",
        icon: <PlusOutlined />,
        label: (
          <div className="text-[#0037AF] hover:text-[#32063bcc]">
            Добавить
          </div>
        ),
        path: "",
        parent_id: folder.id,
        onTitleClick: () => handleAddClick(folder.id),
      };

      children = children
        ? [createPlaceholder, ...children]
        : [createPlaceholder];
    }

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

    const isDraggable = !isSystemFolder;
    const handleDragStart = (e: React.DragEvent) =>
      dragHandlers.handleDragStart(e, folder.id);
    const handleDrop = (e: React.DragEvent) =>
      dragHandlers.handleDrop(e, folder.id, onDrop);

    return {
      key: folderKey,
      folderName: folder.name,
      icon: definition ? definition.icon : folderIcon,
      path: folderPath,
      children,
      onTitleClick: () => {
        if (folderPath) {
          onNavigate(folderPath);
        }
      },
      label: (
        <FolderLabel
          folder={folder}
          folderPath={folderPath}
          collapsed={depth === 0 ? collapsed : false}
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

  const rootFolders = getRootFolders(folders);
  const rootItems = rootFolders
    .map((f) => buildFullItem(f))
    .filter(Boolean) as MenuItem[];

  Object.keys(definitions).forEach((name) => {
    if (
      !rootItems.find(
        (i) => i.folderName === name || i.key === definitions[name].key,
      )
    ) {
      const def = definitions[name];
      rootItems.push({
        key: def.key,
        folderName: name,
        icon: def.icon,
        label: (
          <SystemFolderLabel
            name={name}
            definition={def}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ),
        path: def.path,
      });
    }
  });

  return sortMenuItems(rootItems);
};
