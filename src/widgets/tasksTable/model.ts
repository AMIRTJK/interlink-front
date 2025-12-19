import { TASK_STATUS, TASK_STATUS_OPTIONS } from '@features/tasks/model';

export interface IAssignee {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  phone: string;
  position: string;
  photo_path: string | null;
  full_name: string;
}

export interface ITaskItem {
  id: number;
  organization_id: number;
  created_by: number;
  title: string;
  description: string;
  status: string;
  planned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  sort_order: number;
  meta: unknown;
  created_at: string;
  updated_at: string;
  assignees: IAssignee[];
}

export interface ITasksResponse {
  success: boolean;
  message: string;
  data: ITaskItem[];
}

export { TASK_STATUS, TASK_STATUS_OPTIONS };


export 	const months = [
		"января",
		"февраля",
		"марта",
		"апреля",
		"мая",
		"июня",
		"июля",
		"августа",
		"сентября",
		"октября",
		"ноября",
		"декабря",
	];


export const PRIORITY_OPTIONS = [
    { value: "high", label: "Высокий" },
    { value: "medium", label: "Средний" },
    { value: "low", label: "Низкий" },
  ];