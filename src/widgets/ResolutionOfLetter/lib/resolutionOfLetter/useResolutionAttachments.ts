import { useRef, useState } from "react";
import type { UploadChangeParam } from "antd/es/upload";
import { useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IAttachment } from "../../model";

/** Вложения резолюции: подгрузка из письма, массовая загрузка и удаление. */
export const useResolutionAttachments = (correspondenceId: string) => {
  // Состояния для хранения файлов
  const [uploadedFiles, setUploadedFiles] = useState<IAttachment[]>([]);

  // Реф для контроля частоты обновлений при загрузке файлов
  const uploadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Запрос данных письма для получения списка вложений
  const { isLoading: isCorrespondenceLoading } = useGetQuery({
    url: ApiRoutes.GET_CORRESPONDENCE_BY_ID.replace(":id", correspondenceId),
    options: {
      onSuccess: (response: Record<string, unknown>) => {
        const data = (response?.data || response) as Record<string, unknown>;
        const attachments = data?.attachments as IAttachment[];
        if (attachments) {
          setUploadedFiles(attachments);
        }
      },
    },
  });

  // Мутация для массовой загрузки файлов
  const { mutate: uploadFilesBulk, isPending: isUploading } = useMutationQuery({
    url: ApiRoutes.UPLOAD_CORRESPONDENCE_ATTACHMENTS_BULK.replace(":id", correspondenceId),
    method: "POST",
    queryOptions: {
      onSuccess: (response: Record<string, unknown>) => {
        const newAttachments = (response?.data || response) as IAttachment[];
        if (Array.isArray(newAttachments)) {
          setUploadedFiles((prev) => [...prev, ...newAttachments]);
        }
      },
    },
  });

  // Мутация для удаления файла
  const { mutate: deleteAttachment } = useMutationQuery({
    url: (id) =>
      ApiRoutes.DELETE_CORRESPONDENCE_ATTACHMENT.replace(":id", String(id)),
    method: "DELETE",
  });

  /**
   * Удаление файла.
   */
  const handleRemoveFile = (id: number) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    deleteAttachment(id as any);
  };

  /**
   * Обработчик загрузки новых файлов.
   */
  const handleUploadChange = (info: UploadChangeParam) => {
    const { fileList } = info;

    // Если файл удален, ничего не делаем здесь (есть handleRemoveFile)
    if (info.file.status === "removed") return;

    if (uploadTimeout.current) {
      clearTimeout(uploadTimeout.current);
    }

    // Используем небольшой таймаут, чтобы собрать файлы в один запрос,
    // если пользователь закинул сразу несколько.
    uploadTimeout.current = setTimeout(() => {
      const formData = new FormData();
      let hasNewFiles = false;

      // Собираем все файлы, у которых есть сырые данные (originFileObj)
      // и которые мы еще не отправляли
      fileList.forEach((f) => {
        if (f.originFileObj) {
          formData.append("files[]", f.originFileObj);
          hasNewFiles = true;
          // Помечаем файл как обрабатываемый, чтобы не слать повторно
          delete f.originFileObj;
        }
      });

      if (hasNewFiles) {
        uploadFilesBulk(formData as any);
      }
    }, 300);
  };

  return {
    uploadedFiles,
    isCorrespondenceLoading,
    isUploading,
    handleRemoveFile,
    handleUploadChange,
  };
};
