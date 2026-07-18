import { useMemo } from "react";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { toast } from "@shared/lib/toast";
import { ApiRoutes } from "@shared/api";
import { IApiFile, IApiFolder, IDeleteFolderResult, IDiskMeta } from "./lib";

// Page size used by the "counts" queries. These fetch files without a folder
// filter so we can show the grand total and per-folder counts regardless of
// which folder is currently selected. Capped at 100 because the backend
// rejects a larger `per_page` (422). The grand-total badge stays exact
// regardless (it reads the paginator `total`, not the array length); per-folder
// badges are derived from the returned page and prefer a backend `files_count`
// when present.
const COUNT_FETCH_SIZE = 100;

// Group files by their direct folder to get a per-folder file count.
const buildFolderFileCounts = (items: IApiFile[]): Record<number, number> =>
  items.reduce<Record<number, number>>((acc, file) => {
    if (file.folder_id != null) {
      acc[file.folder_id] = (acc[file.folder_id] ?? 0) + 1;
    }
    return acc;
  }, {});

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

  // 3.1. Personal files counts: fetched without a folder filter so the "Все
  // файлы" badge shows the grand total and each folder chip shows its own
  // count, independent of the selected folder / current page.
  const filesCountQuery = useGetQuery<{ per_page: number }, { success: boolean; data: IFilesPaginatedData }>({
    url: ApiRoutes.MY_FILES,
    params: { per_page: COUNT_FETCH_SIZE },
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

  // 6. Delete Folder (каскадное удаление: папка + вложенные папки/файлы + доступы)
  const deleteFolder = useMutationQuery<{ id: number }, IDeleteFolderResult>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_ID.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
      // success-тост формируем вручную из ответа сервера (со счётчиками).
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.MY_FILE_FOLDERS, ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
      onSuccessCb: (data?: IDeleteFolderResult) => {
        const folders = data?.deleted_folders_count ?? 1;
        const files = data?.deleted_files_count ?? 0;
        toast.success(`Удалено: папок — ${folders}, файлов — ${files}`);
        if (data?.storage_cleanup_failed) {
          toast.warning(
            "Часть файлов не удалось очистить из хранилища. Обратитесь к администратору.",
          );
        }
      },
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
  const { activeFolderId: sharedFolderId, ...sharedBaseParams } = params;
  const sharedFilesParams = {
    ...sharedBaseParams,
    ...(typeof sharedFolderId === "number" ? { folder_id: sharedFolderId } : {}),
  };

  const sharedFilesQuery = useGetQuery<typeof sharedFilesParams, { success: boolean; data: { data: IApiFile[]; current_page?: number; total?: number; per_page?: number } }>({
    url: ApiRoutes.MY_FILES_SHARED_WITH_ME,
    params: sharedFilesParams,
    useToken: true,
  });

  // 11. Get shared folders
  const sharedFoldersQuery = useGetQuery<any, { success: boolean; data: IApiFolder[] }>({
    url: ApiRoutes.MY_FILE_FOLDERS_SHARED_WITH_ME,
    useToken: true,
  });

  // 11.1. Shared files counts: fetched without a folder filter so the "Все
  // общие файлы" badge shows the total across all shared folders and each
  // shared folder chip shows its own count, regardless of the selected folder.
  const sharedFilesCountQuery = useGetQuery<{ per_page: number }, { success: boolean; data: { data: IApiFile[]; total?: number } }>({
    url: ApiRoutes.MY_FILES_SHARED_WITH_ME,
    params: { per_page: COUNT_FETCH_SIZE },
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

  const rawSharedFilesData = sharedFilesQuery.data?.data;
  const sharedFiles = getArrayData(rawSharedFilesData);
  const sharedFolders = getArrayData(sharedFoldersQuery.data?.data);

  const sharedFilesPagination = {
    total: rawSharedFilesData?.total ?? 0,
    currentPage: rawSharedFilesData?.current_page ?? 1,
    perPage: rawSharedFilesData?.per_page ?? 30,
  };

  // Grand totals and per-folder counts derived from the unfiltered counts
  // queries. Keyed on the query `data` reference (stable until data changes)
  // so the category lists don't recompute on every render.
  const allFilesList = useMemo(
    () => getArrayData(filesCountQuery.data?.data),
    [filesCountQuery.data],
  );
  const allFilesCount = filesCountQuery.data?.data?.total ?? allFilesList.length;
  const folderFileCounts = useMemo(() => buildFolderFileCounts(allFilesList), [allFilesList]);

  const allSharedFilesList = useMemo(
    () => getArrayData(sharedFilesCountQuery.data?.data),
    [sharedFilesCountQuery.data],
  );
  const allSharedFilesCount = sharedFilesCountQuery.data?.data?.total ?? allSharedFilesList.length;
  const sharedFolderFileCounts = useMemo(
    () => buildFolderFileCounts(allSharedFilesList),
    [allSharedFilesList],
  );

  const getFolderIcon = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("рабоч")) return "💼";
    if (n.includes("документ")) return "📄";
    if (n.includes("договор")) return "📑";
    if (n.includes("фото") || n.includes("изображ")) return "🖼️";
    return "📁";
  };

  const categoriesList = useMemo(() => {
    const list: { id: number | "all"; name: string; icon: string; count: number }[] = [];
    list.push({ id: "all" as const, name: "Все файлы", icon: "📁", count: allFilesCount });
    folders
      .forEach((f) => {
        list.push({
          id: f.id,
          name: f.name,
          icon: f.emoji || getFolderIcon(f.name),
          count: f.files_count ?? folderFileCounts[f.id] ?? 0,
        });
      });
    return list;
  }, [folders, allFilesCount, folderFileCounts]);

  const sharedCategoriesList = useMemo(() => {
    const list: { id: number | "all"; name: string; icon: string; count: number }[] = [];
    list.push({ id: "all" as const, name: "Все общие файлы", icon: "🤝", count: allSharedFilesCount });
    sharedFolders
      .forEach((f) => {
        list.push({
          id: f.id,
          name: f.name,
          icon: f.emoji || getFolderIcon(f.name),
          count: f.files_count ?? sharedFolderFileCounts[f.id] ?? 0,
        });
      });
    return list;
  }, [sharedFolders, allSharedFilesCount, sharedFolderFileCounts]);

  const activeCategoryId = useMemo((): number | 'all' => {
    const actId = params.activeFolderId;
    if (actId === undefined || actId === "all") return "all";
    // Highlight exactly the folder that is selected. Folders are shown as a
    // flat list of chips (including subfolders), so each chip must select
    // itself — resolving to the root ancestor would highlight the wrong chip
    // when two folders share a name / a subfolder is picked.
    return actId;
  }, [params.activeFolderId]);

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
    sharedFilesPagination,
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
