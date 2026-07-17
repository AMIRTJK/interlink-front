import { useCallback, useMemo } from "react";
import { useGetQuery, useMutationQuery, tokenControl } from "@shared/lib";
import { toast } from "@shared/lib/toast";
import { _axios, ApiRoutes } from "@shared/api";
import type { Colleague, Task, TaskPayload, TaskStats, TaskStatus } from "./types";
import {
  extractList,
  mapApiTaskToTask,
  mapAssigneeToColleague,
  type IApiAssignee,
  type IApiStats,
  type IApiTask,
} from "./api";

/**
 * Источник данных модуля «Задачи» (общие задачи /modules/tasks).
 * Интеграция с backend /api/v1/tasks: список, исполнители, статистика,
 * создание/обновление/удаление, быстрая смена статуса и вложения.
 *
 * Фильтрация/сортировка/пагинация выполняются на клиенте в TaskListView,
 * поэтому список грузим одним запросом (per_page = 200).
 */
export const useTasks = () => {
  /* ---------- LIST ---------- */
  const {
    data: tasksRes,
    refetch,
    isLoading,
    isFetching,
  } = useGetQuery({
    url: ApiRoutes.GET_TASKS,
    params: { per_page: 200 },
    useToken: true,
    options: { keepPreviousData: true },
  });

  const tasks: Task[] = useMemo(
    () => extractList<IApiTask>(tasksRes).map(mapApiTaskToTask),
    [tasksRes],
  );

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

  const stats: TaskStats | null = useMemo(() => {
    const raw = (statsRes?.data ?? statsRes) as IApiStats | undefined;
    if (!raw || typeof raw.total !== "number") return null;
    return {
      total: raw.total,
      inProgress: raw.active ?? (raw.new + raw.in_progress + raw.review),
      completed: raw.completed,
      overdue: raw.overdue,
    };
  }, [statsRes]);

  /* ---------- MUTATIONS ---------- */
  const { mutateAsync: createMutate } = useMutationQuery<TaskPayload>({
    url: ApiRoutes.ADD_TASK,
    method: "POST",
    messages: {
      success: "Задача создана",
      error: "Ошибка при создании задачи",
      invalidate: [ApiRoutes.GET_TASKS, ApiRoutes.TASKS_STATS],
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
      invalidate: [ApiRoutes.GET_TASKS, ApiRoutes.TASKS_STATS],
    },
  });

  const { mutateAsync: deleteMutate } = useMutationQuery<number>({
    url: (id) => `${ApiRoutes.DELETE_TASK_BY_ID}${id}`,
    method: "DELETE",
    messages: {
      success: "Задача удалена",
      error: "Ошибка при удалении задачи",
      invalidate: [ApiRoutes.GET_TASKS, ApiRoutes.TASKS_STATS],
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
      invalidate: [ApiRoutes.GET_TASKS, ApiRoutes.TASKS_STATS],
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
      const formData = new FormData();
      files.forEach((file) => formData.append("attachments[]", file));
      const token = tokenControl.get();
      const url = ApiRoutes.TASK_ATTACHMENTS.replace(":id", String(taskId));
      await _axios.post(url, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      await refetch();
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
    colleagues,
    stats,
    isLoading: isLoading || isFetching,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    uploadAttachments,
    downloadAttachment,
  };
};
