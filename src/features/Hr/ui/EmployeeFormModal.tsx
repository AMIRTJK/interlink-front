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

  // Тёмная тема переключается классом `.dark` на <html>. Прокидываем её в antd
  // через darkAlgorithm, чтобы модалка (фон, поля, инпуты) была тёмной, а не
  // белым пятном поверх тёмного интерфейса.
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

  // Загруженный паспорт. Для нового сотрудника — обязательный первый шаг:
  // пока паспорт не загружен, остальные поля формы не отображаются.
  const [passport, setPassport] = useState<IPassportFile | null>(null);

  // Поля показываются при редактировании или после загрузки паспорта.
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
        width={560}
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
          {/* Обязательный первый шаг при создании — загрузка паспорта. */}
          {!isEdit && (
            <PassportUploadStep value={passport} onChange={setPassport} />
          )}

          {/* Остальные поля появляются только после загрузки паспорта. */}
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
