import { useCallback, useMemo } from "react";
import { useGetQuery, tokenControl } from "@shared/lib";
import { _axios, ApiRoutes } from "@shared/api";
import type {
  Colleague,
  Task,
  TaskStatsFull,
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
import { useTaskMutations } from "./useTaskMutations";
import { useTaskAttachments } from "./useTaskAttachments";

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
  const assigneeParams = useMemo(() => ({ per_page: 100 }), []);

  const { data: assigneesRes } = useGetQuery({
    url: ApiRoutes.GET_ASSIGNEES,
    params: assigneeParams,
    useToken: true,
    options: { staleTime: 5 * 60 * 1000 },
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

  /* ---------- MUTATIONS & ATTACHMENTS ---------- */
  const { createTask, updateTask, deleteTask, updateStatus } =
    useTaskMutations();
  const { uploadAttachments, deleteAttachment, downloadAttachment } =
    useTaskAttachments({ refetch });

  /* ---------- SINGLE TASK ---------- */
  const getTaskById = useCallback(async (id: number): Promise<Task | null> => {
    try {
      const url = ApiRoutes.TASK_BY_ID.replace(":id", String(id));
      const token = tokenControl.get();
      const res = await _axios.get(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const raw = ((res.data?.data ?? res.data) as IApiTask) || null;
      return raw ? mapApiTaskToTask(raw) : null;
    } catch {
      return null;
    }
  }, []);

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
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
    uploadAttachments,
    downloadAttachment,
    deleteAttachment,
  };
};
