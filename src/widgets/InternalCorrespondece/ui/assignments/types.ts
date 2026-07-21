export type AssignmentPriority = "low" | "medium" | "high";
export type AssignmentStatus = "pending" | "submitted" | "done" | "returned";

export interface IAssignmentUser {
  id: number;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  position?: string;
  photo_path?: string;
}

export interface IAssignmentTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  progress: number;
  planned_at?: string;
  completed_at?: string;
}

export interface IAssignmentItem {
  id: number;
  correspondence_id: number;
  resolution_id: number;
  assigner_id: number;
  assignee_user_id: number;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  note?: string | null;
  due_at?: string | null;
  done_at?: string | null;
  result_text?: string | null;
  result_note?: string | null;
  result_submitted_at?: string | null;
  review_note?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  assigner?: IAssignmentUser;
  assignee?: IAssignmentUser;
  reviewer?: IAssignmentUser;
  task?: IAssignmentTask;
}

export interface ICreateAssignmentPayload {
  executor_user_id: number;
  text: string;
  due_at: string;
  priority: AssignmentPriority;
  note?: string;
  signature_payload?: any;
}

export interface ISubmitResultPayload {
  result_text: string;
  result_note?: string;
}

export interface IReviewPayload {
  decision: "done" | "returned";
  review_note?: string;
}
