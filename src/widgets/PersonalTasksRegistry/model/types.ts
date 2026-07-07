export type TPriority = "low" | "medium" | "high" | "critical";

export type TTaskStatus = "new" | "in_progress" | "review" | "completed" | "overdue";

export interface IPersonalTask {
  id: number;
  title: string;
  description: string;
  status: TTaskStatus;
  priority: TPriority;
  progress: number;
  due_date: string;
  dueDate?: string;
  tags: string[];
  is_overdue: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPersonalTaskForm {
  title: string;
  description: string;
  status: TTaskStatus;
  priority: TPriority;
  progress: number;
  due_date: string;
  tags: string[];
}

export type TSortField = "dueDate" | "priority" | "status";

export interface ISortConfig {
  field: TSortField;
  order: "asc" | "desc";
}

export type TFilterTab = "all" | "active" | "completed" | "overdue";
