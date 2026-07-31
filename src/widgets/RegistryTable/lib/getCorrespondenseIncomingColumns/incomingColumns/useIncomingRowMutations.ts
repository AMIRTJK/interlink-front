import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";

/** Мутации строки реестра входящих: архив, восстановление, закрепление, удаление. */
export const useIncomingRowMutations = (isInternal?: boolean) => {
  const { mutate: archiveCorrespondence } = useMutationQuery<{
    id: number;
    is_archived: boolean;
  }>({
    url: (data) =>
      ApiRoutes.ARCHIVE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    preload: true,
    preloadConditional: [
      "correspondence.create",
      "correspondence.update",
      "correspondence.delete",
    ],
    messages: {
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  const { mutate: restoreCorrespondence } = useMutationQuery<{ id: number }>({
    url: (data) =>
      isInternal
        ? ApiRoutes.RESTORE_INTERNAL.replace(":id", String(data.id))
        : ApiRoutes.RESTORE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "POST",
    messages: {
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  const { mutate: pinCorrespondence } = useMutationQuery<{
    id: number;
    is_pinned: boolean;
  }>({
    url: (data) => ApiRoutes.PIN_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  const { mutate: deleteCorrespondence } = useMutationQuery<{ id: number }>({
    url: (data) =>
      isInternal
        ? ApiRoutes.DELETE_INTERNAL.replace(":id", String(data.id))
        : ApiRoutes.DELETE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  return {
    archiveCorrespondence,
    restoreCorrespondence,
    pinCorrespondence,
    deleteCorrespondence,
  };
};
