import { useEffect } from "react";
import { Modal, Form } from "antd";
import { CreateUserDTO, IAdminUser } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { EmployeeFormFields } from "./EmployeeFormFields";

interface IProps {
  open: boolean;
  onClose: () => void;
  employee?: IAdminUser | null;
}

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
        <EmployeeFormFields
          form={form}
          organizationId={organizationId}
          isEdit={isEdit}
        />
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
