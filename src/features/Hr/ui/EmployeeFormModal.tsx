import { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { CreateUserDTO, IAdminUser } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { SelectField } from "@shared/ui";

interface IProps {
  open: boolean;
  onClose: () => void;
  employee?: IAdminUser | null;
}

const transformOrgs = (res: unknown) => {
  const data =
    (res as { data: { data: { id: number; name: string }[] } })?.data?.data ||
    [];
  return data.map((o) => ({ value: String(o.id), label: o.name }));
};
const transformDeps = (res: unknown) => {
  const data =
    (res as { data: { data: { id: number; name: string }[] } })?.data?.data ||
    [];
  return data.map((d) => ({ value: String(d.id), label: d.name }));
};
const transformRoles = (res: unknown) => {
  const raw = (
    res as {
      data:
        | { data: { id: number; name: string }[] }
        | { id: number; name: string }[];
    }
  )?.data;
  const items =
    (Array.isArray(raw)
      ? raw
      : (raw as { data: { id: number; name: string }[] })?.data) || [];
  return items.map((r) => ({ value: r.name, label: r.name }));
};

// Оставляем только цифры, максимум 9 (номер после +992)
const onlyDigits9 = (v: string) => (v || "").replace(/\D/g, "").slice(0, 9);

const STATUS_OPTIONS = [
  { value: "active", label: "Активен" },
  { value: "vacation", label: "В отпуске" },
  { value: "business_trip", label: "В командировке" },
];

export const EmployeeFormModal = ({ open, onClose, employee }: IProps) => {
  const [form] = Form.useForm();
  const isEdit = !!employee?.id;

  const createM = useMutationQuery<CreateUserDTO>({
    url: ApiRoutes.CREATE_USER,
    method: "POST",
    messages: { success: "Сотрудник создан", invalidate: [ApiRoutes.GET_USERS] },
  });
  const updateM = useMutationQuery<Partial<CreateUserDTO>>({
    url: () => ApiRoutes.UPDATE_USER.replace(":id", String(employee?.id)),
    method: "PUT",
    messages: { success: "Сотрудник обновлён", invalidate: [ApiRoutes.GET_USERS] },
  });

  const organizationId = Form.useWatch("organization_id", form);

  useEffect(() => {
    if (!open) return;
    if (employee) {
      form.setFieldsValue({
        first_name: employee.first_name,
        last_name: employee.last_name,
        position: employee.position,
        email: employee.email,
        status: employee.status,
        salary: employee.salary,
        phone: (employee.phone || "").replace(/^\+992/, ""),
        personal_email: employee.personal_email,
        personal_phone: (employee.personal_phone || "").replace(/^\+992/, ""),
        organization_id: employee.organization?.id
          ? String(employee.organization.id)
          : undefined,
        department_id: employee.department?.id
          ? String(employee.department.id)
          : employee.departments?.[0]?.id
            ? String(employee.departments[0].id)
            : undefined,
        roles: employee.roles?.map((r) => r.name),
      });
    } else {
      form.resetFields();
    }
  }, [open, employee, form]);

  const onFinish = (values: Record<string, unknown>) => {
    // Добавляем код страны к телефонам, если его нет
    const withCode = (v: unknown) => {
      const s = String(v || "");
      if (!s) return undefined;
      return s.startsWith("+") ? s : `+992${s}`;
    };
    const payload: Record<string, unknown> = {
      ...values,
      phone: withCode(values.phone),
      personal_phone: withCode(values.personal_phone),
      organization_id: Number(values.organization_id),
      department_id: Number(values.department_id),
      salary: values.salary ? Number(values.salary) : undefined,
    };
    if (isEdit) delete payload.password;
    const onSuccess = () => {
      form.resetFields();
      onClose();
    };
    if (isEdit) updateM.mutate(payload as Partial<CreateUserDTO>, { onSuccess });
    else createM.mutate(payload as unknown as CreateUserDTO, { onSuccess });
  };

  const isPending = isEdit ? updateM.isPending : createM.isPending;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnClose
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {isEdit ? "✎" : "+"}
          </div>
          <div>
            <p className="text-base font-bold text-slate-800 leading-tight">
              {isEdit ? "Редактирование сотрудника" : "Новый сотрудник"}
            </p>
            <p className="text-xs text-slate-400">Личные и рабочие данные</p>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="pt-2"
      >
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

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isEdit ? "Сохранить" : "Добавить сотрудника"}
          </button>
        </div>
      </Form>
    </Modal>
  );
};
