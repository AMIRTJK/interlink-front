import type { Dayjs } from "dayjs";

// Константы статусов задач
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// Лейблы для отображения
export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Ожидают начала',
  [TASK_STATUS.IN_PROGRESS]: 'В исполнении',
  [TASK_STATUS.COMPLETED]: 'Завершены',
} as const;

// Опции для Select компонента
export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.PENDING, label: TASK_STATUS_LABELS[TASK_STATUS.PENDING] },
  { value: TASK_STATUS.IN_PROGRESS, label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS] },
  { value: TASK_STATUS.COMPLETED, label: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED] },
];

// Интерфейс для создания задачи (API payload)
export interface CreateTaskPayload {
  title: string;
  description: string;
  status: string;
  assignees: number[];
}

// Интерфейс задачи для календаря
export interface Task {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  category?: string;
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

// Интерфейс для значений формы с dayjs объектами
export interface TaskFormValues {
  title: string;
  description?: string;
  date?: Dayjs;
  time?: Dayjs;
  status?: string;
  assignees?: number[];
}