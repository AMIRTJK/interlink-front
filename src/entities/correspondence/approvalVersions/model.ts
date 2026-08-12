/** Пользователь в сводке версий согласования. */
export interface IApprovalVersionUser {
  id: number | string;
  full_name?: string | null;
  position?: string | null;
  photo_path?: string | null;
  photo_url?: string | null;
}

/** Решение одного согласующего с версией, на которой оно принято. */
export interface IApprovalVersionDecision {
  approval_id: number | string;
  status?: string | null;
  version_id?: number | string | null;
  version?: string | null;
  version_number?: string | null;
  decided_at?: string | null;
  note?: string | null;
  approver?: IApprovalVersionUser | null;
}

/** Версия документа с количеством согласовавших её участников. */
export interface IApprovalVersionEntry {
  version_id: number | string;
  version?: string | null;
  version_number?: string | null;
  approved_count?: number;
  approvers?: IApprovalVersionDecision[];
}

/** Версия, выбранная для подписи, и её расхождение с согласованиями. */
export interface IApprovalSelectedVersion {
  version_id?: number | string | null;
  version?: string | null;
  version_number?: string | null;
  approved_count?: number;
  approved_on_other_versions_count?: number;
  has_version_mismatch?: boolean;
}

/** `approval_version_summary` из show / workflow / versions / structure. */
export interface IApprovalVersionSummary {
  total_approvers?: number;
  decided_count?: number;
  approved_count?: number;
  selected_version?: IApprovalSelectedVersion | null;
  approvers?: IApprovalVersionDecision[];
  versions?: IApprovalVersionEntry[];
}

/** Минимум полей записи согласования, из которых читается её версия. */
export interface IApprovalVersionSource {
  id?: number | string;
  approval_id?: number | string;
  status?: string | null;
  version_id?: number | string | null;
  version?: string | null;
  version_number?: string | null;
}

/** Согласующие, одобрившие одну и ту же версию. */
export interface IApprovalVersionGroup {
  versionId: number | string | null;
  label: string;
  count: number;
  approverNames: string[];
}

/** Разбор расхождения версий для предупреждения перед согласованием. */
export interface IApprovalVersionWarning {
  /** Есть ли согласования на версиях, отличных от целевой. */
  hasMismatch: boolean;
  /** Версия, которую пользователь собирается согласовать. */
  targetLabel: string;
  /** Сколько участников уже согласовали именно эту версию. */
  matchedCount: number;
  /** Сколько участников согласовали другие версии. */
  mismatchedCount: number;
  /** Разбивка по остальным версиям, от большей группы к меньшей. */
  groups: IApprovalVersionGroup[];
}

export const APPROVED_STATUS = "approved";

/** Версия у согласований, сделанных до внедрения их учёта на бэкенде. */
export const UNKNOWN_VERSION_LABEL = "версия не зафиксирована";
