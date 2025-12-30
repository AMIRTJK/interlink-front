import { CorrespondenseStatus } from "@entities/correspondence";

export const getCorrespondenseOutgoingStatusLabel = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    [CorrespondenseStatus.DRAFT]: { label: "Черновик", color: "#FFAC33" },
    [CorrespondenseStatus.REGISTERED]: {
      label: "Зарегистрировано",
      color: "#7B46C0",
    },
    [CorrespondenseStatus.IN_PROGRESS]: {
      label: "В процессе",
      color: "#2E52B2",
    },
    [CorrespondenseStatus.COMPLETED]: { label: "Завершено", color: "#229A2E" },
  };

  if (status === null || !(status in statusMap)) {
    return { label: "Неизвестный статус", color: "red" };
  }

  return statusMap[status];
};
