import { IFilterItem, FilterType } from "@shared/ui";

export const getIncomingFilters = (): IFilterItem[] => [
  {
    type: FilterType.INPUT,
    name: "reg_number",
    label: "Рег. номер",
    placeholder: "Введите номер",
  },
  {
    type: FilterType.INPUT,
    name: "subject",
    label: "Тема документа",
    placeholder: "Поиск по теме...",
  },
  {
    type: FilterType.SELECT,
    name: "letter_type",
    label: "Тип письма",
    placeholder: "Выберите тип письма",
    options: [
      { label: "Мактуб", value: "maktub" },
      { label: "Гузориш", value: "guzorish" },
      { label: "Ариза", value: "ariza" },
      { label: "Дархост", value: "darkhost" },
      { label: "Маълумотнома", value: "malumotnoma" },
    ],
  },
  {
    type: FilterType.SELECT,
    name: "link_type",
    label: "Тип отправки",
    placeholder: "Выберите тип отправки",
    options: [
      { label: "Ответное", value: "reply" },
      { label: "Пересланное", value: "forward" },
      { label: "Обычное", value: "normal" },
    ],
  },
  {
    type: FilterType.SELECT,
    name: "importance",
    label: "Важность",
    placeholder: "Выберите важность",
    options: [
      { label: "Высокая важность", value: "high" },
      { label: "Средняя важность", value: "normal" },
      { label: "Низкая важность", value: "low" },
    ],
  },
  {
    type: FilterType.SELECT,
    name: "status",
    label: "Статус документа",
    placeholder: "Выберите статус",
    options: [
      { label: "Черновик", value: "draft" },
      { label: "На согласовании", value: "to_approve" },
      { label: "На подписи", value: "to_sign" },
      { label: "Подписан", value: "signed" },
      { label: "Завершено", value: "done" },
    ],
  },
  {
    type: FilterType.INPUT,
    name: "sender_name",
    label: "Отправитель / Автор",
    placeholder: "ФИО или отдел",
  },
  {
    type: FilterType.DATE_RANGE,
    name: "date_range",
    label: "Период создания",
    placeholder: ["С даты", "По дату"],
    rangeNames: ["date_from", "date_to"],
  },
];

export const getOutgoingFilters = (): IFilterItem[] => [
  {
    type: FilterType.INPUT,
    name: "reg_number",
    label: "Рег. номер",
    placeholder: "Введите номер",
  },
  {
    type: FilterType.INPUT,
    name: "subject",
    label: "Тема документа",
    placeholder: "Поиск по теме...",
  },
  {
    type: FilterType.SELECT,
    name: "letter_type",
    label: "Тип письма",
    placeholder: "Выберите тип письма",
    options: [
      { label: "Мактуб", value: "maktub" },
      { label: "Гузориш", value: "guzorish" },
      { label: "Ариза", value: "ariza" },
      { label: "Дархост", value: "darkhost" },
      { label: "Маълумотнома", value: "malumotnoma" },
    ],
  },
  {
    type: FilterType.SELECT,
    name: "link_type",
    label: "Тип отправки",
    placeholder: "Выберите тип отправки",
    options: [
      { label: "Ответное", value: "reply" },
      { label: "Пересланное", value: "forward" },
      { label: "Обычное", value: "normal" },
    ],
  },
  {
    type: FilterType.SELECT,
    name: "importance",
    label: "Важность",
    placeholder: "Выберите важность",
    options: [
      { label: "Высокая важность", value: "high" },
      { label: "Средняя важность", value: "normal" },
      { label: "Низкая важность", value: "low" },
    ],
  },
  {
    type: FilterType.SELECT,
    name: "status",
    label: "Статус документа",
    placeholder: "Выберите статус",
    options: [
      { label: "Черновик", value: "draft" },
      { label: "На согласовании", value: "to_approve" },
      { label: "На подписи", value: "to_sign" },
      { label: "Подписан", value: "signed" },
      { label: "Завершено", value: "done" },
    ],
  },
  {
    type: FilterType.INPUT,
    name: "recipient_name",
    label: "Получатель",
    placeholder: "ФИО или отдел",
  },
  {
    type: FilterType.DATE_RANGE,
    name: "date_range",
    label: "Период создания",
    placeholder: ["С даты", "По дату"],
    rangeNames: ["date_from", "date_to"],
  },
];
