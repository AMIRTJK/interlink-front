import { useMemo } from "react";
import {
  CircleUserRound, ScrollText, Briefcase, Phone, Landmark,
  Mail, Wallet, CreditCard, Hash, MapPin,
} from "lucide-react";
import { ApiRoutes } from "@shared/api";
import { useGetQuery } from "@shared/lib";
import { If } from "@shared/ui";
import {
  transformOrgs,
  transformDeps,
  transformRoles,
} from "../lib";
import { FormItem, IconInput, PhoneInput, SegmentControl, SectionTitle } from "./inputs";
import { CustomSelect } from "./CustomSelect";
import { CustomDatePicker } from "./CustomDatePicker";
import { MultiSelect } from "./MultiSelect";
import { PhotoUploadField } from "./PhotoUploadField";

interface IOption {
  value: string;
  label: string;
}

interface ISegOption {
  value: string;
  label: string;
  activeClass: string;
  showCheck?: boolean;
}

interface IProps {
  values: Record<string, any>;
  errors: Record<string, string>;
  handleChange: (name: string, value: any) => void;
  organizationId?: string;
  isEdit: boolean;
  initialPhoto?: string;
}

const GENDER_SEG: ISegOption[] = [
  { value: "male", label: "Мужской", activeClass: "bg-indigo-100 text-indigo-700 border-transparent dark:bg-indigo-950 dark:text-indigo-300" },
  { value: "female", label: "Женский", activeClass: "bg-indigo-100 text-indigo-700 border-transparent dark:bg-indigo-950 dark:text-indigo-300" },
];

const STATUS_SEG: ISegOption[] = [
  { value: "active", label: "Активен", showCheck: true, activeClass: "bg-emerald-100 text-emerald-700 border-transparent ring-2 ring-offset-1 ring-emerald-400/50 dark:bg-emerald-950 dark:text-emerald-300" },
  { value: "vacation", label: "В отпуске", activeClass: "bg-red-100 text-red-700 border-transparent ring-2 ring-offset-1 ring-red-400/50 dark:bg-red-950 dark:text-red-300" },
  { value: "business_trip", label: "В командировке", activeClass: "bg-amber-100 text-amber-700 border-transparent ring-2 ring-offset-1 ring-amber-400/50 dark:bg-amber-950 dark:text-amber-300" },
];

const iconEl = (Icon: typeof Mail) => <Icon size={14} />;

export const EmployeeFormFields = ({ values, errors, handleChange, organizationId, isEdit, initialPhoto }: IProps) => {
  const { data: orgRes } = useGetQuery({ url: ApiRoutes.GET_ORGANIZATIONS, method: "GET" });
  const { data: roleRes } = useGetQuery({ url: ApiRoutes.GET_ROLES, method: "GET" });
  const { data: userRes } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    method: "GET",
    params: { with_departments: 1, per_page: 1000 },
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
    const arr = (userRes as { data?: { data?: { id: number; last_name?: string; first_name?: string }[] } })?.data?.data || [];
    return arr.map((u) => ({
      value: String(u.id),
      label: [u.last_name, u.first_name].filter(Boolean).join(" "),
    }));
  }, [userRes]);

  return (
    <div className="space-y-4">
      <PhotoUploadField initialUrl={initialPhoto} onChange={(file) => handleChange("photo", file)} />

      <section>
        <SectionTitle icon={<CircleUserRound size={13} />}>Личные данные</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-3">
          <FormItem label="Фамилия" error={errors.last_name} required>
            <IconInput placeholder="Иванов" value={values.last_name} onChange={(e) => handleChange("last_name", e.target.value)} hasError={!!errors.last_name} />
          </FormItem>
          <FormItem label="Имя" error={errors.first_name} required>
            <IconInput placeholder="Александр" value={values.first_name} onChange={(e) => handleChange("first_name", e.target.value)} hasError={!!errors.first_name} />
          </FormItem>
          <FormItem label="Отчество" error={errors.middle_name}>
            <IconInput placeholder="Сергеевич" value={values.middle_name} onChange={(e) => handleChange("middle_name", e.target.value)} hasError={!!errors.middle_name} />
          </FormItem>
          <FormItem label="Дата рождения" error={errors.birth_date}>
            <CustomDatePicker value={values.birth_date} onChange={(v) => handleChange("birth_date", v)} hasError={!!errors.birth_date} />
          </FormItem>
          <FormItem label="Пол" error={errors.gender} className="sm:col-span-2">
            <SegmentControl options={GENDER_SEG} value={values.gender} onChange={(v) => handleChange("gender", v)} />
          </FormItem>
        </div>
      </section>

      <section>
        <SectionTitle icon={<ScrollText size={13} />}>Документы</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-3">
          <FormItem label="Серия паспорта" error={errors.passport_series}>
            <IconInput placeholder="A" maxLength={5} icon={iconEl(ScrollText)} value={values.passport_series} onChange={(e) => handleChange("passport_series", e.target.value)} hasError={!!errors.passport_series} />
          </FormItem>
          <FormItem label="Номер паспорта" error={errors.passport_number}>
            <IconInput placeholder="1234567" maxLength={10} value={values.passport_number} onChange={(e) => handleChange("passport_number", e.target.value)} hasError={!!errors.passport_number} />
          </FormItem>
          <FormItem label="ИНН" error={errors.inn}>
            <IconInput placeholder="040012345" maxLength={12} icon={iconEl(Hash)} value={values.inn} onChange={(e) => handleChange("inn", e.target.value)} hasError={!!errors.inn} />
          </FormItem>
          <FormItem label="Адрес" error={errors.address} className="sm:col-span-3">
            <IconInput placeholder="Душанбе" icon={iconEl(MapPin)} value={values.address} onChange={(e) => handleChange("address", e.target.value)} hasError={!!errors.address} />
          </FormItem>
        </div>
      </section>

      <section>
        <SectionTitle icon={<Briefcase size={13} />}>Рабочие данные</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-3">
          <FormItem label="Организация" error={errors.organization_id} required>
            <CustomSelect options={organizations} placeholder="Выберите организацию" value={values.organization_id} onChange={(v) => handleChange("organization_id", v)} hasError={!!errors.organization_id} />
          </FormItem>
          <FormItem label="Отдел" error={errors.department_ids} required>
            <MultiSelect options={departments} disabled={!organizationId} placeholder={organizationId ? "Выберите отделы" : "Сначала организацию"} value={values.department_ids} onChange={(v) => handleChange("department_ids", v)} hasError={!!errors.department_ids} />
          </FormItem>
          <FormItem label="Должность" error={errors.position} required>
            <IconInput placeholder="Менеджер" icon={iconEl(Briefcase)} value={values.position} onChange={(e) => handleChange("position", e.target.value)} hasError={!!errors.position} />
          </FormItem>
          <FormItem label="Руководитель" error={errors.supervisor_id}>
            <CustomSelect options={supervisors} placeholder="Выберите руководитель" allowClear value={values.supervisor_id} onChange={(v) => handleChange("supervisor_id", v)} hasError={!!errors.supervisor_id} />
          </FormItem>
          <FormItem label="Роли" error={errors.roles} className="sm:col-span-2" required>
            <MultiSelect options={roles} placeholder="Выберите роли" value={values.roles} onChange={(v) => handleChange("roles", v)} hasError={!!errors.roles} />
          </FormItem>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-1.5">Статус</p>
            <SegmentControl options={STATUS_SEG} value={values.hr_status || "active"} onChange={(v) => handleChange("hr_status", v)} />
          </div>
        </div>
      </section>

      <section>
        <SectionTitle icon={<Phone size={13} />}>Контакты</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-3">
          <FormItem label="Корпоративный Email" error={errors.corporate_email}>
            <IconInput placeholder="user@corp.ru" icon={iconEl(Mail)} value={values.corporate_email} onChange={(e) => handleChange("corporate_email", e.target.value)} hasError={!!errors.corporate_email} />
          </FormItem>
          <FormItem label="Корпоративный телефон" error={errors.corporate_phone}>
            <PhoneInput placeholder="900000000" value={values.corporate_phone} onChange={(v) => handleChange("corporate_phone", v)} hasError={!!errors.corporate_phone} />
          </FormItem>
          <FormItem label="Телефон" error={errors.phone} required>
            <PhoneInput placeholder="900000000" value={values.phone} onChange={(v) => handleChange("phone", v)} hasError={!!errors.phone} />
          </FormItem>
          <FormItem label="Персональный email" error={errors.personal_email}>
            <IconInput placeholder="user@gmail.com" icon={iconEl(Mail)} value={values.personal_email} onChange={(e) => handleChange("personal_email", e.target.value)} hasError={!!errors.personal_email} />
          </FormItem>
          <FormItem label="Персональный телефон" error={errors.personal_phone}>
            <PhoneInput placeholder="900000000" value={values.personal_phone} onChange={(v) => handleChange("personal_phone", v)} hasError={!!errors.personal_phone} />
          </FormItem>
        </div>
      </section>

      <section>
        <SectionTitle icon={<Landmark size={13} />}>Финансы</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-3 gap-y-3">
          <FormItem label="Оклад (₽)" error={errors.salary}>
            <IconInput type="number" min={0} placeholder="50000" icon={iconEl(Wallet)} value={values.salary} onChange={(e) => handleChange("salary", e.target.value)} hasError={!!errors.salary} />
          </FormItem>
          <FormItem label="Рейтинг" error={errors.rating}>
            <IconInput type="number" min={0} max={100} placeholder="82" value={values.rating} onChange={(e) => handleChange("rating", e.target.value)} hasError={!!errors.rating} />
          </FormItem>
          <FormItem label="Зарплатный счёт" error={errors.bank_account} className="sm:col-span-2">
            <IconInput placeholder="40817810000000000000" maxLength={20} icon={iconEl(CreditCard)} value={values.bank_account} onChange={(e) => handleChange("bank_account", e.target.value)} hasError={!!errors.bank_account} />
          </FormItem>
        </div>
      </section>

      <If is={!isEdit}>
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3">
            <FormItem label="Пароль" error={errors.password} required>
              <IconInput type="password" placeholder="••••••" value={values.password} onChange={(e) => handleChange("password", e.target.value)} hasError={!!errors.password} />
            </FormItem>
          </div>
        </section>
      </If>
    </div>
  );
};
