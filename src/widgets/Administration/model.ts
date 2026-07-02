// Типы данных подмодулей «Пользователи» и «Роли и доступы».
// Формы перенесены из референса IAMDashboard.tsx; тип роли генерализован
// со строгого union до string (роли приходят с бэка динамически).

export type UserStatus = string;
export type ExtUserStatus = string;

export type ProfileTab = "profile" | "access" | "sessions" | "history";

export interface PermissionRow {
  label: string;
  value: boolean;
  /** Сырое имя права `module.action` — для сохранения в API (может отсутствовать у групп) */
  name?: string;
  subperms?: PermissionRow[];
  children?: PermissionRow[];
}

export interface PermModule {
  module: string;
  perms: PermissionRow[];
}

export interface EcpRow {
  label: string;
  value: boolean;
}

export interface RoleData {
  perms: PermModule[];
  ecp: EcpRow[];
  userCount: number;
  description: string;
  avatarBg: string;
  avatarText: string;
  countBg: string;
  countText: string;
}

export interface RoleCard {
  id: string;
  name: string;
  description: string;
  userCount: number;
  badges: string[];
  color: string;
  textColor: string;
  perms: PermModule[];
  /** Сырое имя набора прав роли (для сохранения) */
  permissionNames: string[];
  createdAt: string;
}

export interface TableUser {
  id: string;
  fio: string;
  position: string;
  department: string;
  roles: string[];
  status: UserStatus;
  assignedDate: string;
  avatarInitials: string;
}

export interface ExtUser {
  id: string;
  fio: string;
  email: string;
  position: string;
  department: string;
  roles: string[];
  status: ExtUserStatus;
  lastActivity: string;
  avatarInitials: string;
  joinedDate: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error";
}

export type UserRoleOverrides = Record<string, Record<string, PermModule[]>>;

export interface SessionInfo {
  device: string;
  os: string;
  ip: string;
  lastSeen: string;
  icon: "monitor" | "phone";
}

export interface HistoryItem {
  action: string;
  time: string;
  type: "create" | "approve" | "complete" | "view" | "settings";
}
