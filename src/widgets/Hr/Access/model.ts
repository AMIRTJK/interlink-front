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
  vacation: {
    label: "В отпуске",
    dotClass: "bg-amber-500!",
    textClass: "text-amber-600!",
    chipClass: "bg-amber-50! text-amber-600!",
  },
  business_trip: {
    label: "В командировке",
    dotClass: "bg-sky-500!",
    textClass: "text-sky-600!",
    chipClass: "bg-sky-50! text-sky-600!",
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

