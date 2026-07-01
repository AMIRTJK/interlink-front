import { Form, Input, Select, FormInstance } from "antd";
import { ApiRoutes } from "@shared/api";
import { SelectField } from "@shared/ui";
import {
  transformOrgs,
  transformDeps,
  transformRoles,
  onlyDigits9,
  STATUS_OPTIONS,
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
      <div className="grid grid-cols-2 gap-x-3">
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
          <Input placeholder="Александр" />
        </Form.Item>
      </div>

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
            department_id: undefined,
          })
        }
      />
      <SelectField
        name="department_id"
        label="Отдел"
        rules={[{ required: true, message: "Выберите отдел" }]}
        url={organizationId ? ApiRoutes.GET_DEPARTMENTS : undefined}
        params={
          organizationId ? { organization_id: organizationId } : undefined
        }
        method="GET"
        isFetchAllowed={!!organizationId}
        transformResponse={transformDeps}
        placeholder={
          organizationId ? "Выберите отдел" : "Сначала выберите организацию"
        }
        disabled={!organizationId}
      />
      <div className="grid grid-cols-2 gap-x-3">
        <Form.Item
          name="position"
          label="Должность"
          rules={[{ required: true, message: "Введите должность" }]}
        >
          <Input placeholder="Менеджер" />
        </Form.Item>
        <Form.Item name="status" label="Статус" initialValue="active">
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

      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 mt-1">
        Контакты и финансы
      </p>
      <div className="grid grid-cols-2 gap-x-3">
        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: "email", message: "Некорректный email" }]}
        >
          <Input placeholder="user@corp.ru" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Телефон"
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
          name="personal_phone"
          label="Персональный телефон"
          normalize={onlyDigits9}
          rules={[{ pattern: /^\d{9}$/, message: "Введите 9 цифр" }]}
        >
          <Input addonBefore="+992" placeholder="900000000" maxLength={9} />
        </Form.Item>
      </div>
      <div className="grid grid-cols-2 gap-x-3">
        <Form.Item name="salary" label="Оклад (₽)">
          <Input type="number" placeholder="50000" />
        </Form.Item>
        {!isEdit && (
          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password placeholder="••••••" />
          </Form.Item>
        )}
      </div>
    </>
  );
};
