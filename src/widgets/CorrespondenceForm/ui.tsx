import "./style.css";
import React, { useEffect, useMemo } from "react";
import { Form, notification } from "antd";
import { If } from "@shared/ui";
import { useModalState } from "@shared/lib";
import { ExecutionModal } from "@widgets/ExecutionModal";
import { useLocation } from "react-router";
import {
  CorrespondenceControlPanel,
  CorrespondenseStatus,
} from "@entities/correspondence";
import {
  STEPS_ITEMS,
  type CorrespondenceFormProps,
} from "./correspondenceForm/correspondenceFormModel";
import { CustomStepper } from "./correspondenceForm/CustomStepper";
import { DocumentFieldsSection } from "./correspondenceForm/DocumentFieldsSection";
import { ResolutionSection } from "./correspondenceForm/ResolutionSection";

export type {
  CorrespondenceFormVariant,
  CorrespondenceFormData,
} from "./correspondenceForm/correspondenceFormModel";

export const CorrespondenceForm: React.FC<CorrespondenceFormProps> = ({
  type,
  initialValues,
  onFinish,
  isLoading,
  title,
  isAllowed,
  initialExecutionOpen = false,
  variant,
}) => {
  const [form] = Form.useForm();
  const executionModalState = useModalState();

  const isIncoming = type === "external-incoming";
  const isOutgoing = type === "external-outgoing";

  const location = useLocation();

  useEffect(() => {
    const openFromNavigation = location.state?.openExecution;

    if (openFromNavigation || initialExecutionOpen) {
      executionModalState.open();
      if (openFromNavigation) {
        window.history.replaceState({}, document.title);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialExecutionOpen, location.state]);

  const currentStatus =
    (initialValues?.status as string) || CorrespondenseStatus.DRAFT;

  const currentStep = useMemo(() => {
    switch (currentStatus) {
      case CorrespondenseStatus.DRAFT:
        return 0; // Черновик
      case CorrespondenseStatus.TO_REGISTER:
        return 1; // Регистрация
      case CorrespondenseStatus.TO_VISA:
        return 2; // На резолюции
      case CorrespondenseStatus.TO_EXECUTE:
        return 3; // На исполнении
      case CorrespondenseStatus.TO_APPROVE:
      case CorrespondenseStatus.TO_SIGN:
        return 4; // Подготовка ответа
      case CorrespondenseStatus.DONE:
        return 5; // Завершено
      case CorrespondenseStatus.CANCELLED:
        return 0;
      default:
        return 0;
    }
  }, [currentStatus]);

  const handleReject = () => {
    notification.info({ message: "Функционал отклонения в разработке" });
  };

  const handleComplete = () => {
    notification.success({ message: "Документ помечен как завершенный" });
  };

  const labelStyle = "text-[#6D8AC9]! text-sm! mb-1! block! font-normal!";
  const inputStyle =
    variant === "view"
      ? "view-input w-full!" // Цвета заданы в style.css
      : "create-input w-full!";

  return (
    <div className="bg-white rounded-2xl p-0 shadow-sm flex flex-col overflow-hidden">
      {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <CorrespondenceControlPanel
        isSaving={isLoading}
        isAllowed={isAllowed}
        onSave={form.submit}
        onResolution={executionModalState.open}
        onReject={handleReject}
        onComplete={handleComplete}
      />

      {/* ТЕЛО ФОРМЫ */}
      <div className="flex-1 overflow-y-auto px-6 pb-1 custom-scrollbar">
        {/* ЗАГОЛОВОК */}
        <h1 className="correspondence-title">{title}</h1>

        {/* CUSTOM STEPPER */}
        <div className="mb-10 w-full px-2">
          <CustomStepper items={STEPS_ITEMS} current={currentStep} />
        </div>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={onFinish}
          className="flex flex-col gap-10"
          requiredMark={false}
        >
          {/* ДАННЫЕ ДОКУМЕНТА */}
          <DocumentFieldsSection
            isIncoming={isIncoming}
            isOutgoing={isOutgoing}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
          />

          {/* РЕЗОЛЮЦИЯ */}
          <If is={variant === "view"}>
            <ResolutionSection onExecute={executionModalState.open} />
          </If>
        </Form>
      </div>

      <ExecutionModal
        isOpen={executionModalState.isOpen}
        onClose={executionModalState.close}
        correspondenceData={initialValues}
      />
    </div>
  );
};
