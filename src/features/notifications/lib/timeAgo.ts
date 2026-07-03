const rtf = new Intl.RelativeTimeFormat("ru", { numeric: "auto" });

/** Человекочитаемое «сколько времени назад» на русском из ISO-даты (UTC). */
export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const diffSec = Math.round((then - Date.now()) / 1000); // < 0 для прошлого
  const abs = Math.abs(diffSec);

  if (abs < 45) return "только что";
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  const diffMonth = Math.round(diffDay / 30);
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, "month");
  return rtf.format(Math.round(diffMonth / 12), "year");
};
