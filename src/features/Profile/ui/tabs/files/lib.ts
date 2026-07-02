export interface IApiFile {
  id: number;
  folder_id: number | null;
  original_name: string;
  stored_name: string;
  extension: string;
  mime: string;
  type: string;
  size: number;
  is_starred: boolean;
  meta: Record<string, any> | null;
  download_url: string;
  preview_url: string;
  created_at: string;
  updated_at: string;
}

export interface IApiFolder {
  id: number;
  name: string;
  parent_id: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ITreeNode extends IApiFolder {
  children: ITreeNode[];
}

export interface IDiskMeta {
  total_size: number;
  limit: number;
}

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileType = (ext: string): "pdf" | "image" | "spreadsheet" | "archive" | "document" => {
  const extension = ext.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(extension)) return "spreadsheet";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension)) return "image";
  if (["zip", "rar", "tar", "gz", "7z"].includes(extension)) return "archive";
  return "document";
};

export const buildTree = (folders: IApiFolder[]): ITreeNode[] => {
  const map = new Map<number, ITreeNode>();
  const roots: ITreeNode[] = [];

  folders.forEach((f) => {
    map.set(f.id, { ...f, children: [] });
  });

  folders.forEach((f) => {
    const node = map.get(f.id)!;
    if (f.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(f.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  const sortFn = (a: ITreeNode, b: ITreeNode) => (a.sort_order || 0) - (b.sort_order || 0);
  const sortTree = (nodes: ITreeNode[]) => {
    nodes.sort(sortFn);
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
};
