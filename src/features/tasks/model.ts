import type { Dayjs } from "dayjs";

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]: 'Ожидают начала1',
  [TASK_STATUS.IN_PROGRESS]: 'В исполнении',
  [TASK_STATUS.COMPLETED]: 'Завершены',
} as const;

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.PENDING, label: TASK_STATUS_LABELS[TASK_STATUS.PENDING] },
  { value: TASK_STATUS.IN_PROGRESS, label: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS] },
  { value: TASK_STATUS.COMPLETED, label: TASK_STATUS_LABELS[TASK_STATUS.COMPLETED] },
];

export interface ICreateTaskPayload {
  title: string;
  description: string;
  status: string;
  assignees: number[];
}

export interface IParticipant {
  id: number;
  full_name: string;
  photo_path: string | null;
  permission_names?: string[];
}

export interface IEventResponse {
  id: number;
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  color: string;
  status: string;
  participants: IParticipant[];
  created_at: string;
  updated_at: string;
}

export interface ICreateEventPayload {
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  color: string;
  status: string;
  participants: number[];
}

export interface ITask {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  endTime?: string;
  category?: string;
  color?: string;
  participants?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface ITaskFormValues {
  title: string;
  description?: string;
  date?: Dayjs;
  time?: Dayjs;
  status?: string;
  assignees?: number[];
  color?: string;
  endTime?: Dayjs;
}

 export const colors = [
    { name: "Желтый", value: "#FFCB33" },
    { name: "Зеленный", value: "#29CC39" },
    { name: "Оранжевый", value: "#FF6633" },
    { name: "Бронзовый", value: "#CC7429" },
    { name: "Пурпурный", value: "#8833FF" },
    { name: "Бирюзово-синий", value: "#33BFFF" },
    { name: "Розовый", value: "#E62E7B" },
    { name: "Тиффани", value: "#2EE6CA" },
  ];


  export interface IRenderFields {
  isEvent?: boolean;
  isEdit?: boolean;
  isSelectOpen: boolean;
  setIsSelectOpen: (open: boolean) => void;
  handleChangeStatusSelectOption: (e: React.MouseEvent<HTMLDivElement>) => void;
  defaultColor?: string;
  colors: { name: string; value: string }[];
}