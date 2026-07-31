import React, { useState } from "react";
import { Col, Form, Row } from "antd";
import { Button, DateField, If, SelectField, TextField } from "@shared/ui";

import dateIcon from "../../assets/icons/date-icon.svg";
import arrowBottomIcon from "../../assets/icons/arrow-bottom-icon.svg";
import { IAttachment, mockFiles } from "./lib";
import {
  VISA_STATUS_OPTIONS,
  type VisaFormProps,
} from "./visaForm/visaFormModel";
import { useVisaFormState } from "./visaForm/useVisaFormState";
import { SelectedExecutorsList } from "./visaForm/SelectedExecutorsList";
import { VisaAttachmentsList } from "./visaForm/VisaAttachmentsList";

export const VisaForm: React.FC<VisaFormProps> = ({
  correspondenceData,
  className,
  onSuccess,
  onAssignExecutors,
  selectedUserIds = [],
  selectedDeptIds = [],
  selectedMainExecutorIds = [],
  onClose,
}) => {
  const [fileList] = useState<IAttachment[]>(mockFiles);

  const {
    form,
    selectedUsersList,
    selectedDeptsList,
    hasSelection,
    isFormValid,
    handleFormChange,
    handleSubmit,
  } = useVisaFormState({
    correspondenceData,
    selectedUserIds,
    selectedDeptIds,
    selectedMainExecutorIds,
    onSuccess,
    onClose,
  });

  return (
    <div
      className={`flex flex-col h-full overflow-y-auto custom-scroll ${className || ""}`}
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        onValuesChange={handleFormChange}
        className="flex-1"
      >
        <Row gutter={[20, 16]}>
          <Col span={24}>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-gray-900 leading-tight">
                  Сайдазимов Сохиб
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Старший специалист
                </p>
              </div>
            </div>
          </Col>
          <Col span={24}>
            <DateField
              className="w-full h-14! rounded-lg! [&_input::placeholder]:text-base [&_input::placeholder]:text-[#BCC5DF]!"
              name="due_at"
              label=""
              rules={[{ required: true, message: "Выберите дату" }]}
              placeholder="Срок"
              suffixIcon={<img src={dateIcon} alt="" />}
            />
          </Col>
          <Col span={24}>
            <TextField
              label=""
              name="note"
              placeholder="Виза"
              rules={[{ required: true, message: "Заполните поле" }]}
              className="h-14 rounded-lg! placeholder:text-[#BCC5DF]!"
            />
          </Col>
          <Col span={24}>
            <SelectField
              rules={[{ required: true, message: "Заполните поле" }]}
              label=""
              name="status"
              placeholder="Статус"
              showSearch
              allowClear
              options={VISA_STATUS_OPTIONS}
              className="!mb-0"
              style={{ height: "56px", borderRadius: "8px" }}
              suffixIcon={<img src={arrowBottomIcon} alt="" />}
            />
          </Col>
          <Col span={24}>
            <button
              onClick={onAssignExecutors}
              type="button"
              className="w-full cursor-pointer bg-white border border-[#0037af] text-[#0037AF] rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-all group active:transform active:scale-[0.98]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5 group-hover:scale-110 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              {hasSelection
                ? "Изменить исполнителей"
                : "Назначить исполнителей"}
            </button>
          </Col>

          <If is={hasSelection}>
            <SelectedExecutorsList
              users={selectedUsersList}
              departments={selectedDeptsList}
              mainExecutorIds={selectedMainExecutorIds}
            />
          </If>

          <Col span={24}>
            <VisaAttachmentsList files={fileList} />
          </Col>
        </Row>
      </Form>

      <div className="mt-auto pt-4">
        <Button
          type="text"
          text="Визировать"
          disabled={!isFormValid}
          onClick={handleSubmit}
          className={`
            w-full! h-12! font-medium! py-3.5! rounded-xl! shadow-lg! shadow-gray-200! transition-all!
            ${
              isFormValid
                ? "bg-[#0037AF]! text-white! cursor-pointer! hover:bg-[#002d90]! active:transform! active:scale-[0.98]!"
                : "bg-[#A0A0A0]! text-white! cursor-not-allowed!"
            }
          `}
        />
      </div>
    </div>
  );
};
