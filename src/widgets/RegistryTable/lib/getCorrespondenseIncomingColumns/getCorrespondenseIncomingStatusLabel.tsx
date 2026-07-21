import { CorrespondenseStatus } from "@entities/correspondence";

export const getCorrespondenseIncomingStatusLabel = (status: string) => {
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
      label: "На подпись",
      color: "#2E52B2",
    },
    [CorrespondenseStatus.DONE]: { label: "Завершено", color: "#229A2E" },
    [CorrespondenseStatus.CANCELLED]: {
      label: "Отменено",
      color: "#2E52B2",
    },
    to_sign: { label: "На подпись", color: "#2E52B2" },
    to_approve: { label: "На согласовании", color: "#2E52B2" },
    to_visa: { label: "На визировании", color: "#2E52B2" },
    to_execute: { label: "На исполнении", color: "#2E52B2" },
    to_register: { label: "На регистрации", color: "#7B46C0" },
    approved: { label: "Согласовано", color: "#229A2E" },
    signed: { label: "Подписано", color: "#229A2E" },
    rejected: { label: "Отклонено", color: "#FF4D4F" },
  };

  if (!status || !(status in statusMap)) {
    return { label: status || "Неизвестный статус", color: "blue" };
  }

  return statusMap[status];
};
