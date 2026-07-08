import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CreateUserDTO, IAdminUser } from "@entities/hr";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { If } from "@shared/ui";
import { EmployeeFormFields } from "./EmployeeFormFields";
import { PassportUploadStep, IPassportFile } from "./PassportUploadStep";
import { mapEmployeeToForm, prepareEmployeePayload, validateEmployee } from "../lib";
import "./employeeForm.css";

interface IProps {
  open: boolean;
  onClose: () => void;
  employee?: IAdminUser | null;
}

export const EmployeeFormModal = ({ open, onClose, employee }: IProps) => {
  const isEdit = !!employee?.id;
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passport, setPassport] = useState<IPassportFile | null>(null);

  const fieldsVisible = isEdit || !!passport;

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

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setPassport(null);
    setErrors({});
    if (employee) {
      setValues(mapEmployeeToForm(employee));
    } else {
      setValues({});
    }
  }, [open, employee]);

  const handleChange = (name: string, value: any) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "organization_id") {
        next.department_ids = undefined;
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateEmployee(values, isEdit);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = prepareEmployeePayload(values);
    if (isEdit) delete payload.password;

    const onSuccess = () => {
      setValues({});
      setErrors({});
      onClose();
    };

    if (isEdit) {
      updateM.mutate(payload as Partial<CreateUserDTO>, { onSuccess });
    } else {
      createM.mutate(payload as unknown as CreateUserDTO, { onSuccess });
    }
  };

  if (!open) return null;

  const isPending = isEdit ? updateM.isPending : createM.isPending;
  const badge = isEdit ? [employee?.last_name?.[0], employee?.first_name?.[0]].filter(Boolean).join("").toUpperCase() || "✎" : "??";
  const showTitle = isEdit || fieldsVisible;
  const organizationId = values.organization_id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-[94vw] max-w-[860px] max-h-[88vh] flex flex-col overflow-hidden shadow-2xl z-10 border border-gray-100 dark:border-slate-800">
        <If is={showTitle}>
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden ${isEdit ? "bg-indigo-500!" : "bg-red-500!"}`}>
                {badge}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                  {isEdit ? "Редактирование сотрудника" : "Новый сотрудник"}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </If>
        <If is={!showTitle}>
          <div className="flex items-center justify-between px-6 pt-6 pb-2 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
              Как сфотографировать паспорт
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </If>

        <form
          onSubmit={handleSubmit}
          className={`hr-create-form px-6 pb-6 space-y-5 overflow-y-auto flex-1 scrollbar-stable ${showTitle ? "pt-6" : "pt-0"}`}
        >
          <If is={!isEdit}>
            <PassportUploadStep value={passport} onChange={(val) => setPassport(val)} />
          </If>

          <If is={fieldsVisible}>
            <EmployeeFormFields
              values={values}
              errors={errors}
              handleChange={handleChange}
              organizationId={organizationId}
              isEdit={isEdit}
              initialPhoto={employee?.photo_path || undefined}
            />
          </If>

          <If is={fieldsVisible}>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {isEdit ? "Сохранить" : "Добавить сотрудника"}
              </button>
            </div>
          </If>
        </form>
      </div>
    </div>
  );
};
