// Адаптеры: реальные ответы API → формы данных дизайна.
// Имена прав приходят как `module.action`; переводы модулей/действий
// повторяют Hr/Access/ui/RolePermissionsSidebar.tsx, чтобы подписи совпадали
// с остальным приложением.
import type { IAdminUser } from "@entities/hr";
import type { ExtUser, TableUser, PermModule, EcpRow, RoleCard } from "../model";
import { getRoleColor } from "../theme/tokens";
import { mockLastActivity } from "./mock";

export const MODULE_TRANSLATIONS: Record<string, string> = {
  profile: "Личный кабинет",
  users: "Персонал",
  roles: "Роли",
  permissions: "Права доступа",
  organizations: "Организации",
  departments: "Отделы",
  tasks: "Чат / Задачи",
  events: "События",
  correspondence: "Корреспонденция",
  internal_correspondence: "Внутренняя корреспонденция",
  signatures: "Подписи",
  analytics: "Аналитика",
  approvals: "Согласования",
  system: "Системные функции",
};

export const ACTION_TRANSLATIONS: Record<string, string> = {
  view: "Просмотр",
  create: "Создание",
  update: "Редактирование",
  delete: "Удаление",
  manage_ui: "Управление UI",
  register: "Регистрация",
  assign: "Назначение",
  edit_own: "Собственное",
  counters: "Счетчики",
  restore: "Восстановление",
  trash: "Корзина",
  pin: "Закрепление",
  archive: "Архив",
  move: "Перемещение",
  set_leader: "Назначение руководителя",
  leader_candidates: "Кандидаты в руководители",
  assignment_targets: "Цели назначения",
  assign_all: "Назначить все",
  payload: "Данные подписи",
  confirm: "Подтверждение",
  send: "Отправка",
  invite_approvals: "Приглашение согласующих",
  invite_signers: "Приглашение подписантов",
  approve: "Согласование",
  manage_participants: "Участники",
  sign: "Подписание",
  reject: "Отклонение",
  export: "Экспорт",
  view_all: "Просмотр всех",
  update_all: "Обновление всех",
  "logs.view": "Просмотр логов",
  "assignment.update_status": "Обновление статуса назначения",
  "assignment.update_any": "Изменение любого назначения",
  "resolution.create": "Создание резолюции",
  "resolution.update": "Изменение резолюции",
  "resolution.close": "Закрытие резолюции",
  "approval.view": "Просмотр согласования",
  "approval.update_status": "Обновление статуса согласования",
  "approval.update_any": "Изменение любого согласования",
  "attachment.upload": "Загрузка вложений",
  "attachment.upload_bulk": "Массовая загрузка вложений",
  "attachment.delete": "Удаление вложений",
  "folder.view": "Просмотр папок",
  "folder.manage": "Управление папками",
};

// Порядок модулей как в дизайне: сначала канонические, потом остальные
const MODULE_ORDER = [
  "profile",
  "users",
  "correspondence",
  "internal_correspondence",
  "tasks",
  "events",
  "roles",
  "permissions",
  "organizations",
  "departments",
  "approvals",
  "signatures",
  "analytics",
  "system",
];

const STATUS_LABELS: Record<string, string> = {
  active: "Активен",
  inactive: "Неактивен",
  blocked: "Заблокирован",
  vacation: "В отпуске",
  business_trip: "В командировке",
};

export function mapStatus(status?: string): string {
  if (!status) return "Активен";
  return STATUS_LABELS[status] ?? status;
}

const STATUS_CODES: Record<string, string> = Object.fromEntries(
  Object.entries(STATUS_LABELS).map(([code, label]) => [label, code]),
);

/** Обратное к mapStatus — русская метка UI -> код backend для PUT /admin/users/:id */
export function unmapStatus(label: string): string {
  return STATUS_CODES[label] ?? label;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatJoinedDate(dateStr?: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/** Разворачивает разные варианты обёрток ответа: data.data.data | data.data | data */
export function unwrapList<T = unknown>(raw: unknown): T[] {
  const anyRaw = raw as
    | { data?: { data?: T[] } | T[] }
    | T[]
    | undefined
    | null;
  const v =
    (anyRaw as { data?: { data?: T[] } })?.data &&
    (anyRaw as { data?: { data?: T[] } }).data?.data
      ? (anyRaw as { data: { data: T[] } }).data.data
      : (anyRaw as { data?: T[] })?.data
        ? (anyRaw as { data: T[] }).data
        : anyRaw;
  return Array.isArray(v) ? (v as T[]) : [];
}

/** Приводит массив permissions (строки или {name}) к массиву строк-имён */
export function extractPermNames(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const names: string[] = [];
  raw.forEach((p: unknown) => {
    const name = typeof p === "string" ? p : (p as { name?: string })?.name;
    if (name) names.push(name);
  });
  return names;
}

function fullName(u: IAdminUser): string {
  return (
    u.full_name ||
    `${u.last_name || ""} ${u.first_name || ""}`.trim() ||
    "Без имени"
  );
}

function department(u: IAdminUser): string {
  return u.department?.name || u.departments?.[0]?.name || "—";
}

export function adaptExtUser(u: IAdminUser): ExtUser {
  const fio = fullName(u);
  return {
    id: String(u.id),
    fio,
    email: u.email || "—",
    position: u.position || "—",
    department: department(u),
    roles: extractPermNames(u.roles),
    status: mapStatus(u.status),
    lastActivity: mockLastActivity(u.id), // MOCK: нет API last_activity
    avatarInitials: getInitials(fio) || "—",
    joinedDate: formatJoinedDate(u.created_at),
  };
}

export function adaptTableUser(u: IAdminUser): TableUser {
  const fio = fullName(u);
  return {
    id: String(u.id),
    fio,
    position: u.position || "—",
    department: department(u),
    roles: extractPermNames(u.roles),
    status: mapStatus(u.status),
    // MOCK: нет даты назначения роли — используем дату создания пользователя
    assignedDate: formatJoinedDate(u.created_at),
    avatarInitials: getInitials(fio) || "—",
  };
}

/**
 * Строит матрицу модуль×действие в форме дизайна (PermModule[]).
 * allPermNames — полный каталог прав (FETCH_PERMISSIONS + права всех ролей),
 * activePermNames — права конкретной роли/пользователя (какие включены).
 * У каждого subperm сохраняется сырое имя `name` для сохранения в API.
 */
export function buildPermModules(
  allPermNames: string[],
  activePermNames: string[],
): PermModule[] {
  const active = new Set(activePermNames);
  const groups: Record<string, { label: string; name: string; value: boolean }[]> =
    {};

  allPermNames.forEach((permName) => {
    const dot = permName.indexOf(".");
    const moduleName = dot === -1 ? permName : permName.slice(0, dot);
    const actionName = dot === -1 ? "" : permName.slice(dot + 1);
    const label = ACTION_TRANSLATIONS[actionName] || actionName || permName;
    if (!groups[moduleName]) groups[moduleName] = [];
    // защита от дублей
    if (!groups[moduleName].some((a) => a.name === permName)) {
      groups[moduleName].push({ label, name: permName, value: active.has(permName) });
    }
  });

  const moduleNames = Object.keys(groups).sort((a, b) => {
    const ia = MODULE_ORDER.indexOf(a);
    const ib = MODULE_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return moduleNames.map((moduleName) => ({
    module: MODULE_TRANSLATIONS[moduleName] || moduleName,
    perms: [
      {
        label: "",
        value: groups[moduleName].some((a) => a.value),
        subperms: groups[moduleName].map((a) => ({
          label: a.label,
          value: a.value,
          name: a.name,
        })),
      },
    ],
  }));
}

/** Собирает включённые сырые имена прав обратно из матрицы (для сохранения) */
/** Накладывает на матрицу прав union(role_permissions) + direct - denied */
export function applyEffectiveState(
  basePerms: PermModule[],
  unionRolePerms: Set<string>,
  direct: string[],
  denied: string[],
): PermModule[] {
  const directSet = new Set(direct);
  const deniedSet = new Set(denied);
  const applyToSubperms = (subperms?: { label: string; value: boolean; name?: string }[]) =>
    subperms?.map((sp) => {
      if (!sp.name) return sp;
      let value = unionRolePerms.has(sp.name);
      if (directSet.has(sp.name)) value = true;
      if (deniedSet.has(sp.name)) value = false;
      return { ...sp, value };
    });
  return basePerms.map((m) => ({
    ...m,
    perms: m.perms.map((p) => ({
      ...p,
      subperms: applyToSubperms(p.subperms) ?? p.subperms,
      children: p.children?.map((ch) => ({
        ...ch,
        subperms: applyToSubperms(ch.subperms) ?? ch.subperms,
      })),
    })),
  }));
}

export function collectEnabledPermNames(perms: PermModule[]): string[] {
  const names: string[] = [];
  perms.forEach((mod) =>
    mod.perms.forEach((p) => {
      p.subperms?.forEach((sp) => {
        if (sp.value && sp.name) names.push(sp.name);
      });
      p.children?.forEach((ch) =>
        ch.subperms?.forEach((csp) => {
          if (csp.value && csp.name) names.push(csp.name);
        }),
      );
    }),
  );
  return names;
}

/**
 * ЭЦП-права роли. MOCK/приближение: выводим из наличия соответствующих прав,
 * т.к. отдельного контракта под «Право подписи/Визирование/Согласование» нет.
 */
export function deriveEcp(activePermNames: string[]): EcpRow[] {
  const has = (frag: string) => activePermNames.some((p) => p.includes(frag));
  return [
    { label: "Право подписи", value: has("signatures.sign") || has("sign") },
    { label: "Визирование", value: has("approvals") || has("approve") },
    { label: "Согласование", value: has("approvals") || has("approve") },
  ];
}

export function adaptRoleCard(
  role: {
    id: number;
    name: string;
    description?: string;
    permissions?: unknown;
    created_at?: string;
  },
  opts: { allPermNames: string[]; userCount: number },
): RoleCard {
  const permissionNames = extractPermNames(role.permissions);
  const color = getRoleColor(role.name);
  return {
    id: String(role.id),
    name: role.name,
    description: role.description || "Без описания",
    userCount: opts.userCount,
    badges: [], // MOCK: нет полей бейджей у роли
    color: color.bg,
    textColor: color.text,
    perms: buildPermModules(opts.allPermNames, permissionNames),
    permissionNames,
    createdAt: formatJoinedDate(role.created_at),
  };
}
