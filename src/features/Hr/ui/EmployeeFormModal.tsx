import React from "react";
import { X } from "lucide-react";
import type { IAdminUser } from "@entities/hr";
import { If } from "@shared/ui";
import { useEmployeeFormModalState } from "./employeeFormModal/useEmployeeFormModalState";
import { PassportStepContainer } from "./employeeFormModal/PassportStepContainer";
import { EmployeeFormStepContainer } from "./employeeFormModal/EmployeeFormStepContainer";
import "./employeeForm.css";

interface IProps {
  open: boolean;
  onClose: () => void;
  employee?: IAdminUser | null;
}

export const EmployeeFormModal = ({ open, onClose, employee }: IProps) => {
  const {
    isEdit,
    values,
    errors,
    passport,
    setShowForm,
    canProceed,
    formVisible,
    ocrM,
    isPending,
    handlePassportChange,
    handleChange,
    handleProceed,
    handleSubmit,
  } = useEmployeeFormModalState({ open, onClose, employee });

  if (!open) return null;

  const badge = isEdit
    ? [employee?.last_name?.[0], employee?.first_name?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "✎"
    : "??";
  const showTitle = formVisible;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-[94vw] max-w-[860px] max-h-[88vh] flex flex-col overflow-hidden shadow-2xl z-10 border border-gray-100 dark:border-slate-800">
        <If is={showTitle}>
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="flex items-center gap-3">
              <If is={isEdit}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden bg-indigo-500!">
                  {badge}
                </div>
              </If>
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
          className={`hr-create-form px-6 pb-6 space-y-5 overflow-y-auto flex-1 scrollbar-stable ${
            showTitle ? "pt-6" : "pt-0"
          }`}
        >
          <If is={!isEdit && !formVisible}>
            <PassportStepContainer
              isOcrPending={ocrM.isPending}
              passport={passport}
              onPassportChange={handlePassportChange}
              canProceed={canProceed}
              onClose={onClose}
              onProceed={handleProceed}
            />
          </If>

          <If is={formVisible}>
            <EmployeeFormStepContainer
              isEdit={isEdit}
              canProceed={canProceed}
              passport={passport}
              onShowPassportStep={() => setShowForm(false)}
              values={values}
              errors={errors}
              onChange={handleChange}
              employee={employee}
              onClose={onClose}
              isPending={isPending}
            />
          </If>
        </form>
      </div>
    </div>
  );
};
