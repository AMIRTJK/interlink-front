import { IAdminUser } from "@entities/hr";

export const transformOrgs = (res: unknown) => {
  const data = (res as { data: { data: { id: number; name: string }[] } })?.data?.data || [];
  return data.map((o) => ({ value: String(o.id), label: o.name }));
};

export const transformDeps = (res: unknown) => {
  const data = (res as { data: { data: { id: number; name: string }[] } })?.data?.data || [];
  return data.map((d) => ({ value: String(d.id), label: d.name }));
};

export const transformRoles = (res: unknown) => {
  const raw = (res as { data: { data: { id: number; name: string }[] } | { id: number; name: string }[] })?.data;
  const items = (Array.isArray(raw) ? raw : (raw as { data: { id: number; name: string }[] })?.data) || [];
  return items.map((r) => ({ value: r.name, label: r.name }));
};

export const onlyDigits9 = (v: string) => (v || "").replace(/\D/g, "").slice(0, 9);

export const STATUS_OPTIONS = [
  { value: "active", label: "Активен" },
  { value: "vacation", label: "В отпуске" },
  { value: "business_trip", label: "В командировке" },
];

export const GENDER_OPTIONS = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
];

export const mapEmployeeToForm = (employee: IAdminUser) => {
  return {
    first_name: employee.first_name,
    last_name: employee.last_name,
    middle_name: employee.middle_name,
    position: employee.position,
    corporate_email: employee.corporate_email,
    personal_email: employee.personal_email,
    hr_status: employee.hr_status || employee.status,
    salary: employee.salary ? Number(employee.salary) : undefined,
    phone: (employee.phone || "").replace(/^\+992/, ""),
    personal_phone: (employee.personal_phone || "").replace(/^\+992/, ""),
    corporate_phone: (employee.corporate_phone || "").replace(/^\+992/, ""),
    birth_date: employee.birth_date ? (employee.birth_date.includes("T") ? employee.birth_date.split("T")[0] : employee.birth_date.split(" ")[0]) : undefined,
    gender: employee.gender,
    passport_series: employee.passport_series,
    passport_number: employee.passport_number,
    inn: employee.inn,
    address: employee.address,
    bank_account: employee.bank_account,
    rating: employee.rating,
    supervisor_id: employee.supervisor_id
      ? String(employee.supervisor_id)
      : undefined,
    organization_id: employee.organization_id
      ? String(employee.organization_id)
      : employee.organization?.id
        ? String(employee.organization.id)
        : undefined,
    department_ids: employee.departments?.map((d) => String(d.id)),
    roles: employee.roles?.map((r) => r.name),
  };
};

export const prepareEmployeePayload = (values: Record<string, unknown>) => {
  const withCode = (v: unknown) => {
    const s = String(v || "");
    if (!s) return undefined;
    return s.startsWith("+") ? s : `+992${s}`;
  };

  const deptIds = Array.isArray(values.department_ids)
    ? (values.department_ids as string[]).map(Number)
    : undefined;

  return {
    ...values,
    phone: withCode(values.phone),
    personal_phone: withCode(values.personal_phone),
    corporate_phone: withCode(values.corporate_phone),
    organization_id: Number(values.organization_id),
    supervisor_id: values.supervisor_id
      ? Number(values.supervisor_id)
      : undefined,
    department_ids: deptIds,
    salary: values.salary ? Number(values.salary) : undefined,
    rating: values.rating ? Number(values.rating) : undefined,
  };
};

export const validateEmployee = (values: Record<string, any>, isEdit: boolean) => {
  const errs: Record<string, string> = {};
  if (!values.last_name) errs.last_name = "Введите фамилию";
  if (!values.first_name) errs.first_name = "Введите имя";
  if (!values.organization_id) errs.organization_id = "Выберите организацию";
  if (!values.department_ids || values.department_ids.length === 0) errs.department_ids = "Выберите отдел";
  if (!values.position) errs.position = "Введите должность";
  if (!values.roles || values.roles.length === 0) errs.roles = "Выберите роли";

  if (!isEdit) {
    if (!values.phone) errs.phone = "Введите телефон";
    else if (!/^\d{9}$/.test(values.phone)) errs.phone = "Введите 9 цифр";
    if (!values.password) errs.password = "Введите пароль";
  } else {
    if (values.phone && !/^\d{9}$/.test(values.phone)) errs.phone = "Введите 9 цифр";
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (values.corporate_email && !emailRegex.test(values.corporate_email)) {
    errs.corporate_email = "Некорректный email";
  }
  if (values.personal_email && !emailRegex.test(values.personal_email)) {
    errs.personal_email = "Некорректный email";
  }
  if (values.corporate_phone && !/^\d{9}$/.test(values.corporate_phone)) {
    errs.corporate_phone = "Введите 9 цифр";
  }
  if (values.personal_phone && !/^\d{9}$/.test(values.personal_phone)) {
    errs.personal_phone = "Введите 9 цифр";
  }

  return errs;
};

export const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

export const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

export const getInputClasses = (hasError?: boolean, disabled?: boolean) => {
  const inputShell = "w-full rounded-xl border text-sm outline-none transition-colors";
  if (disabled) return `${inputShell} border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-900 text-gray-400 dark:text-slate-600 cursor-not-allowed`;
  if (hasError) return `${inputShell} border-red-300 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10 text-gray-800 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20`;
  return `${inputShell} border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900/50 text-gray-800 dark:text-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20`;
};
