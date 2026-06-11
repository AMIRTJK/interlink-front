export type Status =
  | "на резолюции"
  | "на исполнении"
  | "на согласовании"
  | "на подпись"
  | "завершено";

// Ключи document_type из бэкенда (/internal-correspondences/meta).
// Подписи (Гузориш/Ариза/…) приходят из /meta, здесь — только ключи.
export type LetterType = "guzorish" | "ariza" | "darkhost" | "malumotnoma";

// Ключи priority из бэкенда: low / normal / high (раньше было medium)
export type ImportanceLevel = "high" | "normal" | "low";

// Элемент справочника из /meta
export interface MetaOption {
  key: string;
  label: string;
}

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
