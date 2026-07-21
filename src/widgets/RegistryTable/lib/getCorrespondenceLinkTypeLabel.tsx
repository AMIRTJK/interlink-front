// Тип связи письма: ответное / пересланное / обычное. Бэкенд отдаёт link_type
// ("reply" | "forward" | null) и уже локализованный relation_label
// ("Ответное письмо" и т.п.). Предпочитаем relation_label, а на случай его
// отсутствия маппим link_type сами. Используется в реестрах входящих и
// исходящих для колонки «Тип письма».
export type CorrespondenceLinkType = "reply" | "forward" | null | undefined;

export const getCorrespondenceLinkTypeLabel = (
  linkType: CorrespondenceLinkType,
  relationLabel?: string | null,
): { label: string; color: string } | null => {
  if (linkType === "reply") {
    return { label: relationLabel || "Ответное", color: "#229A2E" };
  }
  if (linkType === "forward") {
    return { label: relationLabel || "Пересланное", color: "#7B46C0" };
  }
  return null;
};
