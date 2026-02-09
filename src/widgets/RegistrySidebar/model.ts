
import { MenuProps } from "antd";

export interface IFolder {
  id: number;
  name: string;
  parent_id: number | null;
  sort: number;
}

export interface IFolderDefinition {
  key: string;
  path: string;
  icon: React.ReactNode;
  count?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MenuItem = any;

export interface IBuildMenuTreeParams {
  folders: IFolder[];
  collapsed: boolean;
  definitions: Record<string, IFolderDefinition>;
  handleEditClick: (folderId: number, currentName: string) => void;
  deleteFolder: (data: { id: number }) => void;
  handleAddClick: (parentId: number | null) => void;
  onNavigate: (path: string) => void;
  onDrop: (targetFolderId: number | null, draggedType: "folder" | "correspondence", draggedId: number) => void;
}

export interface IFolderLabelProps {
  folder: IFolder;
  folderPath: string;
  collapsed: boolean;
  definition?: IFolderDefinition;
  menuActions: MenuProps["items"];
  onNavigate: (path: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDraggable: boolean;
}


