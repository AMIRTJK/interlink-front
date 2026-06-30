import type { IAdminUser } from "@entities/hr";

export interface IUserAccessFilters {
  search: string;
  role: string;
  department: string;
  status: string;
}

export interface IAccessUser {
  id: number;
  fullName: string;
  email: string;
  department: string;
  roles: string[];
  status: string;
  lastActive: string;
  joinedAt: string;
  raw: IAdminUser;
}

export const ACCESS_STATUS_META: Record<
  string,
  { label: string; dotClass: string; textClass: string; chipClass: string }
> = {
  active: {
    label: "Активен",
    dotClass: "bg-emerald-500!",
    textClass: "text-emerald-600!",
    chipClass: "bg-emerald-50! text-emerald-600!",
  },
  inactive: {
    label: "Неактивен",
    dotClass: "bg-slate-400!",
    textClass: "text-slate-500!",
    chipClass: "bg-slate-50! text-slate-500!",
  },
  blocked: {
    label: "Заблокирован",
    dotClass: "bg-rose-500!",
    textClass: "text-rose-600!",
    chipClass: "bg-rose-50! text-rose-600!",
  },
};

export const ROLE_COLOR_MAP: Record<string, string> = {
  super_admin: "blue",
  recipient: "green",
  signer: "orange",
  approvaler: "cyan",
  controller: "purple",
  observer: "default",
};

export const ACCESS_LEVELS_META = [
  { key: "profile.view", label: "Личный кабинет — Просмотр", permission: "profile.edit_own" },
  { key: "employees.view", label: "Персонал — Просмотр", permission: "users.view" },
  { key: "employees.edit", label: "Персонал — Редактирование", permission: "users.update" },
  { key: "correspondence.create", label: "Корреспонденция — Создание", permission: "correspondence.create" },
  { key: "chat.view", label: "Чат — Просмотр", permission: "tasks.view" },
  { key: "users.manage", label: "Управление пользователями", permission: "roles.update" },
];
