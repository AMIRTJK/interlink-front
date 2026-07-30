import React from "react";
import { AlertTriangle } from "lucide-react";
import { If } from "@shared/ui";
import { EmployeeFormFields } from "../EmployeeFormFields";
import type { IPassportSides } from "../PassportUploadStep";
import { resolveEmployeePhotoUrl } from "../../lib";
import type { IAdminUser } from "@entities/hr";

interface IProps {
  isEdit: boolean;
  canProceed: boolean;
  passport: IPassportSides;
  onShowPassportStep: () => void;
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (name: string, value: any) => void;
  employee?: IAdminUser | null;
  onClose: () => void;
  isPending: boolean;
}

export function EmployeeFormStepContainer({
  isEdit,
  canProceed,
  passport,
  onShowPassportStep,
  values,
  errors,
  onChange,
  employee,
  onClose,
  isPending,
}: IProps) {
  return (
    <>
      <If is={!isEdit}>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs leading-relaxed">
          <AlertTriangle
            size={16}
            className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
          />
          <div>
            <span className="font-semibold block mb-0.5">Внимание!</span>
            OCR-сканирование паспорта не гарантирует 100% точность
            автозаполнения. Перед созданием сотрудника обязательно проверьте и
            скорректируйте распознанные данные.
          </div>
        </div>
      </If>

      <If is={!isEdit && canProceed}>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 mr-1">
            Паспорт:
          </span>
          <If is={!!passport.front}>
            <img
              src={passport.front?.previewUrl}
              alt="Лицевая"
              className="h-12 w-16 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-slate-700"
            />
          </If>
          <If is={!!passport.back}>
            <img
              src={passport.back?.previewUrl}
              alt="Обратная"
              className="h-12 w-16 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-slate-700"
            />
          </If>
          <button
            type="button"
            onClick={onShowPassportStep}
            className="ml-auto text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Изменить
          </button>
        </div>
      </If>

      <EmployeeFormFields
        values={values}
        errors={errors}
        handleChange={onChange}
        organizationId={values.organization_id}
        isEdit={isEdit}
        initialPhoto={resolveEmployeePhotoUrl(employee) || undefined}
      />

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
    </>
  );
}
