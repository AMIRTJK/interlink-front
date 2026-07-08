import type { IAdminUser } from "@entities/hr";
import { _axios, ApiRoutes } from "@shared/api";

export const PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export interface IEmployee {
  raw: IAdminUser;
  id: number;
  fullName: string;
  position: string;
  department: string;
  departmentId: number | null;
  status: string;
  email: string;
  phone: string;
  salary: number | null;
  photo?: string | null;
  corporateEmail: string;
  personalEmail: string;
  personalPhone: string;
  corporatePhone: string;
  birthDate: string;
  gender: string;
  rating: number | null;
  supervisorName: string;
}

export const STATUS_META: Record<
  string,
  { label: string; dot: string; chip: string }
> = {
  active: { label: "Активен", dot: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-600" },
  vacation: { label: "В отпуске", dot: "bg-rose-500", chip: "bg-rose-50 text-rose-600" },
  business_trip: { label: "В командировке", dot: "bg-amber-500", chip: "bg-amber-50 text-amber-600" },
};

export const statusMeta = (s: string) =>
  STATUS_META[s] || { label: s || "—", dot: "bg-slate-400", chip: "bg-slate-100 text-slate-500" };

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const money = (n: number | null) =>
  n == null ? "—" : `₽ ${n.toLocaleString("ru-RU")}`;

const parseSalary = (val: unknown): number | null => {
  if (val == null) return null;
  if (typeof val === "number") return val;
  const parsed = Number(val);
  return isNaN(parsed) ? null : parsed;
};

const buildFullName = (u: IAdminUser): string =>
  u.full_name ||
  [u.last_name, u.first_name, u.middle_name].filter(Boolean).join(" ") ||
  "Без имени";

const buildSupervisorName = (u: IAdminUser): string => {
  if (!u.supervisor) return "—";
  const s = u.supervisor;
  return [s.last_name, s.first_name, s.middle_name].filter(Boolean).join(" ") || "—";
};

export const normalizeUsers = (raw: IAdminUser[]): IEmployee[] =>
  (Array.isArray(raw) ? raw : []).map((u) => ({
    raw: u,
    id: u.id,
    fullName: buildFullName(u),
    position: u.position || "—",
    department: u.departments?.[0]?.name || u.department?.name || "—",
    departmentId: u.departments?.[0]?.id || u.department?.id || null,
    status: u.hr_status || u.status || "",
    email: u.corporate_email || u.email || "",
    phone: u.corporate_phone || u.phone || "",
    salary: parseSalary(u.salary),
    photo: u.photo_path,
    corporateEmail: u.corporate_email || "",
    personalEmail: u.personal_email || "",
    personalPhone: u.personal_phone || "",
    corporatePhone: u.corporate_phone || "",
    birthDate: u.birth_date || "",
    gender: u.gender || "",
    rating: u.rating ?? null,
    supervisorName: buildSupervisorName(u),
  }));

export type TEmployeesView = "table" | "cards";

export interface IEmployeesFilters {
  status: string;
  department: string;
  salaryMin: string;
  salaryMax: string;
}

export const exportUsersExcel = async (params?: Record<string, unknown>) => {
  const res = await _axios(ApiRoutes.EXPORT_USERS_EXCEL, {
    method: "GET",
    responseType: "blob",
    params,
  });
  const blob = new Blob([res.data as BlobPart], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Сотрудники.xlsx";
  link.click();
  URL.revokeObjectURL(link.href);
};
