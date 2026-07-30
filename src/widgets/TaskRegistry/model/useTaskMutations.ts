import { useCallback } from "react";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { TaskPayload, TaskStatus } from "./types";

const invalidate = [
  ApiRoutes.GET_TASKS,
  ApiRoutes.TASKS_BOARD,
  ApiRoutes.TASKS_STATS,
];

export function useTaskMutations() {
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

  return {
    createTask,
    updateTask,
    deleteTask,
    updateStatus,
  };
}
