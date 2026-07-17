import { useCallback, useMemo } from "react";
import { useGetQuery, useMutationQuery, tokenControl } from "@shared/lib";
import { toast } from "@shared/lib/toast";
import { _axios, ApiRoutes } from "@shared/api";
import type {
  Colleague,
  Task,
  TaskPayload,
  TaskStatsFull,
  TaskStatus,
} from "./types";
import {
  extractList,
  extractPagination,
  mapApiTaskToTask,
  mapAssigneeToColleague,
  mapBoard,
  type IApiAssignee,
  type IApiStats,
  type IApiTask,
} from "./api";
import {
  buildTaskParams,
  LIST_PAGE_SIZE,
  type TaskDisplayMode,
  type TaskFilters,
} from "./filters";

interface UseTasksOptions {
  filters: TaskFilters;
  /** Реестр открыт (не форма создания) — можно грузить список/доску. */
  active: boolean;
  displayMode: TaskDisplayMode;
  /** Текущая страница серверной пагинации списка. */
  page: number;
}

/**
 * Источник данных модуля «Задачи» (общие задачи /modules/tasks).
 * Интеграция с backend /api/v1/tasks: список, канбан-доска, исполнители,
 * статистика, CRUD, быстрая смена статуса и вложения.
 *
 * Фильтрация и сортировка выполняются на сервере — параметры собираются из
 * состояния фильтров (buildTaskParams) и уходят в query как для списка, так и
 * для доски.
 */
export const useTasks = ({
  filters,
  active,
  displayMode,
  page,
}: UseTasksOptions) => {
  const params = useMemo(() => buildTaskParams(filters), [filters]);
  const listParams = useMemo(
    () => ({ ...params, page, per_page: LIST_PAGE_SIZE }),
    [params, page],
  );
  const boardParams = useMemo(() => ({ ...params, per_page: 200 }), [params]);

  /* ---------- LIST ---------- */
  const {
    data: tasksRes,
    refetch: refetchList,
    isLoading: listLoading,
    isFetching: listFetching,
  } = useGetQuery({
    url: ApiRoutes.GET_TASKS,
    params: listParams,
    useToken: true,
    options: {
      keepPreviousData: true,
      enabled: active && displayMode === "table",
    },
  });

  const tasks: Task[] = useMemo(
    () => extractList<IApiTask>(tasksRes).map(mapApiTaskToTask),
    [tasksRes],
  );

  const pagination = useMemo(
    () => extractPagination(tasksRes, tasks.length, LIST_PAGE_SIZE),
    [tasksRes, tasks.length],
  );

  /* ---------- BOARD ---------- */
  const {
    data: boardRes,
    refetch: refetchBoard,
    isLoading: boardLoading,
    isFetching: boardFetching,
  } = useGetQuery({
    url: ApiRoutes.TASKS_BOARD,
    params: boardParams,
    useToken: true,
    options: {
      keepPreviousData: true,
      enabled: active && displayMode === "board",
    },
  });

  const board = useMemo(() => mapBoard(boardRes), [boardRes]);

  /* ---------- ASSIGNEES ---------- */
  const { data: assigneesRes } = useGetQuery({
    url: ApiRoutes.GET_ASSIGNEES,
    useToken: true,
  });

  const colleagues: Colleague[] = useMemo(
    () => extractList<IApiAssignee>(assigneesRes).map(mapAssigneeToColleague),
    [assigneesRes],
  );

  /* ---------- STATS ---------- */
  const { data: statsRes } = useGetQuery({
    url: ApiRoutes.TASKS_STATS,
    useToken: true,
  });

  const stats: TaskStatsFull | null = useMemo(() => {
    const raw = (statsRes?.data ?? statsRes) as IApiStats | undefined;
    if (!raw || typeof raw.total !== "number") return null;
    return {
      total: raw.total,
      new: raw.new ?? 0,
      in_progress: raw.in_progress ?? 0,
      review: raw.review ?? 0,
      completed: raw.completed ?? 0,
      overdue: raw.overdue ?? 0,
      active:
        raw.active ?? (raw.new ?? 0) + (raw.in_progress ?? 0) + (raw.review ?? 0),
      priority_breakdown: raw.priority_breakdown,
    };
  }, [statsRes]);

  const refetch = useCallback(async () => {
    await Promise.all([refetchList(), refetchBoard()]);
  }, [refetchList, refetchBoard]);

  const invalidate = [
    ApiRoutes.GET_TASKS,
    ApiRoutes.TASKS_BOARD,
    ApiRoutes.TASKS_STATS,
  ];

  /* ---------- MUTATIONS ---------- */
  const { mutateAsync: createMutate } = useMutationQuery<TaskPayload>({
    url: ApiRoutes.ADD_TASK,
    method: "POST",
    messages: {
      success: "Задача создана",
      error: "Ошибка при создании задачи",
      invalidate,
    },
  });

  const { mutateAsync: updateMutate } = useMutationQuery<
    TaskPayload & { id: number }
  >({
    url: (data) => `${ApiRoutes.GET_TASKS}/${data.id}`,
    method: "PUT",
    transformBody: ({ id: _id, ...rest }) => rest,
    messages: {
      success: "Задача обновлена",
      error: "Ошибка при обновлении задачи",
      invalidate,
    },
  });

  const { mutateAsync: deleteMutate } = useMutationQuery<number>({
    url: (id) => `${ApiRoutes.DELETE_TASK_BY_ID}${id}`,
    method: "DELETE",
    messages: {
      success: "Задача удалена",
      error: "Ошибка при удалении задачи",
      invalidate,
    },
  });

  const { mutateAsync: statusMutate } = useMutationQuery<{
    id: number;
    status: TaskStatus;
  }>({
    url: (data) => `${ApiRoutes.GET_TASKS}/${data.id}/status`,
    method: "PATCH",
    transformBody: ({ status }) => ({ status }),
    messages: {
      success: "Статус обновлён",
      error: "Ошибка при смене статуса",
      invalidate,
    },
  });

  const createTask = useCallback(
    (payload: TaskPayload) => createMutate(payload),
    [createMutate],
  );

  const updateTask = useCallback(
    (id: number, payload: TaskPayload) => updateMutate({ id, ...payload }),
    [updateMutate],
  );

  const deleteTask = useCallback(
    (id: number) => deleteMutate(id),
    [deleteMutate],
  );

  const updateStatus = useCallback(
    (id: number, status: TaskStatus) => statusMutate({ id, status }),
    [statusMutate],
  );

  /* ---------- ATTACHMENTS ---------- */
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
    tasks,
    pagination,
    board,
    colleagues,
    stats,
    isLoading:
      displayMode === "board"
        ? boardLoading || boardFetching
        : listLoading || listFetching,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    uploadAttachments,
    downloadAttachment,
    deleteAttachment,
  };
};
