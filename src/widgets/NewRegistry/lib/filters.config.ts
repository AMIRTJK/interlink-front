import { IFilterItem, FilterType } from "@shared/ui";

export const getIncomingFilters = (): IFilterItem[] => [
  {
    type: FilterType.INPUT,
    name: "incomingNumber",
    label: "Входящий номер",
    placeholder: "Введите номер",
  },
  {
    type: FilterType.INPUT,
    name: "outgoingNumber",
    label: "Исходящий номер",
    placeholder: "Введите номер",
  },
  {
    type: FilterType.DATE_RANGE,
    name: "date_range",
    label: "Период",
    placeholder: ["С даты", "По дату"],
    rangeNames: ["date_from", "date_to"],
  },
  {
    type: FilterType.SELECT,
    name: "sender_name",
    label: "Отправитель", // <--- Добавили
    placeholder: "Выберите отправителя",
    options: [
      { label: "Организация 1", value: "org1" },
      { label: "Организация 2", value: "org2" },
    ],
  },
];

export const getOutgoingFilters = (): IFilterItem[] => [
  {
    type: FilterType.INPUT,
    name: "outgoingNumber",
    label: "Исходящий номер",
    placeholder: "Введите номер",
  },
  {
    type: FilterType.INPUT,
    name: "incomingNumber",
    label: "Входящий номер (ответ)",
    placeholder: "Введите номер",
  },
  {
    type: FilterType.DATE,
    name: "date",
    label: "Дата создания",
    placeholder: "Выберите дату",
  },
  {
    type: FilterType.SELECT,
    name: "status",
    label: "Статус",
    placeholder: "Выберите статус",
    options: [
      { label: "Черновик", value: "draft" },
      { label: "На согласовании", value: "to_approve" },
      { label: "На подписании", value: "to_sign" },
      { label: "Отправлено", value: "sent" },
    ],
  },
];
