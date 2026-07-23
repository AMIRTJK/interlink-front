import { useMemo, Dispatch, SetStateAction } from "react";
import { useMutationQuery } from "@shared/lib";
import { toast } from "@shared/lib/toast";
import { ApiRoutes } from "@shared/api";
import { IApiFile, IApiFolder, IDeleteFolderResult } from "./lib";

export const useFilesMutations = (
  setManualOrderMap: Dispatch<SetStateAction<Record<number, number>>>,
) => {
  const createFolder = useMutationQuery<{ name: string; parent_id: number | null; sort_order?: number; emoji?: string | null; shared_user_ids?: number[] }, IApiFolder>({
    url: ApiRoutes.MY_FILE_FOLDERS,
    method: "POST",
    messages: {
      success: "Папка создана",
      invalidate: [ApiRoutes.MY_FILE_FOLDERS],
    },
  });

  const updateFolder = useMutationQuery<{ id: number; name: string; parent_id: number | null; sort_order?: number; emoji?: string | null }, IApiFolder>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_ID.replace(":id", String(data.id)),
    method: "PUT",
    messages: {
      success: "Папка обновлена",
      invalidate: [ApiRoutes.MY_FILE_FOLDERS],
    },
  });

  const deleteFolder = useMutationQuery<{ id: number }, IDeleteFolderResult>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_ID.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.MY_FILE_FOLDERS, ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
      onSuccessCb: (data?: IDeleteFolderResult) => {
        const foldersCount = data?.deleted_folders_count ?? 1;
        const filesCount = data?.deleted_files_count ?? 0;
        toast.success(`Удалено: папок — ${foldersCount}, файлов — ${filesCount}`);
        if (data?.storage_cleanup_failed) {
          toast.warning(
            "Часть файлов не удалось очистить из хранилища. Обратитесь к администратору.",
          );
        }
      },
    },
  });

  const updateFile = useMutationQuery<{ id: number; folder_id?: number | null; is_starred?: boolean; meta?: any }, IApiFile>({
    url: (data) => ApiRoutes.MY_FILES_ID.replace(":id", String(data.id)),
    method: "PUT",
    messages: {
      success: "Файл обновлен",
      invalidate: [ApiRoutes.MY_FILES],
    },
  });

  const deleteFile = useMutationQuery<{ id: number }, void>({
    url: (data) => ApiRoutes.MY_FILES_ID.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
      success: "Файл удален",
      invalidate: [ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
    },
  });

  const uploadFile = useMutationQuery<FormData, IApiFile>({
    url: ApiRoutes.MY_FILES_UPLOAD,
    method: "POST",
    messages: {
      success: "Файл успешно загружен",
      invalidate: [ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
    },
  });

  const reorderFilesMutation = useMutationQuery<
    { folder_id: number | null; file_ids: number[] },
    { success: boolean; message: string; data: any }
  >({
    url: ApiRoutes.MY_FILES_ORDER,
    method: "PATCH",
    messages: {
      success: "Порядок файлов сохранен",
      invalidate: [ApiRoutes.MY_FILES],
    },
  });

  const reorderFiles = useMemo(() => ({
    ...reorderFilesMutation,
    mutate: (variables: { folder_id: number | null; file_ids: number[] }) => {
      if (variables?.file_ids) {
        setManualOrderMap((prev) => {
          const next = { ...prev };
          variables.file_ids.forEach((id, idx) => {
            next[id] = idx;
          });
          return next;
        });
      }
      return reorderFilesMutation.mutate(variables);
    },
    mutateAsync: async (variables: { folder_id: number | null; file_ids: number[] }) => {
      if (variables?.file_ids) {
        setManualOrderMap((prev) => {
          const next = { ...prev };
          variables.file_ids.forEach((id, idx) => {
            next[id] = idx;
          });
          return next;
        });
      }
      return reorderFilesMutation.mutateAsync(variables);
    },
  }), [reorderFilesMutation, setManualOrderMap]);

  const inviteToFile = useMutationQuery<{ id: number; user_id: number }, any>({
    url: (data) => ApiRoutes.MY_FILES_INVITE.replace(":id", String(data.id)),
    method: "POST",
    messages: {
      suppressSuccessToast: true,
    },
  });

  const inviteToFolder = useMutationQuery<{ id: number; user_id: number }, any>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_INVITE.replace(":id", String(data.id)),
    method: "POST",
    messages: {
      suppressSuccessToast: true,
    },
  });

  const bulkShareFiles = useMutationQuery<
    { file_ids: number[]; user_ids: number[]; can_download?: boolean },
    {
      success: boolean;
      message: string;
      data: {
        file_ids: number[];
        user_ids: number[];
        files_count: number;
        users_count: number;
        share_links_count: number;
        created_share_links_count: number;
        existing_share_links_count: number;
        can_download: boolean;
      };
    }
  >({
    url: ApiRoutes.MY_FILES_BULK_SHARE,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.MY_FILES],
    },
  });

  const bulkDeleteFiles = useMutationQuery<
    { file_ids: number[] },
    {
      success: boolean;
      message: string;
      data: {
        deleted_file_ids: number[];
        deleted_files_count: number;
        storage_cleanup_failed: boolean;
      };
    }
  >({
    url: ApiRoutes.MY_FILES_BULK_DELETE,
    method: "DELETE",
    messages: {
      suppressSuccessToast: true,
      invalidate: [ApiRoutes.MY_FILES, ApiRoutes.MY_FILES_META],
    },
  });

  const removeFileShare = useMutationQuery<{ id: number; shareId: number }, any>({
    url: (data) => ApiRoutes.MY_FILES_SHARES_ID.replace(":id", String(data.id)).replace(":shareId", String(data.shareId)),
    method: "DELETE",
    messages: {
      success: "Доступ к файлу закрыт",
    },
  });

  const removeFolderShare = useMutationQuery<{ id: number; shareId: number }, any>({
    url: (data) => ApiRoutes.MY_FILE_FOLDERS_SHARES_ID.replace(":id", String(data.id)).replace(":shareId", String(data.shareId)),
    method: "DELETE",
    messages: {
      success: "Доступ к папке закрыт",
    },
  });

  return {
    createFolder,
    updateFolder,
    deleteFolder,
    updateFile,
    deleteFile,
    uploadFile,
    reorderFiles,
    inviteToFile,
    inviteToFolder,
    bulkShareFiles,
    bulkDeleteFiles,
    removeFileShare,
    removeFolderShare,
  };
};
