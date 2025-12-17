import { months } from "../model";

export const getTaskProgressColor = (
  startedAt: string | null,
  plannedAt: string | null
): string => {
  if (!startedAt || !plannedAt) return "#E5E7EB";

  const start = new Date(startedAt).getTime();
  const end = new Date(plannedAt).getTime();
  const now = new Date().getTime();

  if (now <= start) return "#E5E7EB";

  if (now >= end) return "#E12B2B";

  const midPoint = start + (end - start) / 2;

  if (now >= midPoint) {
    return "#FFAC33";
  }

  return "#E5E7EB";
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month}, ${hours}:${minutes}`;
};
