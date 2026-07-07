import type { IAdminUser } from "@entities/hr";
import { _axios, ApiRoutes } from "@shared/api";

// Сколько сотрудников на странице по умолчанию
export const PAGE_SIZE = 10;

// Доступные варианты количества строк на странице
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Нормализованный сотрудник для отрисовки
export interface IEmployee {
  raw: IAdminUser;
  id: number;
  fullName: string;
  position: string;
  department: string;
  status: string;
  email: string;
  phone: string;
  salary: number | null;
  photo?: string;
}

// Метаданные статуса (подпись + цвета)
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

// Инициалы из ФИО
export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

// Формат денег
export const money = (n: number | null) =>
  n == null ? "—" : `₽ ${n.toLocaleString("ru-RU")}`;

// Приводим сырых юзеров к нормализованному виду
export const normalizeUsers = (raw: IAdminUser[]): IEmployee[] =>
  (Array.isArray(raw) ? raw : []).map((u) => ({
    raw: u,
    id: u.id,
    fullName:
      u.full_name || `${u.last_name || ""} ${u.first_name || ""}`.trim() || "Без имени",
    position: u.position || "—",
    department: u.department?.name || u.departments?.[0]?.name || "—",
    status: u.status || "",
    email: u.email || "",
    phone: u.phone || "",
    salary: typeof u.salary === "number" ? u.salary : u.salary ? Number(u.salary) : null,
    photo: u.photo_path,
  }));

// Тип вида списка
export type TEmployeesView = "table" | "cards";

// Применённые фильтры
export interface IEmployeesFilters {
  status: string;
  department: string;
  salaryMin: string;
  salaryMax: string;
}

// Экспорт сотрудников в Excel с бэка (файл-блоб).
// Когда дадут боевой API — меняется только ApiRoutes.EXPORT_USERS_EXCEL.
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
