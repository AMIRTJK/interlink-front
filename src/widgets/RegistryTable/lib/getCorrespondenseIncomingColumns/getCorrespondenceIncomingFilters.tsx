import { FilterType, IFilterItem } from "@shared/ui";

export const getCorrespondenceIncomingFilters = (): IFilterItem[] => {
  return [
    {
      type: FilterType.INPUT,
      name: "incomingNumber",
      placeholder: "Входящий номер",
    },
    {
      type: FilterType.INPUT,
      name: "outgoingNumber",
      placeholder: "Исходящий номер",
    },
    {
      type: FilterType.DATE,
      name: "date",
      placeholder: "Дата",
    },
    {
      type: FilterType.SELECT,
      name: "sender",
      placeholder: "Отправитель",
      options: [
        { label: "Коммерческая организация", value: 1 },
        { label: "Бюджетная организация", value: 2 },
      ],
    },
    {
      type: FilterType.SELECT,
      name: "status",
      placeholder: "Статус",
      options: [
        { label: "Черновик", value: "draft" },
        { label: "Зарегистрировано", value: "registered" },
        { label: "В процессе", value: "in_progress" },
        { label: "Завершено", value: "completed" },
      ],
    },
  ] as IFilterItem[];
};
