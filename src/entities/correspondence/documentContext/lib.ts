import {
  CORRESPONDENCE_ACTIONS,
  CORRESPONDENCE_ROLE_FLAGS,
  CORRESPONDENCE_ROLES,
  EMPTY_CORRESPONDENCE_USER_STATUSES,
  type ICorrespondenceUserContext,
  type ICorrespondenceUserStatuses,
  type TCorrespondenceAction,
  type TCorrespondenceRole,
} from "./model";

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const toRole = (value: unknown): TCorrespondenceRole | null => {
  if (typeof value !== "string") return null;
  const upper = value.toUpperCase() as TCorrespondenceRole;
  return CORRESPONDENCE_ROLES.includes(upper) ? upper : null;
};

const toAction = (value: unknown): TCorrespondenceAction | null => {
  if (typeof value !== "string") return null;
  const action = value as TCorrespondenceAction;
  return CORRESPONDENCE_ACTIONS.includes(action) ? action : null;
};

const toStatus = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const collectRoles = (raw: Record<string, unknown>): TCorrespondenceRole[] => {
  const collected = new Set<TCorrespondenceRole>();

  if (Array.isArray(raw.roles)) {
    raw.roles.forEach((role) => {
      const parsed = toRole(role);
      if (parsed) collected.add(parsed);
    });
  }

  [raw.primary_role, raw.role].forEach((role) => {
    const parsed = toRole(role);
    if (parsed) collected.add(parsed);
  });

  // Роли можно восстановить и по флагам is_*, если массив roles не пришёл.
  CORRESPONDENCE_ROLES.forEach((role) => {
    if (raw[CORRESPONDENCE_ROLE_FLAGS[role]] === true) collected.add(role);
  });

  return CORRESPONDENCE_ROLES.filter((role) => collected.has(role));
};

const collectAllowedActions = (
  raw: Record<string, unknown>,
): Partial<Record<TCorrespondenceAction, boolean>> => {
  const allowed: Partial<Record<TCorrespondenceAction, boolean>> = {};

  const rawAllowed = asRecord(raw.allowed_actions);
  if (rawAllowed) {
    Object.entries(rawAllowed).forEach(([key, value]) => {
      const action = toAction(key);
      if (action) allowed[action] = value === true;
    });
  }

  // permissions — плоский список тех же действий; служит запасным источником,
  // когда allowed_actions не пришёл или отдан неполным.
  if (Array.isArray(raw.permissions)) {
    raw.permissions.forEach((permission) => {
      const action = toAction(permission);
      if (action && allowed[action] === undefined) allowed[action] = true;
    });
  }

  return allowed;
};

const collectStatuses = (
  raw: Record<string, unknown>,
): ICorrespondenceUserStatuses => {
  const rawStatuses = asRecord(raw.statuses);
  if (!rawStatuses) return EMPTY_CORRESPONDENCE_USER_STATUSES;

  return {
    approval: toStatus(rawStatuses.approval),
    signature: toStatus(rawStatuses.signature),
    assignment: toStatus(rawStatuses.assignment),
    issued_assignment: toStatus(rawStatuses.issued_assignment),
  };
};

const isContextShaped = (value: Record<string, unknown>): boolean =>
  "allowed_actions" in value ||
  "permissions" in value ||
  "primary_role" in value ||
  "roles" in value;

export const normalizeCorrespondenceUserContext = (
  raw: unknown,
): ICorrespondenceUserContext | null => {
  const record = asRecord(raw);
  if (!record || !isContextShaped(record)) return null;

  const roles = collectRoles(record);
  const primaryRole = toRole(record.primary_role) ?? toRole(record.role) ?? roles[0] ?? null;
  const userId = Number(record.user_id);

  return {
    user_id: Number.isFinite(userId) ? userId : null,
    primary_role: primaryRole,
    roles,
    statuses: collectStatuses(record),
    allowed_actions: collectAllowedActions(record),
  };
};

/**
 * Достаёт current_user_context из ответа бэкенда. Объект приходит по-разному:
 * в корне data, внутри data.item, а с отдельного эндпоинта /permissions —
 * самим телом ответа.
 *
 * allowBareBody включаем только для ответа /permissions: там контекст и есть
 * тело. Для карточки документа его не ставим, иначе поля самого письма можно
 * ошибочно принять за контекст.
 */
export const extractCorrespondenceUserContext = (
  source: unknown,
  options?: { allowBareBody?: boolean },
): ICorrespondenceUserContext | null => {
  const root = asRecord(source);
  if (!root) return null;

  const data = asRecord(root.data);
  const candidates: unknown[] = [
    root.current_user_context,
    data?.current_user_context,
    asRecord(data?.item)?.current_user_context,
    asRecord(root.item)?.current_user_context,
    ...(options?.allowBareBody ? [data, root] : []),
  ];

  for (const candidate of candidates) {
    const context = normalizeCorrespondenceUserContext(candidate);
    if (context) return context;
  }

  return null;
};
