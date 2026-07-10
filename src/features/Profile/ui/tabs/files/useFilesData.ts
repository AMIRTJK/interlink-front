import { useMemo } from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IApiFile, IApiFolder, IDiskMeta } from "./lib";

interface IFilesParams {
  search?: string;
  sort?: "name" | "date" | "size";
  dir?: "asc" | "desc";
  activeFolderId?: number | "all";
  page?: number;
}

interface IFilesPaginatedData {
  current_page: number;
  data: IApiFile[];
  last_page: number;
  per_page: number;
  total: number;
}

export const useFilesData = (params: IFilesParams) => {
  const filesQuery = useGetQuery<IFilesParams, { success: boolean; data: IFilesPaginatedData }>({
    url: ApiRoutes.MY_FILES,
    params,
    useToken: true,
  });

  // 2. Get folders query
  const foldersQuery = useGetQuery<any, { success: boolean; data: IApiFolder[] }>({
    url: ApiRoutes.MY_FILE_FOLDERS,
    useToken: true,
  });

  // 3. Get storage meta query
  const metaQuery = useGetQuery<any, { success: boolean; data: IDiskMeta }>({
    url: ApiRoutes.MY_FILES_META,
    useToken: true,
  });

  // 4. Create Folder
  const createFolder = useMutationQuery<{ name: string; parent_id: number | null; sort_order?: number; emoji?: string | null; shared_user_ids?: number[] }, IApiFolder>({
    url: ApiRoutes.MY_FILE_FOLDERS,
    method: "POST",
    messages: {
      success: "Папка создана",
      invalidate: [ApiRoutes.MY_FILE_FOLDERS],
    },
  });

  // 5. Update Folder (Rename / Move)
  const updateFolder = useMutationQuery<{ id: number; name: string; parent_id: number | null; sort_order?: number; emoji?: string | null }, IApiFolder>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_ID.replace(":id", String(data.id)),
    method: "PUT",
    messages: {
      success: "Папка обновлена",
      invalidate: [ApiRoutes.MY_FILE_FOLDERS],
    },
  });

  // 6. Delete Folder
  const deleteFolder = useMutationQuery<{ id: number }, void>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_ID.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
      success: "Папка удалена",
      invalidate: [ApiRoutes.MY_FILE_FOLDERS, ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
    },
  });

  // 7. Update File (Starred, Folder ID, Meta)
  const updateFile = useMutationQuery<{ id: number; folder_id?: number | null; is_starred?: boolean; meta?: any }, IApiFile>({
    url: (data) => ApiRoutes.MY_FILES_ID.replace(":id", String(data.id)),
    method: "PUT",
    messages: {
      success: "Файл обновлен",
      invalidate: [ApiRoutes.MY_FILES],
    },
  });

  // 8. Delete File
  const deleteFile = useMutationQuery<{ id: number }, void>({
    url: (data) => ApiRoutes.MY_FILES_ID.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
      success: "Файл удален",
      invalidate: [ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
    },
  });

  // 9. Upload File
  const uploadFile = useMutationQuery<FormData, IApiFile>({
    url: ApiRoutes.MY_FILES_UPLOAD,
    method: "POST",
    messages: {
      success: "Файл успешно загружен",
      invalidate: [ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
    },
  });

  const getArrayData = (response: any): any[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    return [];
  };

  const folders = getArrayData(foldersQuery.data?.data);
  const rawFilesData = filesQuery.data?.data;
  const files: IApiFile[] = Array.isArray(rawFilesData)
    ? rawFilesData
    : rawFilesData?.data ?? [];

  const filesPagination = {
    total: rawFilesData?.total ?? 0,
    currentPage: rawFilesData?.current_page ?? 1,
    perPage: rawFilesData?.per_page ?? 30,
  };

  // 10. Get shared files
  const sharedFilesQuery = useGetQuery<IFilesParams, { success: boolean; data: { data: IApiFile[]; current_page?: number; total?: number } }>({
    url: ApiRoutes.MY_FILES_SHARED_WITH_ME,
    params,
    useToken: true,
  });

  // 11. Get shared folders
  const sharedFoldersQuery = useGetQuery<any, { success: boolean; data: IApiFolder[] }>({
    url: ApiRoutes.MY_FILE_FOLDERS_SHARED_WITH_ME,
    useToken: true,
  });

  // 12. Invite to file
  const inviteToFile = useMutationQuery<{ id: number; user_id: number }, any>({
    url: (data) => ApiRoutes.MY_FILES_INVITE.replace(":id", String(data.id)),
    method: "POST",
    messages: {
      success: "Пользователь приглашен к файлу",
    },
  });

  // 13. Remove share from file
  const removeFileShare = useMutationQuery<{ id: number; shareId: number }, any>({
    url: (data) => ApiRoutes.MY_FILES_SHARES_ID.replace(":id", String(data.id)).replace(":shareId", String(data.shareId)),
    method: "DELETE",
    messages: {
      success: "Доступ к файлу закрыт",
    },
  });

  // 14. Invite to folder
  const inviteToFolder = useMutationQuery<{ id: number; user_id: number }, any>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_INVITE.replace(":id", String(data.id)),
    method: "POST",
    messages: {
      success: "Пользователь приглашен в папку",
    },
  });

  // 15. Remove share from folder
  const removeFolderShare = useMutationQuery<{ id: number; shareId: number }, any>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_SHARES_ID.replace(":id", String(data.id)).replace(":shareId", String(data.shareId)),
    method: "DELETE",
    messages: {
      success: "Доступ к папке закрыт",
    },
  });

  const sharedFiles = getArrayData(sharedFilesQuery.data?.data);
  const sharedFolders = getArrayData(sharedFoldersQuery.data?.data);

  const getFolderIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("рабоч")) return "💼";
    if (n.includes("документ")) return "📄";
    if (n.includes("договор")) return "📑";
    if (n.includes("фото") || n.includes("изображ")) return "🖼️";
    return "📁";
  };

  const categoriesList = useMemo(() => {
    const list: { id: number | "all"; name: string; icon: string }[] = [];
    list.push({ id: "all" as const, name: "Все файлы", icon: "📁" });
    folders
      .forEach((f) => {
        list.push({
          id: f.id,
          name: f.name,
          icon: f.emoji || getFolderIcon(f.name),
        });
      });
    return list;
  }, [folders]);

  const sharedCategoriesList = useMemo(() => {
    const list: { id: number | "all"; name: string; icon: string }[] = [];
    list.push({ id: "all" as const, name: "Все общие файлы", icon: "🤝" });
    sharedFolders
      .forEach((f) => {
        list.push({
          id: f.id,
          name: f.name,
          icon: f.emoji || getFolderIcon(f.name),
        });
      });
    return list;
  }, [sharedFolders]);

  const activeCategoryId = useMemo((): number | 'all' => {
    const actId = params.activeFolderId;
    if (actId === undefined || actId === "all") return "all";

    let currentId: number | null = actId;
    let rootId: number = actId;

    while (currentId !== null) {
      const folder = folders.find((f) => Number(f.id) === Number(currentId));
      if (folder) {
        rootId = folder.id;
        currentId = folder.parent_id;
      } else {
        currentId = null;
      }
    }
    return rootId;
  }, [folders, params.activeFolderId]);

  const pinnedFiles = useMemo(() => {
    return files.filter((f) => f.is_starred);
  }, [files]);

  const currentFiles = useMemo(() => {
    const actId = params.activeFolderId;
    const parentId = actId === undefined || actId === "all" ? null : actId;
    return files.filter((f) => (f.folder_id === null && parentId === null) || (f.folder_id !== null && parentId !== null && Number(f.folder_id) === Number(parentId)));
  }, [files, params.activeFolderId]);

  const currentFolders = useMemo(() => {
    const actId = params.activeFolderId;
    const parentId = actId === undefined || actId === "all" ? null : actId;
    if (parentId === null) return [];
    return folders.filter((f) => f.parent_id !== null && Number(f.parent_id) === Number(parentId));
  }, [folders, params.activeFolderId]);



  return {
    files,
    filesPagination,
    isLoadingFiles: filesQuery.isLoading,
    refetchFiles: filesQuery.refetch,

    folders,
    isLoadingFolders: foldersQuery.isLoading,
    refetchFolders: foldersQuery.refetch,

    meta: metaQuery.data?.data || null,
    isLoadingMeta: metaQuery.isLoading,
    refetchMeta: metaQuery.refetch,

    categoriesList,
    sharedCategoriesList,
    activeCategoryId,
    pinnedFiles,
    currentFiles,
    currentFolders,

    sharedFiles,
    isLoadingSharedFiles: sharedFilesQuery.isLoading,
    refetchSharedFiles: sharedFilesQuery.refetch,

    sharedFolders,
    isLoadingSharedFolders: sharedFoldersQuery.isLoading,
    refetchSharedFolders: sharedFoldersQuery.refetch,

    createFolder,
    updateFolder,
    deleteFolder,
    updateFile,
    deleteFile,
    uploadFile,

    inviteToFile,
    removeFileShare,
    inviteToFolder,
    removeFolderShare,
  };
};
