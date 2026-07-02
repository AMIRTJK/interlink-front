import { useState, useCallback } from "react";
import { INITIAL_TASKS, MOCK_COLLEAGUES } from "./mock";
import type { Colleague, Task } from "./types";

/**
 * Источник данных модуля «Задачи».
 *
 * Сейчас работает на mock-данных (локальный стейт). Компоненты обращаются только
 * к этому хуку, поэтому переход на реальное API = переписать ТОЛЬКО этот файл:
 *   - `tasks`      → useGetQuery(ApiRoutes.GET_TASKS) + маппер ITaskItem → Task
 *   - `colleagues` → useGetQuery(ApiRoutes.GET_ASSIGNEES)
 *   - `addTask`    → useMutationQuery(POST ApiRoutes.ADD_TASK) + invalidate
 *
 * ЧЕГО НЕ ХВАТАЕТ В ТЕКУЩЕМ API (/api/v1/tasks, модель ITaskItem) для дизайна —
 * вынести в задачу бэкенду:
 *   - `priority` (low/medium/high/critical) — в ITaskItem нет;
 *   - `tags: string[]` — нет;
 *   - `progress: number` — нет;
 *   - `attachments[]` — нет;
 *   - один `assignee` для карточки — в API массив `assignees[]` (нужно правило
 *     выбора основного исполнителя, либо отображать нескольких);
 *   - срок: в дизайне `dueDate`, в API `planned_at` (уточнить соответствие);
 *   - статусы: в дизайне new/in_progress/review/completed/overdue — сверить со
 *     справочником TASK_STATUS на бэкенде;
 *   - «Протокол» (председатель/секретарь/участники/подпункты/ЭЦП-подписи) —
 *     отдельной сущности/эндпоинтов в API пока нет.
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const colleagues: Colleague[] = MOCK_COLLEAGUES;

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  return { tasks, colleagues, addTask };
};
