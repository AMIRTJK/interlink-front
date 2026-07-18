import { getEnvVar } from "@shared/config";

export interface IFileUser {
  id: number;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  photo_path?: string | null;
  photo_url?: string | null;
}

export interface IApiFile {
  id: number;
  user_id?: number;
  folder_id: number | null;
  folder?: {
    id: number;
    name: string;
    emoji: string | null;
  };
  owner?: IFileUser;
  original_name: string;
  stored_name: string;
  extension: string;
  mime: string;
  type: string;
  size: number;
  size_human?: string;
  is_starred: boolean;
  meta: Record<string, any> | null;
  access?: {
    is_owner: boolean;
    can_view: boolean;
    can_download: boolean;
  };
  download_url: string;
  preview_url: string;
  created_at: string;
  updated_at: string;
}

export interface IApiFolder {
  id: number;
  user_id?: number;
  name: string;
  emoji?: string | null;
  parent_id: number | null;
  sort_order: number;
  /** Number of files directly inside this folder, when provided by the backend. */
  files_count?: number;
  access?: {
    is_owner: boolean;
    can_view: boolean;
    can_download: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface ITreeNode extends IApiFolder {
  children: ITreeNode[];
}

/** Ответ каскадного удаления папки: DELETE /api/v1/my-file-folders/{id}. */
export interface IDeleteFolderResult {
  deleted_folder_id: number;
  deleted_folders_count: number;
  deleted_files_count: number;
  storage_cleanup_failed: boolean;
}

export interface ITypeBreakdownItem {
  type: string;
  count: number;
  total_size: number;
}

export interface IDiskMeta {
  // New properties from backend
  total_count?: number;
  starred_count?: number;
  storage_used_bytes?: number;
  storage_limit_bytes?: number;
  usage_pct?: number;
  type_breakdown?: ITypeBreakdownItem[];

  // Legacy/fallback properties
  total_size?: number;
  limit?: number;
}

export const resolveFilePhotoUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const apiHost = getEnvVar("VITE_API_URL") || "";
  const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${host}${p}`;
};

export const getUserFullName = (user?: IFileUser | null): string => {
  if (!user) return "—";
  return (
    user.full_name ||
    [user.last_name, user.first_name].filter(Boolean).join(" ") ||
    "—"
  );
};

export const getUserInitials = (user?: IFileUser | null): string => {
  const name = getUserFullName(user);
  if (name === "—") return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

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
