import { useCallback } from "react";
import { tokenControl } from "@shared/lib";
import { toast } from "@shared/lib/toast";
import { _axios, ApiRoutes } from "@shared/api";

interface IUseTaskAttachmentsProps {
  refetch: () => Promise<void>;
}

export function useTaskAttachments({ refetch }: IUseTaskAttachmentsProps) {
  const uploadAttachments = useCallback(
    async (taskId: number, files: File[]) => {
      if (!files.length) return;
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("attachments[]", file));
        const token = tokenControl.get();
        const url = ApiRoutes.TASK_ATTACHMENTS.replace(":id", String(taskId));
        await _axios.post(url, formData, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        toast.success("Вложения загружены");
        await refetch();
      } catch {
        toast.error("Не удалось загрузить вложения");
      }
    },
    [refetch],
  );

  const deleteAttachment = useCallback(
    async (taskId: number, attachmentId: number) => {
      try {
        const url = ApiRoutes.TASK_ATTACHMENT_DELETE.replace(
          ":id",
          String(taskId),
        ).replace(":attachmentId", String(attachmentId));
        const token = tokenControl.get();
        await _axios.delete(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        toast.success("Вложение удалено");
        await refetch();
      } catch {
        toast.error("Не удалось удалить вложение");
      }
    },
    [refetch],
  );

  const downloadAttachment = useCallback(
    async (taskId: number, attachmentId: number, fileName: string) => {
      try {
        const url = ApiRoutes.TASK_ATTACHMENT_DOWNLOAD.replace(
          ":id",
          String(taskId),
        ).replace(":attachmentId", String(attachmentId));
        const token = tokenControl.get();
        const response = await _axios.get(url, {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);
      } catch {
        toast.error("Не удалось скачать вложение");
      }
    },
    [],
  );

  return {
    uploadAttachments,
    deleteAttachment,
    downloadAttachment,
  };
}
