import { useCallback, useEffect } from "react";
import { ApiRoutes } from "@shared/api";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";
import { useGetQuery, useMutationQuery } from "@shared/lib";

/** Ограничения бэкенда: пустой текст отдаёт 422, длиннее — валидационную ошибку. */
export const COMMENT_MAX_LENGTH = 10000;

const COMMENTS_STALE_TIME = 60 * 1000;

export interface ICommentAuthor {
  id: number;
  full_name: string;
  position?: string | null;
  photo_path?: string | null;
  photo_url?: string | null;
}

export interface IInternalComment {
  id: number;
  correspondence_id: number;
  user_id: number;
  text: string;
  status: string;
  user: ICommentAuthor | null;
  created_at: string;
  updated_at: string;
}

interface ICommentsResponse {
  data?: IInternalComment[] | { data?: IInternalComment[] };
}

// Часть ручек отдаёт массив прямо в data, часть — пагинированный объект.
const selectComments = (response: ICommentsResponse): IInternalComment[] => {
  const payload = response?.data;
  const list = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(list)) return [];

  return [...list].sort((a, b) => {
    const diff =
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return diff !== 0 ? diff : a.id - b.id;
  });
};

interface IUseCorrespondenceCommentsArgs {
  docId?: string | number;
  isOpen: boolean;
}

/**
 * Комментарии внутреннего письма: список участников документа и отправка нового.
 * Каждый комментарий попадает и в исторический таймлайн письма (/structure),
 * поэтому после отправки инвалидируем ключи реестров и структуры.
 */
export const useCorrespondenceComments = ({
  docId,
  isOpen,
}: IUseCorrespondenceCommentsArgs) => {
  const docIdStr = docId ? String(docId) : "";
  const listUrl = docIdStr
    ? ApiRoutes.GET_INTERNAL_COMMENTS.replace(":id", docIdStr)
    : "";

  const {
    data: comments,
    isLoading,
    isError,
    refetch,
  } = useGetQuery<Record<string, never>, ICommentsResponse, IInternalComment[]>({
    url: listUrl,
    useToken: true,
    options: {
      enabled: Boolean(listUrl),
      staleTime: COMMENTS_STALE_TIME,
      refetchOnWindowFocus: false,
      select: selectComments,
    },
  });

  // Панель открывают редко, но за время работы над письмом комментарии могли
  // добавить другие участники — обновляем список на каждое открытие.
  useEffect(() => {
    if (isOpen && listUrl) refetch();
  }, [isOpen, listUrl, refetch]);

  const { mutate, isPending: isSending } = useMutationQuery<
    { text: string },
    IInternalComment
  >({
    url: ApiRoutes.CREATE_INTERNAL_COMMENT.replace(":id", docIdStr),
    method: "POST",
    messages: {
      success: "Комментарий добавлен",
      invalidate: [
        listUrl,
        ApiRoutes.GET_INTERNAL_STRUCTURE.replace(":id", docIdStr),
        ...CORRESPONDENCE_INVALIDATE_KEYS,
      ],
    },
  });

  const sendComment = useCallback(
    (text: string, onSuccess?: () => void) => {
      const trimmed = text.trim();
      if (!docIdStr || !trimmed) return;
      mutate({ text: trimmed }, { onSuccess: () => onSuccess?.() });
    },
    [docIdStr, mutate],
  );

  return {
    comments: comments ?? [],
    isLoading,
    isError,
    refetch,
    sendComment,
    isSending,
  };
};
