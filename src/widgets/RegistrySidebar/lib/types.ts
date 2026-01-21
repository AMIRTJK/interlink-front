import { MenuProps } from "antd";
import type { ItemType } from "antd/es/menu/interface";

export interface Folder {
  id: number;
  name: string;
  parent_id: number | null;
  sort: number;
}

export interface FolderDefinition {
  key: string;
  path: string;
  icon: React.ReactNode;
  count?: number;
}

// Use Ant Design's ItemType directly for better compatibility
export type MenuItem = ItemType & {
  folderName?: string;
  path?: string;
  parent_id?: number | null;
};

export interface BuildMenuTreeParams {
  folders: Folder[];
  collapsed: boolean;
  definitions: Record<string, FolderDefinition>;
  handleEditClick: (folderId: number, currentName: string) => void;
  deleteFolder: (data: { id: number }) => void;
  handleAddClick: (parentId: number | null) => void;
  onNavigate: (path: string) => void;
  onDrop: (targetFolderId: number | null, draggedType: "folder" | "correspondence", draggedId: number) => void;
}

export interface FolderLabelProps {
  folder: Folder;
  folderPath: string;
  collapsed: boolean;
  definition?: FolderDefinition;
  menuActions: MenuProps["items"];
  onNavigate: (path: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDraggable: boolean;
}
