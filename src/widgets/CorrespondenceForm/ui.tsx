import "./style.css";
import React, { useEffect, useMemo } from "react";
import {
  Form,
  Input,
  Button as AntButton,
  Col,
  Row,
  notification,
  // Steps,
  Table,
  Avatar,
} from "antd";
import { DateField, If, SelectField } from "@shared/ui";
import { useModalState } from "@shared/lib";
import { ExecutionModal } from "@widgets/ExecutionModal";
import { ApiRoutes } from "@shared/api";
import { transformResponse } from "./lib";
import { useLocation } from "react-router";
import {
  CorrespondenceControlPanel,
  CorrespondenceResponse,
  CorrespondenseStatus,
} from "@entities/correspondence";
import {
  CheckOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";

export type CorrespondenceType = "incoming" | "outgoing";

export type CorrespondenceFormVariant = "create" | "view";

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
  variant: CorrespondenceFormVariant;
  type: CorrespondenceType;
  initialValues?: CorrespondenceResponse;
  onFinish: (values: CorrespondenceFormData) => void;
  isLoading?: boolean;
  title: string;
  isReadOnly?: boolean;
  isAllowed?: boolean;
  initialExecutionOpen?: boolean;
}

// 6 шагов (индексы 0-5)
const STEPS_ITEMS = [
  { title: "Черновик" }, // 0
  { title: "Регистрация" }, // 1
  { title: "На резолюции" }, // 2
  { title: "На исполнении" }, // 3
  { title: "Подготовка ответа" }, // 4
  { title: "Завершено" }, // 5
];

const HISTORY_COLUMNS = [
  {
    title: "Состояние",
    dataIndex: "status",
    key: "status",
    className: "text-blue-600 font-medium",
  },
  {
    title: "Начало",
    dataIndex: "start",
    key: "start",
    className: "text-gray-600",
  },
  {
    title: "Завершение",
    dataIndex: "end",
    key: "end",
    className: "text-gray-600",
  },
  {
    title: "Комментарий",
    dataIndex: "comment",
    key: "comment",
    className: "text-gray-600",
  },
  {
    title: "Пользователь",
    dataIndex: "user",
    key: "user",
    className: "text-gray-800",
  },
];

const HISTORY_DATA = [
  {
    key: 1,
    status: "Регистрация",
    start: "17.01.2026 9:53",
    end: "17.01.2026 19:32",
    user: "Амиров Тимур",
  },
  {
    key: 2,
    status: "На резолюцию",
    start: "17.01.2026 9:53",
    end: "17.01.2026 19:32",
    user: "Ахмедов Фируз",
  },
  {
    key: 3,
    status: "На исполнении",
    start: "17.01.2026 9:53",
    end: "17.01.2026 19:32",
    user: "Бобоев Шариф",
  },
];

interface CustomStepperProps {
  items: { title: string }[];
  current: number;
}

const CustomStepper: React.FC<CustomStepperProps> = ({ items, current }) => {
  return (
    <div className="w-full flex items-start justify-between">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCompleted = index < current;
        const isActive = index === current;

        // Цвета (можно вынести в переменные или tailwind config)
        const greenColor = "#229A2E"; // text-green-500
        const grayColor = "#D1D5DB"; // text-gray-300
        const darkGrayText = "#9CA3AF"; // text-gray-400

        return (
          <React.Fragment key={index}>
            {/* Step Circle & Label */}
            <div className="flex flex-col items-center relative z-10 gap-2 min-w-[80px]">
              {/* Circle */}
              <div
                className="flex items-center justify-center rounded-full border-2 transition-all duration-300"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: isCompleted ? greenColor : "#fff",
                  borderColor: isCompleted || isActive ? greenColor : grayColor,
                  color: isCompleted
                    ? "#fff"
                    : isActive
                      ? greenColor
                      : darkGrayText,
                }}
              >
                {isCompleted ? (
                  <CheckOutlined
                    style={{ fontSize: "18px", fontWeight: "bold" }}
                  />
                ) : (
                  <span className="text-lg font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div
                className="text-center text-xs sm:text-sm font-medium transition-colors duration-300 max-w-[120px]"
                style={{
                  color: isActive || isCompleted ? "#229A2E" : "#374151",
                }}
              >
                {item.title}
              </div>
            </div>

            {/* Line Connector (не рисуем после последнего элемента) */}
            {!isLast && (
              <div
                className="flex-1 mx-2 mt-5 h-[3px] rounded transition-all duration-500"
                style={{
                  backgroundColor: index < current ? greenColor : grayColor,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

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

  const currentStatus =
    (initialValues?.status as string) || CorrespondenseStatus.DRAFT;

  const currentStep = useMemo(() => {
    const status = initialValues?.status as string;

    const isEditable = currentStatus === CorrespondenseStatus.DRAFT;

    const canSave = isEditable;

    const canSendToResolution =
      currentStatus === CorrespondenseStatus.TO_REGISTER;
    const canReject = currentStatus === CorrespondenseStatus.TO_REGISTER;

    const canComplete = currentStatus === CorrespondenseStatus.TO_SIGN;

    switch (status) {
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

  const stepStatus =
    (initialValues?.status as string) === CorrespondenseStatus.CANCELLED
      ? "error"
      : undefined;

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
          <div>
            <h2 className="text-lg font-semibold mb-5 text-gray-800 border-b border-gray-100 pb-2">
              Данные документа
            </h2>

            <Row gutter={[24, 20]}>
              <Col span={8}>
                <If is={isIncoming}>
                  <SelectField
                    label={<span className={labelStyle}>Отправитель</span>}
                    name="sender_name"
                    url={ApiRoutes.GET_ORGANIZATIONS}
                    placeholder="Выберите отправителя"
                    showSearch
                    allowClear
                    method="GET"
                    transformResponse={(data) => transformResponse(data)}
                    searchParamKey="search"
                    selectClass={inputStyle}
                  />
                </If>
                <If is={isOutgoing}>
                  <Form.Item
                    label={<span className={labelStyle}>Получатель</span>}
                    name="recipient"
                  >
                    <Input placeholder="Получатель" className={inputStyle} />
                  </Form.Item>
                </If>
              </Col>

              <Col span={8}>
                <DateField
                  className={`w-full ${inputStyle}`}
                  name="doc_date"
                  label={<span className={labelStyle}>Дата регистрации</span>}
                  placeholder="Выберите дату"
                />
              </Col>

              <Col span={8}>
                <DateField
                  className={`w-full ${inputStyle}`}
                  name="sentDate"
                  label={<span className={labelStyle}>Дата отправления</span>}
                  placeholder="Выберите дату"
                />
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className={labelStyle}>Тема письма</span>}
                  name="subject"
                >
                  <Input placeholder="Тема письма" className={inputStyle} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className={labelStyle}>Почта</span>}
                  name="email"
                >
                  <Input placeholder="Введите почту" className={inputStyle} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className={labelStyle}>Входящий номер</span>}
                  name="incomingNumber"
                >
                  <Input
                    placeholder="Введите входящий номер"
                    className={inputStyle}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className={labelStyle}>Контакт</span>}
                  name="sender_contact"
                >
                  <Input
                    placeholder="Введите номер телефона"
                    className={inputStyle}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <SelectField
                  label={<span className={labelStyle}>Папка</span>}
                  name="folder"
                  url={ApiRoutes.CORRESPONDENCE_FOLDERS}
                  placeholder="Выберите папку"
                  method="GET"
                  transformResponse={(data) => transformResponse(data)}
                  searchParamKey="name"
                  showSearch
                  allowClear
                  selectClass={inputStyle}
                />
              </Col>

              <Col span={8}>
                <Form.Item
                  label={<span className={labelStyle}>Исходящий номер</span>}
                  name="outgoingNumber"
                >
                  <Input
                    placeholder="Введите исходящий номер"
                    className={inputStyle}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* РЕЗОЛЮЦИЯ */}
          <If is={variant === "view"}>
            <div>
              <h2 className="text-lg font-semibold mb-5 text-gray-800 border-b border-gray-100 pb-2">
                Резолюция
              </h2>
              <div className="flex flex-wrap gap-6 items-stretch">
                <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 flex-1 min-w-[300px] bg-white">
                  <Avatar
                    size={48}
                    icon={<UserOutlined />}
                    className="bg-blue-100! text-blue-600!"
                  />
                  <div>
                    <div className="font-bold text-base text-gray-900">
                      Шарипов Амир
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Старший специалист / Исполнитель №1
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center justify-center gap-3 flex-1 min-w-[300px] cursor-pointer hover:bg-[#F1F5F9] transition-colors py-4 px-6 group">
                  <div className="text-[#0037AF] group-hover:scale-110 transition-transform">
                    <FilePdfOutlined style={{ fontSize: "28px" }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#0037AF] font-medium text-sm">
                      Название.pdf
                    </span>
                    <span className="text-xs text-gray-400">
                      Нажмите для просмотра
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 min-w-55 justify-center">
                  <AntButton
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={executionModalState.open}
                    className="bg-[#0037AF]! hover:bg-[#002D93]! h-10! rounded-lg! font-medium! text-sm! shadow-sm! border-none! w-full!"
                  >
                    На исполнение
                  </AntButton>
                  <AntButton className="border-[#0037AF]! text-[#0037AF]! h-10! rounded-lg! font-medium! text-sm! hover:bg-blue-50! w-full!">
                    Подготовить ответ
                  </AntButton>
                </div>
              </div>
            </div>

            {/* ИСТОРИЯ */}
            <div className="pb-5">
              <h2 className="text-lg font-semibold mb-5 text-gray-800 border-b border-gray-100 pb-2">
                История документа
              </h2>
              <Table
                columns={HISTORY_COLUMNS}
                dataSource={HISTORY_DATA}
                pagination={false}
                rowClassName={() => "text-xs"}
                className="border! border-gray-100! rounded-lg! overflow-hidden! [&_.ant-table-thead_th]:bg-[#F9FAFB]! [&_.ant-table-thead_th]:text-[#6D8AC9]! [&_.ant-table-thead_th]:font-normal!"
              />
            </div>
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
