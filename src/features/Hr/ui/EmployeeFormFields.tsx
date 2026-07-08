import { Form, Input, Select, DatePicker, InputNumber, FormInstance } from "antd";
import { ApiRoutes } from "@shared/api";
import { SelectField } from "@shared/ui";
import {
  transformOrgs,
  transformDeps,
  transformRoles,
  onlyDigits9,
  STATUS_OPTIONS,
  GENDER_OPTIONS,
} from "../lib";

interface IProps {
  form: FormInstance;
  organizationId?: string;
  isEdit: boolean;
}

export const EmployeeFormFields = ({ form, organizationId, isEdit }: IProps) => {
  return (
    <>
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        Личные данные
      </p>
      <div className="grid grid-cols-3 gap-x-3">
        <Form.Item
          name="last_name"
          label="Фамилия"
          rules={[{ required: true, message: "Введите фамилию" }]}
        >
          <Input placeholder="Иванов" />
        </Form.Item>
        <Form.Item
          name="first_name"
          label="Имя"
          rules={[{ required: true, message: "Введите имя" }]}
        >
          <Input placeholder="Иван" />
        </Form.Item>
        <Form.Item name="middle_name" label="Отчество">
          <Input placeholder="Иванович" />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-x-3">
        <Form.Item name="birth_date" label="Дата рождения">
          <Input type="date" />
        </Form.Item>
        <Form.Item name="gender" label="Пол">
          <Select options={GENDER_OPTIONS} placeholder="Выберите пол" allowClear />
        </Form.Item>
      </div>

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 mt-1">
        Документы
      </p>
      <div className="grid grid-cols-3 gap-x-3">
        <Form.Item name="passport_series" label="Серия паспорта">
          <Input placeholder="A" maxLength={5} />
        </Form.Item>
        <Form.Item name="passport_number" label="Номер паспорта">
          <Input placeholder="1234567" maxLength={10} />
        </Form.Item>
        <Form.Item name="inn" label="ИНН">
          <Input placeholder="040012345" maxLength={12} />
        </Form.Item>
      </div>
      <Form.Item name="address" label="Адрес">
        <Input placeholder="Душанбе" />
      </Form.Item>

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 mt-1">
        Рабочие данные
      </p>
      <SelectField
        name="organization_id"
        label="Организация"
        rules={[{ required: true, message: "Выберите организацию" }]}
        url={ApiRoutes.GET_ORGANIZATIONS}
        method="GET"
        isFetchAllowed
        transformResponse={transformOrgs}
        placeholder="Выберите организацию"
        onChange={(val) =>
          form.setFieldsValue({
            organization_id: val,
            department_ids: undefined,
          })
        }
      />
      <SelectField
        name="department_ids"
        label="Отделы"
        rules={[{ required: true, message: "Выберите отдел" }]}
        url={organizationId ? ApiRoutes.GET_DEPARTMENTS : undefined}
        params={
          organizationId ? { organization_id: organizationId } : undefined
        }
        method="GET"
        isFetchAllowed={!!organizationId}
        transformResponse={transformDeps}
        placeholder={
          organizationId ? "Выберите отделы" : "Сначала выберите организацию"
        }
        disabled={!organizationId}
        mode="multiple"
      />
      <div className="grid grid-cols-2 gap-x-3">
        <Form.Item
          name="position"
          label="Должность"
          rules={[{ required: true, message: "Введите должность" }]}
        >
          <Input placeholder="HR manager" />
        </Form.Item>
        <Form.Item name="hr_status" label="Статус" initialValue="active">
          <Select options={STATUS_OPTIONS} />
        </Form.Item>
      </div>
      <SelectField
        name="roles"
        label="Роли"
        rules={[{ required: true, message: "Выберите роли" }]}
        url={ApiRoutes.GET_ROLES}
        method="GET"
        isFetchAllowed
        transformResponse={transformRoles}
        placeholder="Выберите роли"
        mode="multiple"
      />
      <SelectField
        name="supervisor_id"
        label="Руководитель"
        url={ApiRoutes.GET_USERS}
        params={{ with_departments: 1 }}
        method="GET"
        isFetchAllowed
        transformResponse={(res: unknown) => {
          const data =
            (res as { data: { data: { id: number; last_name?: string; first_name?: string }[] } })
              ?.data?.data || [];
          return data.map((u) => ({
            value: String(u.id),
            label: [u.last_name, u.first_name].filter(Boolean).join(" "),
          }));
        }}
        placeholder="Выберите руководителя"
        allowClear
      />

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 mt-1">
        Контакты
      </p>
      <div className="grid grid-cols-2 gap-x-3">
        <Form.Item
          name="phone"
          label="Телефон"
          normalize={onlyDigits9}
          rules={[
            { required: true, message: "Введите телефон" },
            { pattern: /^\d{9}$/, message: "Введите 9 цифр" },
          ]}
        >
          <Input addonBefore="+992" placeholder="900000000" maxLength={9} />
        </Form.Item>
        <Form.Item
          name="personal_phone"
          label="Персональный телефон"
          normalize={onlyDigits9}
          rules={[{ pattern: /^\d{9}$/, message: "Введите 9 цифр" }]}
        >
          <Input addonBefore="+992" placeholder="900000000" maxLength={9} />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-x-3">
        <Form.Item
          name="personal_email"
          label="Персональный email"
          rules={[{ type: "email", message: "Некорректный email" }]}
        >
          <Input placeholder="user@gmail.com" />
        </Form.Item>
        <Form.Item
          name="corporate_email"
          label="Корпоративный email"
          rules={[{ type: "email", message: "Некорректный email" }]}
        >
          <Input placeholder="i.ivanov@company.tj" />
        </Form.Item>
      </div>
      <Form.Item
        name="corporate_phone"
        label="Корпоративный телефон"
        normalize={onlyDigits9}
        rules={[{ pattern: /^\d{9}$/, message: "Введите 9 цифр" }]}
      >
        <Input addonBefore="+992" placeholder="900000000" maxLength={9} />
      </Form.Item>

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 mt-1">
        Финансы
      </p>
      <div className="grid grid-cols-3 gap-x-3">
        <Form.Item name="salary" label="Оклад">
          <InputNumber
            placeholder="4500"
            min={0}
            className="w-full!"
          />
        </Form.Item>
        <Form.Item name="rating" label="Рейтинг">
          <InputNumber placeholder="82" min={0} max={100} className="w-full!" />
        </Form.Item>
        <Form.Item name="bank_account" label="Банковский счёт">
          <Input placeholder="20202972000012345678" />
        </Form.Item>
      </div>
      {!isEdit && (
        <Form.Item
          name="password"
          label="Пароль"
          rules={[{ required: true, message: "Введите пароль" }]}
        >
          <Input.Password placeholder="••••••" />
        </Form.Item>
      )}
    </>
  );
};
