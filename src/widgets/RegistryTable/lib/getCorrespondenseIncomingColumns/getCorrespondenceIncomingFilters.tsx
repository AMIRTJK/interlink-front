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
      name: "date_range",
      placeholder: ["С даты", "По дату"],
      rangeNames: ["date_from", "date_to"],
    },
    {
      type: FilterType.SELECT,
      name: "sender_name",
      placeholder: "Отправитель",
      options: [
        // Временные данные для теста
        { label: "ООО Ромашка 4", value: "ООО Ромашка 4" },
        { label: "ООО Ромашка 3", value: "ООО Ромашка 3" },
        { label: "ООО Ромашка 2", value: "ООО Ромашка 2" },
        { label: "ООО Ромашка", value: "ООО Ромашка" },
      ],
    },
    {
      type: FilterType.SELECT,
      name: "status",
      placeholder: "Статус",
      options: [
        { label: "Черновик", value: "draft" },
        { label: "Регистрация", value: "to_register" },
        { label: "Визирование", value: "to_visa" },
        { label: "Исполнение", value: "to_execute" },
        { label: "Согласование", value: "to_approve" },
        { label: "Подпись", value: "to_sign" },
        { label: "Завершено", value: "done" },
        { label: "Отменено", value: "cancelled" },
      ],
    },
  ] as IFilterItem[];
};
