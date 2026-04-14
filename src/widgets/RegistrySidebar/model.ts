
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
  slug?: string;
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
  isInternal: boolean;
}

export interface IFolderLabelProps {
  folder: IFolder;
  folderPath: string;
  collapsed: boolean;
  definition?: IFolderDefinition;
  menuActions: MenuProps["items"];
  onNavigate: (path: string) => void;
}


