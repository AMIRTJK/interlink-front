import { IAdminUser, IPassportOcrFields } from "@entities/hr";
import { getEnvVar } from "@shared/config";

// Аватар сотрудника: backend возвращает готовый публичный photo_url — используем его.
// Внутренний photo_path напрямую в <img src> не годится; достраиваем URL из него лишь
// как запасной вариант для старых записей, у которых photo_url ещё не пришёл
// (такие фото лежат в приватном хранилище и, скорее всего, не откроются — нужен повторный аплоад).
export const resolveEmployeePhotoUrl = (
  user?: Pick<IAdminUser, "photo_url" | "photo_path"> | null
): string => {
  if (!user) return "";
  if (user.photo_url) return user.photo_url;
  const path = user.photo_path;
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const apiHost = getEnvVar("VITE_API_URL") || "";
  const host = apiHost.endsWith("/") ? apiHost.slice(0, -1) : apiHost;
  let p = path.replace(/^\/+/, "");
  if (!p.startsWith("storage/")) p = `storage/${p}`;
  return `${host}/${p}`;
};

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
    bio: employee.bio || "",
  };
};

// Нормализация даты рождения из OCR к формату формы (YYYY-MM-DD).
const normalizeOcrDate = (raw?: string | null): string | undefined => {
  const s = String(raw ?? "").trim();
  if (!s) return undefined;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/); // ISO / YYYY-MM-DD...
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = s.match(/^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/); // DD.MM.YYYY
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return undefined;
};

// Нормализация пола из OCR к значениям сегмента формы ("male" | "female").
const normalizeOcrGender = (raw?: string | null): string | undefined => {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!s) return undefined;
  if (["male", "m", "муж", "м"].some((v) => s.startsWith(v))) return "male";
  if (["female", "f", "жен", "ж"].some((v) => s.startsWith(v))) return "female";
  return undefined;
};

/**
 * Подставляет распознанные OCR-поля паспорта в значения формы сотрудника.
 * Значение применяется, только если OCR вернул непустое значение И поле формы ещё пустое —
 * так автозаполнение не затирает то, что пользователь уже ввёл вручную.
 * Пока OCR отключён на сервере (fields === null), функция просто возвращает исходные значения,
 * и форма продолжает работать в обычном режиме ручного ввода.
 */
export const applyPassportOcr = (
  values: Record<string, any>,
  fields?: IPassportOcrFields | null
): Record<string, any> => {
  if (!fields) return values;
  const next = { ...values };

  const setIfEmpty = (key: string, incoming?: string) => {
    if (incoming == null || incoming === "") return;
    const current = next[key];
    if (current == null || current === "") next[key] = incoming;
  };

  setIfEmpty("last_name", fields.last_name ?? undefined);
  setIfEmpty("first_name", fields.first_name ?? undefined);
  setIfEmpty("middle_name", fields.middle_name ?? undefined);
  setIfEmpty("passport_series", fields.passport_series ?? undefined);
  setIfEmpty("passport_number", fields.passport_number ?? undefined);
  setIfEmpty("inn", fields.inn ?? undefined);
  setIfEmpty("address", fields.address ?? undefined);
  setIfEmpty("birth_date", normalizeOcrDate(fields.birth_date));
  setIfEmpty("gender", normalizeOcrGender(fields.gender));

  return next;
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
  };
};

// Максимальный размер фото сотрудника/профиля — 5 MB (ограничение Backend).
export const MAX_PHOTO_SIZE_MB = 5;

// Рекурсивно раскладывает значение в FormData в bracket-нотации (Laravel-совместимо):
// File/Blob — как есть; массивы → key[i]; вложенные объекты → key[child];
// null/undefined пропускаются (не отправляем пустые значения). Такая раскладка даёт
// на сервере ту же вложенную структуру ($request->all()), что и прежний JSON-body.
const appendFormData = (form: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return;
  if (value instanceof File || value instanceof Blob) {
    form.append(key, value);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => appendFormData(form, `${key}[${i}]`, item));
  } else if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) =>
      appendFormData(form, `${key}[${k}]`, v)
    );
  } else {
    form.append(key, String(value));
  }
};

/**
 * Собирает payload сотрудника (все поля формы + файл фото `photo` + паспортные/OCR-поля)
 * в multipart/form-data. Отправляется в POST /api/v1/admin/users или
 * PUT /api/v1/admin/users/{id} — фото передаётся прямо в запросе создания/редактирования.
 */
export const buildEmployeeFormData = (payload: Record<string, unknown>): FormData => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => appendFormData(form, key, value));
  return form;
};

export const validateEmployee = (values: Record<string, any>, isEdit: boolean) => {
  const errs: Record<string, string> = {};
  if (!values.last_name) errs.last_name = "Введите фамилию";
  if (!values.first_name) errs.first_name = "Введите имя";
  if (!values.organization_id) errs.organization_id = "Выберите организацию";
  if (!values.department_ids || values.department_ids.length === 0) errs.department_ids = "Выберите отдел";
  if (!values.position) errs.position = "Введите должность";
  if (!values.roles || values.roles.length === 0) errs.roles = "Выберите роли";
  if (!values.birth_date) errs.birth_date = "Укажите дату рождения";
  if (!values.gender) errs.gender = "Выберите пол";
  if (!values.passport_series) errs.passport_series = "Введите серию паспорта";
  if (!values.passport_number) errs.passport_number = "Введите номер паспорта";
  if (!values.inn) errs.inn = "Введите ИНН";
  if (!values.address) errs.address = "Введите адрес";

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
