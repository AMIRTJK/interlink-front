export type TTab = "profile" | "permissions" | "sessions" | "history";

export const ROLE_DOT_COLOR_MAP: Record<string, string> = {
  super_admin: "bg-blue-500!",
  recipient: "bg-green-500!",
  signer: "bg-orange-500!",
  approvaler: "bg-indigo-500!",
  controller: "bg-purple-500!",
  observer: "bg-slate-400!",
};

export const ROLE_CHIP_STYLE_MAP: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  super_admin: {
    border: "border-blue-100!",
    bg: "bg-blue-50/50!",
    text: "text-blue-600!",
  },
  recipient: {
    border: "border-emerald-100!",
    bg: "bg-emerald-50/50!",
    text: "text-emerald-600!",
  },
  signer: {
    border: "border-orange-100!",
    bg: "bg-orange-50/50!",
    text: "text-orange-600!",
  },
  approvaler: {
    border: "border-indigo-100!",
    bg: "bg-indigo-50/50!",
    text: "text-indigo-600!",
  },
  controller: {
    border: "border-purple-100!",
    bg: "bg-purple-50/50!",
    text: "text-purple-600!",
  },
  observer: {
    border: "border-slate-200!",
    bg: "bg-slate-50!",
    text: "text-slate-500!",
  },
};

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
  assign: "Назначение",
  counters: "Счетчики",
  restore: "Восстановление",
  trash: "Корзина",
  pin: "Закрепление",
  archive: "Архив",
  move: "Перемещение",
  register: "Регистрация",
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
  view_all: "Просмотр всех",
  update_all: "Обновление всех",
  reject: "Отклонение",
  export: "Экспорт",
  "logs.view": "Просмотр логов",
};
