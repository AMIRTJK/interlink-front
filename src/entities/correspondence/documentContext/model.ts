/**
 * Контекстные (динамические) роли участника внутренней корреспонденции.
 *
 * Они не имеют отношения к глобальному RBAC: один и тот же пользователь может
 * быть SENDER в одном документе и RECIPIENT в другом, а super_admin в документе,
 * где он получатель, остаётся RECIPIENT. Источник — current_user_context
 * из GET /internal-correspondences/:id и GET /internal-correspondences/:id/permissions.
 */
export const CORRESPONDENCE_ROLES = [
  "SENDER",
  "RECIPIENT",
  "APPROVER",
  "SIGNER",
  "VISOR",
  "ASSIGNEE",
  "ASSIGNER",
  "PARTICIPANT",
] as const;

export type TCorrespondenceRole = (typeof CORRESPONDENCE_ROLES)[number];

export const CORRESPONDENCE_ROLE_LABELS: Record<TCorrespondenceRole, string> = {
  SENDER: "Отправитель",
  RECIPIENT: "Получатель",
  APPROVER: "Согласующий",
  SIGNER: "Подписывающий",
  VISOR: "Визирующий",
  ASSIGNEE: "Исполнитель",
  ASSIGNER: "Постановщик поручения",
  PARTICIPANT: "Участник",
};

export const CORRESPONDENCE_ACTIONS = [
  "view",
  "edit",
  "send",
  "approve",
  "return_from_approval",
  "sign",
  "decline_signature",
  "cancel_signature",
  "acknowledge",
  "reply",
  "forward",
  "invite_visor",
  "create_assignment",
] as const;

export type TCorrespondenceAction = (typeof CORRESPONDENCE_ACTIONS)[number];

/** Флаги ролей в ответе бэкенда: is_sender, is_recipient и т.д. */
export const CORRESPONDENCE_ROLE_FLAGS: Record<TCorrespondenceRole, string> = {
  SENDER: "is_sender",
  RECIPIENT: "is_recipient",
  APPROVER: "is_approver",
  SIGNER: "is_signer",
  VISOR: "is_visor",
  ASSIGNEE: "is_assignee",
  ASSIGNER: "is_assigner",
  PARTICIPANT: "is_participant",
};

/** Статусы текущего пользователя по документу; null — этап его не касается. */
export interface ICorrespondenceUserStatuses {
  approval: string | null;
  signature: string | null;
  assignment: string | null;
  issued_assignment: string | null;
}

export interface ICorrespondenceUserContext {
  user_id: number | null;
  /** Основная актуальная роль пользователя в документе */
  primary_role: TCorrespondenceRole | null;
  /** Все роли пользователя в этом документе — их может быть несколько */
  roles: TCorrespondenceRole[];
  statuses: ICorrespondenceUserStatuses;
  /** Разрешённые действия; ключи, которых нет в ответе, считаются запрещёнными */
  allowed_actions: Partial<Record<TCorrespondenceAction, boolean>>;
}

export const EMPTY_CORRESPONDENCE_USER_STATUSES: ICorrespondenceUserStatuses = {
  approval: null,
  signature: null,
  assignment: null,
  issued_assignment: null,
};
