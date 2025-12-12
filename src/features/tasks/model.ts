export interface CreateTaskPayload {
  title: string;
  description: string;
  status: string;
  assignees: number[];
}