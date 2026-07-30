import React from "react";
import { If } from "@shared/ui";
import { PassportUploadStep, IPassportSides } from "../PassportUploadStep";
import { PassportScanLoadingState } from "./PassportScanLoadingState";

interface IProps {
  isOcrPending: boolean;
  passport: IPassportSides;
  onPassportChange: (val: IPassportSides) => void;
  canProceed: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export function PassportStepContainer({
  isOcrPending,
  passport,
  onPassportChange,
  canProceed,
  onClose,
  onProceed,
}: IProps) {
  return (
    <>
      <If is={isOcrPending}>
        <PassportScanLoadingState />
      </If>

      <If is={!isOcrPending}>
        <PassportUploadStep value={passport} onChange={onPassportChange} />
        <If is={!passport.front}>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 text-center">
            Загрузите лицевую сторону паспорта, чтобы продолжить.
          </p>
        </If>
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
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
        </div>
      </If>
    </>
  );
}
