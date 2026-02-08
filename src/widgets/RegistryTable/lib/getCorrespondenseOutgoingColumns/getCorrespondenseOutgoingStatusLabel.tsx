import { CorrespondenseStatus } from "@entities/correspondence";

export const getCorrespondenseOutgoingStatusLabel = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    [CorrespondenseStatus.DRAFT]: { label: "Черновик", color: "#FFAC33" },
    [CorrespondenseStatus.SENT]: { label: "Отправлено", color: "#FFAC33" },
    [CorrespondenseStatus.TO_REGISTER]: {
      label: "Регистрация",
      color: "#7B46C0",
    },
    [CorrespondenseStatus.TO_VISA]: {
      label: "Визирование",
      color: "#2E52B2",
    },
    [CorrespondenseStatus.TO_EXECUTE]: {
      label: "Исполнение",
      color: "#2E52B2",
    },
    [CorrespondenseStatus.TO_APPROVE]: {
      label: "Согласование",
      color: "#2E52B2",
    },
    [CorrespondenseStatus.TO_SIGN]: {
      label: "Подпись",
      color: "#2E52B2",
    },
    [CorrespondenseStatus.DONE]: { label: "Завершено", color: "#229A2E" },
    [CorrespondenseStatus.CANCELLED]: {
      label: "Отменено",
      color: "#2E52B2",
    },
  };

  if (status === null || !(status in statusMap)) {
    return { label: "Неизвестный статус", color: "red" };
  }

  return statusMap[status];
};
