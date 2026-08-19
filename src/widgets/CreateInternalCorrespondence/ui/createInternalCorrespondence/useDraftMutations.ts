import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { NavigateFunction } from "react-router-dom";

import { ApiRoutes } from "@shared/api";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";
import { buildFormData, useMutationQuery } from "@shared/lib";

import { mapServerAttachment } from "../../lib/utils";
import type { AttachedFile } from "../../types";

import { mergeSignedDuplicateVersions } from "./versionsLib";

interface IParams {
  id?: string | number;
  navigate: NavigateFunction;
  locationState: unknown;
  attachments: AttachedFile[];
  setAttachments: Dispatch<SetStateAction<AttachedFile[]>>;
  refetchVersions: () => Promise<any>;
  setActiveVersionId: Dispatch<SetStateAction<string | number | null>>;
}

export const useDraftMutations = ({
  id,
  navigate,
  locationState,
  attachments,
  setAttachments,
  refetchVersions,
  setActiveVersionId,
}: IParams) => {
  // После успешного сохранения файлы уже лежат на бэкенде: заменяем локальную
  // очередь списком из ответа. Иначе следующее сохранение отправит те же файлы
  // повторно и в письме появятся дубликаты.
  const syncAttachmentsAfterSave = useCallback(
    (data: any) => {
      const saved = data?.item?.attachments;
      const docId = id || data?.item?.id;
      if (Array.isArray(saved))
        setAttachments(saved.map((a: any) => mapServerAttachment(a, docId)));
      else setAttachments((prev) => prev.filter((a) => !a.file));
    },
    [id],
  );

  const { mutate: createDraft, isPending: isCreating } = useMutationQuery<any>({
    url: ApiRoutes.CREATE_INTERNAL,
    method: "POST",
    messages: { invalidate: [...CORRESPONDENCE_INVALIDATE_KEYS] },
    queryOptions: {
      onSuccess: (data: any) => {
        syncAttachmentsAfterSave(data);
        const newId = data?.item?.id;
        if (newId)
          navigate(`/modules/correspondence/internal/outgoing/${newId}`, {
            replace: true,
            state: locationState,
          });
      },
    },
  });

  // Обновление черновика создаёт на бэкенде новую версию письма — общий хвост
  // для обоих режимов сохранения (JSON и multipart, см. saveDraft ниже).
  const handleDraftUpdated = useCallback(
    (data: any) => {
      syncAttachmentsAfterSave(data);
      // 1. Сначала стягиваем свежие версии, чтобы узнать ID только что созданной
      refetchVersions().then((updatedResponse) => {
        const rawVersions = updatedResponse?.data?.data?.versions || [];
        const freshVersions = mergeSignedDuplicateVersions(rawVersions);

        if (Array.isArray(freshVersions) && freshVersions.length > 0) {
          const latestVersion = freshVersions[freshVersions.length - 1];

          if (latestVersion?.id) {
            // 2. Меняем активную версию в стейте фронтенда
            setActiveVersionId(latestVersion.id);
          }
        }
      });
    },
    [refetchVersions, syncAttachmentsAfterSave, setActiveVersionId],
  );

  const updateDraftMessages = {
    invalidate: [
      ApiRoutes.GET_INTERNAL_BY_ID.replace(":id", String(id || "")),
      ...CORRESPONDENCE_INVALIDATE_KEYS,
    ],
  };

  const { mutate: updateDraft, isPending: isUpdating } = useMutationQuery<any>({
    url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
    method: "PUT",
    messages: updateDraftMessages,
    queryOptions: { onSuccess: handleDraftUpdated },
  });

  const { mutate: updateDraftSilent } = useMutationQuery<any>({
    url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
    method: "PUT",
    messages: {
      ...updateDraftMessages,
      suppressSuccessToast: true,
    },
    queryOptions: { onSuccess: handleDraftUpdated },
  });

  // Тот же PUT, но с новыми вложениями в теле. Метод именно POST: PHP не
  // разбирает файлы в теле настоящего PUT, поэтому реальный метод уезжает
  // на бэкенд полем `_method` (см. saveDraft).
  const { mutate: updateDraftWithFiles, isPending: isUpdatingWithFiles } =
    useMutationQuery<FormData>({
      url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
      method: "POST",
      messages: updateDraftMessages,
      queryOptions: { onSuccess: handleDraftUpdated },
    });

  const { mutate: updateDraftWithFilesSilent } = useMutationQuery<FormData>({
    url: ApiRoutes.PUT_INTERNAL.replace(":id", String(id || "")),
    method: "POST",
    messages: {
      ...updateDraftMessages,
      suppressSuccessToast: true,
    },
    queryOptions: { onSuccess: handleDraftUpdated },
  });

  /**
   * Сохраняет черновик, сам выбирая формат запроса. Пока новых файлов нет —
   * шлём привычный JSON. Если есть — тот же payload уходит multipart-ом вместе
   * с файлами: отдельного эндпоинта для загрузки вложений у внутренней
   * корреспонденции нет, они принимаются прямо в создании/обновлении письма.
   */
  const saveDraft = (
    requestPayload: Record<string, any>,
    options?: { suppressToast?: boolean },
  ) => {
    const pending = attachments.filter((a) => a.file);

    if (options?.suppressToast) {
      if (!pending.length) {
        if (id) updateDraftSilent(requestPayload);
        else createDraft(requestPayload);
        return;
      }
      const form = buildFormData(requestPayload);
      pending.forEach((a) => form.append("attachments[]", a.file!));
      if (id) {
        form.append("_method", "PUT");
        updateDraftWithFilesSilent(form);
      } else {
        createDraft(form);
      }
      return;
    }

    if (!pending.length) {
      if (id) updateDraft(requestPayload);
      else createDraft(requestPayload);
      return;
    }

    const form = buildFormData(requestPayload);
    pending.forEach((a) => form.append("attachments[]", a.file!));

    if (id) {
      form.append("_method", "PUT");
      updateDraftWithFiles(form);
    } else {
      createDraft(form);
    }
  };


  // Загрузка файлов идёт тем же запросом, что и сам черновик, поэтому
  // «Сохранить» ждёт и её тоже.
  const isSaving = isCreating || isUpdating || isUpdatingWithFiles;

  return { saveDraft, isSaving };
};
