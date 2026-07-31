import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";

export const MAX_VISIBLE_DOCS = 2;
export const MAX_VISIBLE_SIGNERS = 3;
export const MAX_VISIBLE_APPROVERS = 3;
export const MAX_VISIBLE_VERSIONS = 3;

export const getStatusMeta = (status: string, isDarkMode?: boolean) => {
  switch (status) {
    case "signed":
    case "approved":
      return {
        color: "text-green-500",
        bg: isDarkMode ? "bg-[#111827]" : "bg-white",
        bgList: isDarkMode ? "bg-[#00c9501a]" : "bg-[#00c95026]",
        icon: <CheckCircleFilled className="text-green-500!" />,
      };
    case "returned":
      return {
        color: "text-amber-500",
        bg: isDarkMode ? "bg-[#111827]" : "bg-white",
        bgList: isDarkMode ? "bg-[#f59e0b1a]" : "bg-[#f59e0b26]",
        icon: <ClockCircleFilled className="text-amber-500!" />,
      };
    case "declined":
    case "rejected":
      return {
        color: "text-red-500",
        bg: isDarkMode ? "bg-[#111827]" : "bg-white",
        bgList: isDarkMode ? "bg-[#ff4d4f1a]" : "bg-[#ff4d4f26]",
        icon: <CloseCircleFilled className="text-red-500!" />,
      };
    default:
      return {
        color: "text-gray-400",
        bg: isDarkMode ? "bg-[#111827]" : "bg-white",
        bgList: isDarkMode ? "bg-gray-800/50" : "bg-[#99a1af26]",
        icon: <ClockCircleFilled className="text-gray-400!" />,
      };
  }
};

export const getStatusTagConfig = (status: string) => {
  const map: Record<string, { color: string; text: string }> = {
    signed: { color: "success", text: "Подписано" },
    approved: { color: "success", text: "Согласовано" },
    returned: { color: "warning", text: "Возвращено" },
    declined: { color: "error", text: "Отклонил право подписи" },
    rejected: { color: "error", text: "Отклонено" },
    pending: { color: "default", text: "Ожидание" },
    created: { color: "blue", text: "Автор" },
  };
  return map[status] || map.pending;
};
