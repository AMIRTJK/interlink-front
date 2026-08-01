import { CorrespondenceResponse } from "@entities/correspondence";

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

export interface CorrespondenceFormProps {
  variant: CorrespondenceFormVariant;
  type: string;
  initialValues?: CorrespondenceResponse;
  onFinish: (values: CorrespondenceFormData) => void;
  onBack?: () => void;
  isLoading?: boolean;
  title: string;
  isReadOnly?: boolean;
  isAllowed?: boolean;
  initialExecutionOpen?: boolean;
}

// 6 шагов (индексы 0-5)
export const STEPS_ITEMS = [
  { title: "Черновик" }, // 0
  { title: "Регистрация" }, // 1
  { title: "На резолюции" }, // 2
  { title: "На исполнении" }, // 3
  { title: "Подготовка ответа" }, // 4
  { title: "Завершено" }, // 5
];

export const HISTORY_COLUMNS = [
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

export const HISTORY_DATA = [
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
