import { useEffect, useMemo, useRef, useState } from "react";
import { Form, FormInstance } from "antd";
import {
  CircleUserRound, ScrollText, Briefcase, Phone, Landmark,
  Mail, Wallet, CreditCard, Hash, MapPin, Check, Camera, Trash2,
  ChevronDown, X,
} from "lucide-react";
import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import {
  transformOrgs,
  transformDeps,
  transformRoles,
  onlyDigits9,
} from "../lib";

interface IOption {
  value: string;
  label: string;
}

interface IProps {
  form: FormInstance;
  organizationId?: string;
  isEdit: boolean;
  initialPhoto?: string;
}

const inputShell =
  "w-full rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20";
const inputBase = `${inputShell} h-11 placeholder:text-gray-400`;

/* --------------------------- Нативные контролы --------------------------- */

// Нативный инпут с необязательной иконкой слева
const IconInput = ({
  value,
  onChange,
  icon,
  ...rest
}: {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) => (
  <div className="relative">
    {icon && (
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none flex">
        {icon}
      </span>
    )}
    <input
      {...rest}
      value={value ?? ""}
      onChange={onChange}
      className={`${inputBase} ${icon ? "pl-9 pr-3" : "px-3"}`}
    />
  </div>
);

// Телефон с фиксированным префиксом +992. Хранит только 9 цифр.
const PhoneInput = ({
  value,
  onChange,
  placeholder,
  id,
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  id?: string;
}) => (
  <div className="flex items-stretch">
    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 text-sm text-gray-500 select-none">
      +992
    </span>
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange?.(onlyDigits9(e.target.value))}
      className="flex-1 min-w-0 h-11 px-3 rounded-r-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
    />
  </div>
);

// Одиночный нативный select
const NativeSelect = ({
  value,
  onChange,
  options,
  placeholder,
  allowClear,
  disabled,
  id,
}: {
  value?: string;
  onChange?: (v: string | undefined) => void;
  options: IOption[];
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  id?: string;
}) => (
  <div className="relative">
    <select
      id={id}
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value || undefined)}
      className={`${inputShell} h-11 pl-3 pr-9 appearance-none ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      } ${value ? "text-gray-800" : "text-gray-400"}`}
    >
      <option value="" hidden={!allowClear} disabled={!allowClear}>
        {placeholder}
      </option>
      {allowClear && <option value="">— Не выбрано —</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value} className="text-gray-800">
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={16}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  </div>
);

// Множественный select — кастомный дропдоуон с чекбоксами (без antd)
const MultiSelect = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value?: string[];
  onChange?: (v: string[]) => void;
  options: IOption[];
  placeholder?: string;
  disabled?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = value || [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (v: string) =>
    onChange?.(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  const chosen = options.filter((o) => selected.includes(o.value));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${inputShell} min-h-[44px] pl-3 pr-9 py-1.5 flex items-center gap-1.5 flex-wrap text-left ${
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {chosen.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          chosen.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 rounded-lg px-2 py-0.5 text-xs"
            >
              {o.label}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(o.value);
                }}
                className="hover:text-indigo-900"
              >
                <X size={11} />
              </span>
            </span>
          ))
        )}
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1">
          {options.length === 0 ? (
            <p className="px-3 py-2 text-xs text-gray-400">Нет данных</p>
          ) : (
            options.map((o) => {
              const on = selected.includes(o.value);
              return (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => toggle(o.value)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      on ? "bg-indigo-600 border-indigo-600 text-white" : "border-gray-300"
                    }`}
                  >
                    {on && <Check size={11} />}
                  </span>
                  <span className="text-gray-700">{o.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ Прочие блоки ------------------------------ */

// Заголовок секции с иконкой
const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
    {icon}
    <span>{children}</span>
  </p>
);

// Опциональная загрузка фото сотрудника (пока чисто клиентская — на бэке поля нет)
const PhotoUploadField = ({ initialUrl }: { initialUrl?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const blobRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | undefined>(initialUrl);

  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, []);

  const setBlob = (url?: string) => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    blobRef.current = url ?? null;
  };

  const onFile = (f?: File | null) => {
    if (!f || !f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    setBlob(url);
    setPreview(url);
  };

  const onRemove = () => {
    setBlob(undefined);
    setPreview(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section>
      <SectionTitle icon={<Camera size={13} />}>Фото сотрудника</SectionTitle>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 border-dashed border-gray-200 bg-gray-50 hover:border-indigo-400 transition-colors flex items-center justify-center"
        >
          {preview ? (
            <img src={preview} alt="Фото" className="w-full h-full object-cover" onError={onRemove} />
          ) : (
            <Camera size={20} className="text-gray-400" />
          )}
        </button>
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all border-gray-200 bg-gray-50 hover:border-indigo-400 text-gray-600"
            >
              <Camera size={14} />
              {preview ? "Заменить фото" : "Загрузить фото"}
            </button>
            {preview && (
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 text-sm font-medium transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <p className="text-[11px] text-gray-400">Необязательно · JPG, PNG или WEBP</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </section>
  );
};

interface ISegOption {
  value: string;
  label: string;
  activeClass: string;
  showCheck?: boolean;
}

// Группа кнопок-переключателей (Пол / Статус)
const SegmentControl = ({
  value,
  onChange,
  options,
}: {
  value?: string;
  onChange?: (v: string) => void;
  options: ISegOption[];
}) => (
  <div className="flex gap-2">
    {options.map((o) => {
      const active = value === o.value;
      return (
        <button
          type="button"
          key={o.value}
          onClick={() => onChange?.(o.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl text-xs font-medium border transition-all ${
            active
              ? o.activeClass
              : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
          }`}
        >
          {active && o.showCheck && <Check size={12} />}
          <span>{o.label}</span>
        </button>
      );
    })}
  </div>
);

const GENDER_SEG: ISegOption[] = [
  { value: "male", label: "Мужской", activeClass: "bg-indigo-100 text-indigo-700 border-transparent" },
  { value: "female", label: "Женский", activeClass: "bg-indigo-100 text-indigo-700 border-transparent" },
];

const STATUS_SEG: ISegOption[] = [
  { value: "active", label: "Активен", showCheck: true, activeClass: "bg-emerald-100 text-emerald-700 border-transparent ring-2 ring-offset-1 ring-emerald-400/50" },
  { value: "vacation", label: "В отпуске", activeClass: "bg-red-100 text-red-700 border-transparent ring-2 ring-offset-1 ring-red-400/50" },
  { value: "business_trip", label: "В командировке", activeClass: "bg-amber-100 text-amber-700 border-transparent ring-2 ring-offset-1 ring-amber-400/50" },
];

const iconEl = (Icon: typeof Mail) => <Icon size={14} />;

/* ------------------------------- Форма ------------------------------- */

export const EmployeeFormFields = ({ form, organizationId, isEdit, initialPhoto }: IProps) => {
  // Справочники грузим тем же хуком, что и остальной проект
  const { data: orgRes } = useGetQuery({ url: ApiRoutes.GET_ORGANIZATIONS, method: "GET" });
  const { data: roleRes } = useGetQuery({ url: ApiRoutes.GET_ROLES, method: "GET" });
  const { data: userRes } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    method: "GET",
    params: { with_departments: 1 },
  });
  const { data: deptRes } = useGetQuery({
    url: ApiRoutes.GET_DEPARTMENTS,
    method: "GET",
    params: { organization_id: organizationId },
    options: { enabled: !!organizationId },
  });

  const organizations = useMemo<IOption[]>(() => transformOrgs(orgRes), [orgRes]);
  const roles = useMemo<IOption[]>(() => transformRoles(roleRes), [roleRes]);
  const departments = useMemo<IOption[]>(() => transformDeps(deptRes), [deptRes]);
  const supervisors = useMemo<IOption[]>(() => {
    const arr =
      (userRes as { data?: { data?: { id: number; last_name?: string; first_name?: string }[] } })
        ?.data?.data || [];
    return arr.map((u) => ({
      value: String(u.id),
      label: [u.last_name, u.first_name].filter(Boolean).join(" "),
    }));
  }, [userRes]);

  return (
    <div className="space-y-4">
      {/* Фото сотрудника (опционально) */}
      <PhotoUploadField initialUrl={initialPhoto} />

      {/* Личные данные */}
      <section>
        <SectionTitle icon={<CircleUserRound size={13} />}>Личные данные</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-3">
          <Form.Item
            name="last_name"
            label="Фамилия"
            rules={[{ required: true, message: "Введите фамилию" }]}
          >
            <IconInput placeholder="Иванов" />
          </Form.Item>
          <Form.Item
            name="first_name"
            label="Имя"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <IconInput placeholder="Александр" />
          </Form.Item>
          <Form.Item name="middle_name" label="Отчество">
            <IconInput placeholder="Сергеевич" />
          </Form.Item>
          <Form.Item name="birth_date" label="Дата рождения">
            <IconInput type="date" />
          </Form.Item>
          <Form.Item name="gender" label="Пол" className="sm:col-span-2">
            <SegmentControl options={GENDER_SEG} />
          </Form.Item>
        </div>
      </section>

      {/* Документы */}
      <section>
        <SectionTitle icon={<ScrollText size={13} />}>Документы</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-3">
          <Form.Item name="passport_series" label="Серия паспорта">
            <IconInput placeholder="A" maxLength={5} icon={iconEl(ScrollText)} />
          </Form.Item>
          <Form.Item name="passport_number" label="Номер паспорта">
            <IconInput placeholder="1234567" maxLength={10} />
          </Form.Item>
          <Form.Item name="inn" label="ИНН">
            <IconInput placeholder="040012345" maxLength={12} icon={iconEl(Hash)} />
          </Form.Item>
          <Form.Item name="address" label="Адрес" className="sm:col-span-3">
            <IconInput placeholder="Душанбе" icon={iconEl(MapPin)} />
          </Form.Item>
        </div>
      </section>

      {/* Рабочие данные */}
      <section>
        <SectionTitle icon={<Briefcase size={13} />}>Рабочие данные</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-3">
          <Form.Item
            name="organization_id"
            label="Организация"
            rules={[{ required: true, message: "Выберите организацию" }]}
          >
            <NativeSelect options={organizations} placeholder="Выберите организацию" />
          </Form.Item>
          <Form.Item
            name="department_ids"
            label="Отдел"
            rules={[{ required: true, message: "Выберите отдел" }]}
          >
            <MultiSelect
              options={departments}
              disabled={!organizationId}
              placeholder={organizationId ? "Выберите отделы" : "Сначала организацию"}
            />
          </Form.Item>
          <Form.Item
            name="position"
            label="Должность"
            rules={[{ required: true, message: "Введите должность" }]}
          >
            <IconInput placeholder="Менеджер" icon={iconEl(Briefcase)} />
          </Form.Item>
          <Form.Item name="supervisor_id" label="Руководитель">
            <NativeSelect options={supervisors} placeholder="Выберите руководителя" allowClear />
          </Form.Item>
          <Form.Item
            name="roles"
            label="Роли"
            className="sm:col-span-2"
            rules={[{ required: true, message: "Выберите роли" }]}
          >
            <MultiSelect options={roles} placeholder="Выберите роли" />
          </Form.Item>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-600 mb-1.5">Статус</p>
            <Form.Item name="hr_status" initialValue="active" noStyle>
              <SegmentControl options={STATUS_SEG} />
            </Form.Item>
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section>
        <SectionTitle icon={<Phone size={13} />}>Контакты</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-3">
          <Form.Item
            name="corporate_email"
            label="Корпоративный Email"
            rules={[{ type: "email", message: "Некорректный email" }]}
          >
            <IconInput placeholder="user@corp.ru" icon={iconEl(Mail)} />
          </Form.Item>
          <Form.Item
            name="corporate_phone"
            label="Корпоративный телефон"
            normalize={onlyDigits9}
            rules={[{ pattern: /^\d{9}$/, message: "Введите 9 цифр" }]}
          >
            <PhoneInput placeholder="900000000" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Телефон"
            normalize={onlyDigits9}
            rules={[
              { required: true, message: "Введите телефон" },
              { pattern: /^\d{9}$/, message: "Введите 9 цифр" },
            ]}
          >
            <PhoneInput placeholder="900000000" />
          </Form.Item>
          <Form.Item
            name="personal_email"
            label="Персональный email"
            rules={[{ type: "email", message: "Некорректный email" }]}
          >
            <IconInput placeholder="user@gmail.com" icon={iconEl(Mail)} />
          </Form.Item>
          <Form.Item
            name="personal_phone"
            label="Персональный телефон"
            normalize={onlyDigits9}
            rules={[{ pattern: /^\d{9}$/, message: "Введите 9 цифр" }]}
          >
            <PhoneInput placeholder="900000000" />
          </Form.Item>
        </div>
      </section>

      {/* Финансы */}
      <section>
        <SectionTitle icon={<Landmark size={13} />}>Финансы</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-3 gap-y-3">
          <Form.Item name="salary" label="Оклад (₽)">
            <IconInput type="number" min={0} placeholder="50000" icon={iconEl(Wallet)} />
          </Form.Item>
          <Form.Item name="rating" label="Рейтинг">
            <IconInput type="number" min={0} max={100} placeholder="82" />
          </Form.Item>
          <Form.Item name="bank_account" label="Зарплатный счёт" className="sm:col-span-2">
            <IconInput placeholder="40817810000000000000" maxLength={20} icon={iconEl(CreditCard)} />
          </Form.Item>
        </div>
      </section>

      {!isEdit && (
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3">
            <Form.Item
              name="password"
              label="Пароль"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <IconInput type="password" placeholder="••••••" />
            </Form.Item>
          </div>
        </section>
      )}
    </div>
  );
};
