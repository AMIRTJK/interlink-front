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
    label: "\u0417\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d",
    dotClass: "bg-rose-500!",
    textClass: "text-rose-600!",
    chipClass: "bg-rose-50! text-rose-600!",
  },
  vacation: {
    label: "\u0412 \u043e\u0442\u043f\u0443\u0441\u043a\u0435",
    dotClass: "bg-amber-500!",
    textClass: "text-amber-600!",
    chipClass: "bg-amber-50! text-amber-600!",
  },
  business_trip: {
    label: "\u0412 \u043a\u043e\u043c\u0430\u043d\u0434\u0438\u0440\u043e\u0432\u043a\u0435",
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

