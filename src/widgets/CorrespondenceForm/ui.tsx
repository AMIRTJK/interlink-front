import React, { useEffect } from "react";
import { Form, Input, Button as AntButton, Tag, Col, Row } from "antd";
import { Button, DateField, If, SelectField } from "@shared/ui";
import { useModalState } from "@shared/lib";
import { ExecutionModal } from "@widgets/ExecutionModal";
import executionIcon from "../../assets/icons/execution.svg";
import { ApiRoutes } from "@shared/api";
import { transformResponse } from "./lib";
import { useLocation } from "react-router";
import { CorrespondenceResponse } from "@entities/correspondence";

// Тип документа
export type CorrespondenceType = "incoming" | "outgoing";

export interface CorrespondenceFormData {
  id?: number;
  folder?: string;
  sender?: string;
  recipient?: string;
  incomingNumber?: string;
  outgoingNumber?: string;
  doc_date?: string;
  sentDate?: string;
  sender_contact?: string;
  subject?: string;
  status?: string;
}

interface CorrespondenceFormProps {
  type: CorrespondenceType;
  initialValues?: CorrespondenceResponse;
  onFinish: (values: CorrespondenceFormData) => void;
  isLoading?: boolean;
  title: string;
  isReadOnly?: boolean;
  showSaveButton?: boolean;
  isAllowed?: boolean;
  initialExecutionOpen?: boolean;
}

export const CorrespondenceForm: React.FC<CorrespondenceFormProps> = ({
  type,
  initialValues,
  onFinish,
  isLoading,
  title,
  showSaveButton = true,
  isAllowed,
  initialExecutionOpen = false,
}) => {
  const [form] = Form.useForm();
  const executionModalState = useModalState();

  const isIncoming = type === "incoming";
  const isOutgoing = type === "outgoing";

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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
      <div className="mb-6 border-b border-gray-100 pb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {initialValues?.status && (
          <Tag color="blue">{initialValues.status}</Tag>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        className="flex flex-col flex-1"
      >
        <Row gutter={20}>
          <Col span={12}>
            <SelectField
              rules={[{ required: true, message: "Выберите папку" }]}
              label="Папки"
              name="folder"
              url={ApiRoutes.CORRESPONDENCE_FOLDERS}
              placeholder="Выберите папку"
              showSearch
              allowClear
              method="GET"
              transformResponse={(data) => transformResponse(data)}
              searchParamKey="name"
            />
          </Col>
          <If is={isIncoming}>
            <Col span={12}>
              <SelectField
                rules={[{ required: true, message: "Выберит отправителя" }]}
                label="Отправитель"
                name="sender_name"
                url={ApiRoutes.GET_ORGANIZATIONS}
                placeholder="Выберите отправителя"
                showSearch
                allowClear
                method="GET"
                transformResponse={(data) => transformResponse(data)}
                searchParamKey="search"
              />
            </Col>
          </If>

          <If is={isOutgoing}>
            <Col span={12}>
              <Form.Item
                label={
                  <span className="text-gray-500 font-medium">Получатель</span>
                }
                name="recipient"
                rules={[{ required: true, message: "Укажите получателя" }]}
              >
                <Input placeholder="Кому" className="h-10 rounded-lg" />
              </Form.Item>
            </Col>
          </If>

          <Col span={12}>
            <Form.Item
              label={
                <span className="text-gray-500 font-medium">
                  Входящий номер
                </span>
              }
              name="incomingNumber"
            >
              <Input
                placeholder="Укажите входящий номер"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>

          <If is={isIncoming}>
            <Col span={12}>
              <DateField
                className="w-full h-10 rounded-lg"
                name="doc_date"
                label="Дата получения"
                rules={[{ required: true, message: "Выберите дату" }]}
                placeholder="Выберите дату"
              />
            </Col>
          </If>

          <If is={isOutgoing}>
            <Col span={12}>
              <DateField
                className="w-full h-10 rounded-lg"
                name="sentDate"
                label=" Дата отправки"
                rules={[{ required: true, message: "Выберите дату" }]}
                placeholder="Выберите дату"
              />
            </Col>
          </If>

          <Col span={12}>
            <Form.Item
              label={
                <span className="text-gray-500 font-medium">
                  Исходящий номер
                </span>
              }
              name="outgoingNumber"
            >
              <Input
                placeholder="Укажите исходящий номер"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={<span className="text-gray-500 font-medium">Контакт</span>}
              name="sender_contact"
            >
              <Input
                placeholder="Введите контактные данные"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label={<span className="text-gray-500 font-medium">Тема</span>}
              name="subject"
            >
              <Input placeholder="Напишите тему" className="h-10 rounded-lg" />
            </Form.Item>
          </Col>
        </Row>

        <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between">
          <div>
            <Button
              type="primary"
              text="На исполнение"
              withIcon
              icon={executionIcon}
              iconAlt="execution"
              className="bg-[#0037AF]! text-white! px-6! h-11! rounded-xl!"
              onClick={executionModalState.open}
            />
          </div>

          <div className="flex gap-3">
            <AntButton
              className="h-11 px-6 rounded-xl border-gray-300 text-gray-600 font-medium"
              onClick={() => window.history.back()}
            >
              Назад
            </AntButton>

            <If is={showSaveButton}>
              <AntButton
                type="primary"
                htmlType="submit"
                loading={isLoading || !isAllowed}
                className="bg-blue-600 h-11 px-8 rounded-xl font-medium shadow-blue-200 shadow-lg hover:bg-blue-700"
              >
                Сохранить
              </AntButton>
            </If>
          </div>
        </div>
      </Form>

      <ExecutionModal
        isOpen={executionModalState.isOpen}
        onClose={executionModalState.close}
        correspondenceData={initialValues}
      />
    </div>
  );
};
