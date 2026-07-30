import type { IAdminUser } from "@entities/hr";
import type { ExtUser, TableUser } from "../../model";
import { mockLastActivity } from "../mock";
import { mapStatus } from "./translations";
import { getInitials, formatJoinedDate, extractPermNames } from "./formatters";

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
