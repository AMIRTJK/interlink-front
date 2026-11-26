import React from "react";
import { If } from "@shared/ui";
import { PassportUploadStep, IPassportSides } from "../PassportUploadStep";
import { PassportScanLoadingState } from "./PassportScanLoadingState";

interface IProps {
  isOcrPending: boolean;
  passport: IPassportSides;
  onPassportChange: (val: IPassportSides) => void;
}

export function PassportStepContainer({
  isOcrPending,
  passport,
  onPassportChange,
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
      </If>
    </>
  );
}
