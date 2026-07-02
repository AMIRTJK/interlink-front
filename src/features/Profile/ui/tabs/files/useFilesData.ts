import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IApiFile, IApiFolder, IDiskMeta } from "./lib";

interface IFilesParams {
  search?: string;
  sort?: "name" | "date" | "size";
  dir?: "asc" | "desc";
}

export const useFilesData = (params: IFilesParams) => {
  // 1. Get files query
  const filesQuery = useGetQuery<IFilesParams, { success: boolean; data: IApiFile[] }>({
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
  const createFolder = useMutationQuery<{ name: string; parent_id: number | null; sort_order?: number }, IApiFolder>({
    url: ApiRoutes.MY_FILE_FOLDERS,
    method: "POST",
    messages: {
      success: "Папка создана",
      invalidate: [ApiRoutes.MY_FILE_FOLDERS],
    },
  });

  // 5. Update Folder (Rename / Move)
  const updateFolder = useMutationQuery<{ id: number; name: string; parent_id: number | null; sort_order?: number }, IApiFolder>({
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

  return {
    files: getArrayData(filesQuery.data?.data),
    isLoadingFiles: filesQuery.isLoading,
    refetchFiles: filesQuery.refetch,

    folders: getArrayData(foldersQuery.data?.data),
    isLoadingFolders: foldersQuery.isLoading,
    refetchFolders: foldersQuery.refetch,

    meta: metaQuery.data?.data || null,
    isLoadingMeta: metaQuery.isLoading,
    refetchMeta: metaQuery.refetch,

    createFolder,
    updateFolder,
    deleteFolder,
    updateFile,
    deleteFile,
    uploadFile,
  };
};
