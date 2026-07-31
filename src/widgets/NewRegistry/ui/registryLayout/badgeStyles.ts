// Хелпер для цветов бейджей (Tailwind)
export const getBadgeStyles = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300";
    case "emerald":
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "purple":
      return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300";
    case "amber":
      return "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300";
    case "rose":
      return "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300";
    default:
      return "bg-gray-50 text-gray-600 dark:bg-slate-700/50 dark:text-slate-300";
  }
};

// Цвет бейджа «Статус письма» по статусу документа (в стиле остальных бейджей)
export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "sent":
    case "completed":
      return "emerald";
    case "signed":
      return "purple";
    case "in-progress":
    case "to_approve":
    case "to_sign":
      return "amber";
    case "canceled":
      return "rose";
    case "draft":
    case "analysis":
    case "approved":
      return "blue";
    default:
      return "gray";
  }
};
