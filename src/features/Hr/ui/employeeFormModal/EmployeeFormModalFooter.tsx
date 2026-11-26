import React from "react";
import { If } from "@shared/ui";

interface IProps {
  formVisible: boolean;
  isEdit: boolean;
  isPending: boolean;
  canProceed: boolean;
  isOcrPending: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export function EmployeeFormModalFooter({
  formVisible,
  isEdit,
  isPending,
  canProceed,
  isOcrPending,
  onClose,
  onProceed,
}: IProps) {
  if (!formVisible && isOcrPending) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 z-10">
      <If is={formVisible}>
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
      </If>

      <If is={!formVisible}>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={onProceed}
          disabled={!canProceed}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Продолжить
        </button>
      </If>
    </div>
  );
}
