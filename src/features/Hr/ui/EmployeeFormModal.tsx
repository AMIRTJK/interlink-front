import { useEffect, useState } from "react";
import { Modal, Form, ConfigProvider, theme } from "antd";
import { X } from "lucide-react";
import { CreateUserDTO, IAdminUser } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { PassportUploadStep, IPassportFile } from "./PassportUploadStep";
import "./employeeForm.css";

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

  const badge = isEdit
    ? [employee?.last_name?.[0], employee?.first_name?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "✎"
    : "??";

  // Заголовок прячем на шаге загрузки паспорта (когда полей ещё не видно)
  const showTitle = isEdit || fieldsVisible;

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
        width="min(860px, 94vw)"
        centered
        destroyOnClose
        closable={false}
        title={null}
        className="hr-create-modal"
        styles={{
          body: {
            padding: 0,
            maxHeight: "88vh",
            overflowY: "auto",
            scrollbarGutter: "stable",
          },
        }}
      >
        {/* Шапка. Во время загрузки паспорта заголовок скрыт — остаётся только крестик. */}
        <div className="flex items-center justify-between pl-6 pr-7 pt-5 pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
          {showTitle ? (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden"
                style={{ backgroundColor: isEdit ? "#6366f1" : "#ef4444" }}
              >
                {badge}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {isEdit ? "Редактирование сотрудника" : "Новый сотрудник"}
                </h2>
              </div>
            </div>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-gray-100 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onValuesChange={(changed) => {
            // При смене организации сбрасываем выбранные отделы
            if (Object.prototype.hasOwnProperty.call(changed, "organization_id")) {
              form.setFieldsValue({ department_ids: undefined });
            }
          }}
          className="hr-create-form pl-6 pr-7 pt-4 pb-6 space-y-5"
        >
          {!isEdit && (
            <PassportUploadStep value={passport} onChange={setPassport} />
          )}

          {fieldsVisible && (
            <EmployeeFormFields
              form={form}
              organizationId={organizationId}
              isEdit={isEdit}
              initialPhoto={employee?.photo_path || undefined}
            />
          )}

          {fieldsVisible && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
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
