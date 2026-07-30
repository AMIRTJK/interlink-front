import type { IAdminUser } from "@entities/hr";
import type { IAccessUser } from "../model";

export const formatActivity = (id: number): string => {
  const mockActivities: Record<number, string> = {
    1: "2 мин. назад",
    2: "15 мин. назад",
    3: "1 час назад",
    4: "3 часа назад",
    5: "Вчера 17:42",
    6: "3 дня назад",
    7: "30 мин. назад",
    8: "2 часа назад",
  };
  return mockActivities[id] || `${(id % 5) + 1} час(а) назад`;
};

export const formatJoinedDate = (dateStr?: string): string => {
  if (!dateStr) return "12.01.2022";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "12.01.2022";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

/** Приводит массив permissions (строки или {name}) к массиву строк-имён */
export const extractPermNames = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  const names: string[] = [];
  raw.forEach((p: any) => {
    const name = typeof p === "string" ? p : p?.name;
    if (name) names.push(name);
  });
  return names;
};

export const normalizeAccessUsers = (raw: IAdminUser[]): IAccessUser[] => {
  return (Array.isArray(raw) ? raw : []).map((u) => ({
    id: u.id,
    fullName:
      u.full_name ||
      `${u.last_name || ""} ${u.first_name || ""}`.trim() ||
      "Без имени",
    email: u.email || "—",
    department: u.department?.name || u.departments?.[0]?.name || "—",
    roles: (u.roles || []).map((r) => r.name),
    status: u.status || "active",
    lastActive: formatActivity(u.id),
    joinedAt: formatJoinedDate(u.created_at),
    raw: u,
  }));
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const getRoleColorMeta = (roleName: string) => {
  const name = roleName.toLowerCase();
  if (name.includes("администратор") || name.includes("admin")) {
    return {
      dot: "bg-blue-500!",
      text: "text-blue-600!",
      badge: "bg-blue-50 text-blue-600! border border-blue-100",
      borderCell: "border-l-blue-500!",
    };
  }
  if (name.includes("делопроизводитель") || name.includes("recipient")) {
    return {
      dot: "bg-emerald-500!",
      text: "text-emerald-600!",
      badge: "bg-emerald-50 text-emerald-600! border border-emerald-100",
      borderCell: "border-l-emerald-500!",
    };
  }
  if (name.includes("руководитель") || name.includes("signer")) {
    return {
      dot: "bg-orange-500!",
      text: "text-orange-600!",
      badge: "bg-orange-50 text-orange-600! border border-orange-100",
      borderCell: "border-l-orange-500!",
    };
  }
  if (name.includes("исполнитель") || name.includes("approval")) {
    return {
      dot: "bg-indigo-500!",
      text: "text-indigo-600!",
      badge: "bg-indigo-50 text-indigo-600! border border-indigo-100",
      borderCell: "border-l-indigo-500!",
    };
  }
  if (name.includes("контрол") || name.includes("control")) {
    return {
      dot: "bg-purple-500!",
      text: "text-purple-600!",
      badge: "bg-purple-50 text-purple-600! border border-purple-100",
      borderCell: "border-l-purple-500!",
    };
  }
  return {
    dot: "bg-slate-400!",
    text: "text-slate-500!",
    badge: "bg-slate-50 text-slate-500! border border-slate-200",
    borderCell: "border-l-slate-400!",
  };
};
