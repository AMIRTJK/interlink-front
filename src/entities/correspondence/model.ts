export enum CorrespondenseStatus {
  DRAFT = "draft",
  TO_REGISTER = "to_register",
  TO_VISA = "to_visa",
  TO_EXECUTE = "to_execute",
  TO_APPROVE = "to_approve",
  TO_SIGN = "to_sign",
  DONE = "done",
  CANCELLED = "cancelled",
}

export interface CorrespondenceResponse {
  id: number;
  organization_id: number;
  creator_id: number;
  kind: "incoming" | "outgoing";
  channel: "paper" | "email" | "system";

  reg_prefix: string | null;
  reg_year: number | null;
  reg_seq: number | null;
  reg_number: string | null;

  doc_date: string; // YYYY-MM-DD
  registered_at: string | null;

  subject: string;
  body: string | null;

  sender_name: string | null;
  sender_contact: string | null;
  recipient_name: string | null;
  recipient_contact: string | null;

  status: CorrespondenseStatus;
  priority: "low" | "medium" | "high";

  due_at: string | null;

  is_archived: boolean;
  is_pinned: boolean;

  folder_id: number | null;
  folder: Folder | null;

  leader_id: number | null;
  leader: User | null;

  sent_at: string | null;
  sent_to_leader_at: string | null;
  tracking_number: string | null;

  deleted_at: string | null;

  created_at: string;
  updated_at: string;

  creator: User;

  attachments: Attachment[];
  assignments: Assignment[];
  resolutions: Resolution[];
}

export interface CreateInternalRequest {
  subject: string;
  body: string;
  recipients: {
    to: number[];
  };
}
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  photo_path: string | null;
  full_name: string;
}

export interface Assignment {
  id: number;
  correspondence_id: number;
  resolution_id: number;

  assigner_id: number;
  assignee_user_id: number | null;
  assignee_department_id: number | null;

  status: "pending" | "done";

  due_at: string | null;
  done_at: string | null;

  note: string;

  created_at: string;
  updated_at: string;

  assignee_user: User | null;
  assignee_department: Department | null;

  assigner: User;
}

export interface Resolution {
  id: number;
  correspondence_id: number;
  author_id: number;

  text: string;
  due_at: string | null;
  status: "pending" | "done";

  created_at: string;
  updated_at: string;

  author: User;
}

export interface Department {
  id: number;
  name: string;
}

export interface Folder {
  id: number;
  name: string;
}

export interface Attachment {
  id: number;
  name: string;
  path: string;
  size: number;
  mime_type: string;
}

export interface CreateAssignmentRequest {
  resolution_id: number;

  assignee_departments: number[];
  assignee_users: number[];

  note: string;
  due_at: string | null;
}
