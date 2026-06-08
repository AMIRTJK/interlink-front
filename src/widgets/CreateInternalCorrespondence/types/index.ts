export type Status =
  | "на резолюции"
  | "на исполнении"
  | "на согласовании"
  | "на подпись"
  | "завершено";

export type LetterType = "Гузориш" | "Ариза" | "Дархост" | "Маълумотнома";

export type ImportanceLevel = "high" | "medium" | "low";

export type PageOrientation = "portrait" | "landscape";

export interface RegistryItem {
  id: string;
  inboundNumber: string;
  outboundNumber: string;
  sender: string;
  date: string;
  subject: string;
  executor?: string;
  status: Status;
  isPinned?: boolean;
  isRead: boolean;
}

export interface RecipientOption {
  id: string;
  name: string;
  org: string;
  initials: string;
  color: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: string;
  type: string;
}

export interface Approver {
  id: string;
  approvalRecordId?: string;
  isInvited?: boolean;
  name: string;
  role: string;
  initials: string;
  color: string;
  approved: boolean;
  approving: boolean;
  comment: string;
  showCommentInput: boolean;
  dsApplied: boolean;
  dsLoading: boolean;
}

export interface FinalSigner {
  id: string;
  isInvited?: boolean;
  name: string;
  role: string;
  initials: string;
  color: string;
  dsApplied: boolean;
  dsLoading: boolean;
}

export interface OrgStructureNode {
  id: string;
  name: string;
  position: string;
  initials: string;
  color: string;
  children?: OrgStructureNode[];
}
