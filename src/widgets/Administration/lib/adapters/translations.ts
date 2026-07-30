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
export const MODULE_ORDER = [
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
