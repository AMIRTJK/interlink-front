import { useEffect, useState } from "react";
import { Modal, Form, ConfigProvider, theme } from "antd";
import { CreateUserDTO, IAdminUser } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { PassportUploadStep, IPassportFile } from "./PassportUploadStep";

interface IProps {
  open: boolean;
  onClose: () => void;
  employee?: IAdminUser | null;
}

export const EmployeeFormModal = ({ open, onClose, employee }: IProps) => {
  const [form] = Form.useForm();
  const isEdit = !!employee?.id;

  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const el = document.documentElement;
    const observer = new MutationObserver(() =>
      setIsDark(el.classList.contains("dark")),
    );
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const [passport, setPassport] = useState<IPassportFile | null>(null);

  const fieldsVisible = isEdit || !!passport;

  const createM = useMutationQuery<CreateUserDTO>({
    url: ApiRoutes.CREATE_USER,
    method: "POST",
    messages: {
      success: "Сотрудник создан",
      invalidate: [ApiRoutes.GET_USERS],
    },
  });

  const updateM = useMutationQuery<Partial<CreateUserDTO>>({
    url: () => ApiRoutes.UPDATE_USER.replace(":id", String(employee?.id)),
    method: "PUT",
    messages: {
      success: "Сотрудник обновлён",
      invalidate: [ApiRoutes.GET_USERS],
    },
  });

  const organizationId = Form.useWatch("organization_id", form);

  useEffect(() => {
    if (!open) return;
    setPassport(null);
    if (employee) {
      form.setFieldsValue({
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
        birth_date: employee.birth_date,
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

    const deptIds = Array.isArray(values.department_ids)
      ? (values.department_ids as string[]).map(Number)
      : undefined;

    const payload: Record<string, unknown> = {
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

    if (isEdit) delete payload.password;

    const onSuccess = () => {
      form.resetFields();
      onClose();
    };
    if (isEdit)
      updateM.mutate(payload as Partial<CreateUserDTO>, { onSuccess });
    else createM.mutate(payload as unknown as CreateUserDTO, { onSuccess });
  };

  const isPending = isEdit ? updateM.isPending : createM.isPending;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={640}
        destroyOnClose
        title={
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {isEdit ? "✎" : "+"}
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 leading-tight dark:text-slate-100">
                {isEdit ? "Редактирование сотрудника" : "Новый сотрудник"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Личные и рабочие данные
              </p>
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
          {!isEdit && (
            <PassportUploadStep value={passport} onChange={setPassport} />
          )}

          {fieldsVisible && (
            <EmployeeFormFields
              form={form}
              organizationId={organizationId}
              isEdit={isEdit}
            />
          )}

          {fieldsVisible && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors dark:text-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
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
          )}
        </Form>
      </Modal>
    </ConfigProvider>
  );
};
