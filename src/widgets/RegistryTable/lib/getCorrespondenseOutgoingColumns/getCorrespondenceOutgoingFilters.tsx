import { FilterType, IFilterItem } from "@shared/ui";

export const getCorrespondenceOutgoingFilters = (): IFilterItem[] => {
  return [
    {
      type: FilterType.INPUT,
      name: "outboundNumber",
      placeholder: "Исходящий номер",
    },
    {
      type: FilterType.INPUT,
      name: "inboundNumber",
      placeholder: "Входящий номер",
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
        { label: "Организация 1", value: 1 },
        { label: "Организация 2", value: 2 },
      ],
    },
    {
      type: FilterType.SELECT,
      name: "status",
      placeholder: "Статус",
      options: [
        { label: "В работе", value: "processing" },
        { label: "Завершено", value: "completed" },
      ],
    },
  ] as IFilterItem[];
};
