import { useCallback, useMemo } from "react";
import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { extractCorrespondenceUserContext } from "./lib";
import {
  EMPTY_CORRESPONDENCE_USER_STATUSES,
  type ICorrespondenceUserContext,
  type TCorrespondenceAction,
  type TCorrespondenceRole,
} from "./model";

interface IOptions {
  /**
   * Уже загруженный ответ GET /internal-correspondences/:id. Если в нём есть
   * current_user_context — отдельный запрос за правами не делаем.
   */
  source?: unknown;
  enabled?: boolean;
}

/** Ключ кэша прав по документу — для инвалидации после действий над письмом. */
export const correspondencePermissionsKey = (id: string | number) =>
  ApiRoutes.GET_INTERNAL_PERMISSIONS.replace(":id", String(id));

/**
 * Динамическая роль текущего пользователя в конкретном документе и список
 * разрешённых ему действий.
 *
 * `can()` при неизвестном контексте возвращает true: пока бэкенд не отдал
 * контекст (старая версия API, ошибка сети), интерфейс работает как раньше, а
 * отказ всё равно придёт с сервера. Как только контекст получен — он решает.
 */
export const useCorrespondenceUserContext = (
  correspondenceId?: string | number | null,
  options?: IOptions,
) => {
  const { source, enabled = true } = options ?? {};

  const inlineContext = useMemo(
    () => extractCorrespondenceUserContext(source),
    [source],
  );

  const documentId = correspondenceId == null ? "" : String(correspondenceId);
  const shouldFetch = enabled && !!documentId && !inlineContext;

  const { data, isLoading, refetch } = useGetQuery({
    url: shouldFetch ? correspondencePermissionsKey(documentId) : "",
    useToken: true,
    options: { enabled: shouldFetch, refetchOnWindowFocus: false },
  });

  const fetchedContext = useMemo(
    () => extractCorrespondenceUserContext(data, { allowBareBody: true }),
    [data],
  );

  const context: ICorrespondenceUserContext | null =
    inlineContext ?? fetchedContext;

  const can = useCallback(
    (action: TCorrespondenceAction) => {
      if (!context) return true;
      return context.allowed_actions[action] === true;
    },
    [context],
  );

  const hasRole = useCallback(
    (role: TCorrespondenceRole) => context?.roles.includes(role) ?? false,
    [context],
  );

  return {
    context,
    isResolved: !!context,
    isLoading: shouldFetch && isLoading,
    refetch,
    can,
    hasRole,
    primaryRole: context?.primary_role ?? null,
    roles: context?.roles ?? [],
    statuses: context?.statuses ?? EMPTY_CORRESPONDENCE_USER_STATUSES,
    isSender: hasRole("SENDER"),
    isRecipient: hasRole("RECIPIENT"),
    isApprover: hasRole("APPROVER"),
    isSigner: hasRole("SIGNER"),
    isVisor: hasRole("VISOR"),
    isAssignee: hasRole("ASSIGNEE"),
    isAssigner: hasRole("ASSIGNER"),
    isParticipant: hasRole("PARTICIPANT"),
  };
};

export type TCorrespondenceUserContextResult = ReturnType<
  typeof useCorrespondenceUserContext
>;
