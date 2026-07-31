import React from "react";
import { Icons, Ui } from "../lib";

interface IncomingActionsSectionProps {
  isDarkMode?: boolean;
  isAcknowledged?: boolean;
  onAcknowledge?: () => void;
  onReply?: () => void;
  onForward?: () => void;
  handleAssignmentClick: () => void;
}

export const IncomingActionsSection: React.FC<IncomingActionsSectionProps> = ({
  isDarkMode,
  isAcknowledged,
  onAcknowledge,
  onReply,
  onForward,
  handleAssignmentClick,
}) => {
  return (
    <div className="flex flex-col gap-3 mt-5">
      <Ui.Button
        onClick={onAcknowledge}
        disabled={isAcknowledged}
        size="large"
        className={`w-full! h-14! px-4! py-3! rounded-xl! transition-all duration-200 flex items-center justify-start! gap-3! shadow-sm! ${
          isAcknowledged
            ? "bg-emerald-50! border-emerald-200! text-emerald-700!"
            : isDarkMode
            ? "bg-gray-800! border-gray-700! text-gray-200! hover:bg-gray-700! hover:border-[#8B5CF6]!"
            : "bg-white! border-[#A78BFA]! text-gray-700! hover:bg-gray-50! hover:border-[#8B5CF6]!"
        }`}
        icon={
          <Icons.CheckOutlined
            style={{
              fontSize: "18px",
              color: isAcknowledged ? "#10B981" : isDarkMode ? "#9CA3AF" : "#6B7280",
            }}
          />
        }
      >
        <span className="font-medium">
          {isAcknowledged ? "Ознакомлен" : "Ознакомиться"}
        </span>
      </Ui.Button>

      <Ui.Button
        onClick={onReply}
        size="large"
        className={`w-full! h-14! px-4! py-3! rounded-xl! transition-all duration-200 flex items-center justify-start! gap-3! shadow-sm! ${
          isDarkMode
            ? "bg-gray-800! border-gray-700! text-gray-200! hover:bg-gray-700! hover:border-[#8B5CF6]!"
            : "bg-white! border-[#A78BFA]! text-gray-700! hover:bg-gray-50! hover:border-[#8B5CF6]!"
        }`}
        icon={
          <Icons.MailOutlined
            style={{
              fontSize: "18px",
              color: isDarkMode ? "#9CA3AF" : "#6B7280",
            }}
          />
        }
      >
        <span className="font-medium">Ответить</span>
      </Ui.Button>

      <Ui.Button
        onClick={onForward}
        size="large"
        className={`w-full! h-14! px-4! py-3! rounded-xl! transition-all duration-200 flex items-center justify-start! gap-3! shadow-sm! ${
          isDarkMode
            ? "bg-gray-800! border-gray-700! text-gray-200! hover:bg-gray-700! hover:border-[#8B5CF6]!"
            : "bg-white! border-[#A78BFA]! text-gray-700! hover:bg-gray-50! hover:border-[#8B5CF6]!"
        }`}
        icon={
          <Icons.SendOutlined
            style={{
              fontSize: "18px",
              color: isDarkMode ? "#9CA3AF" : "#6B7280",
            }}
          />
        }
      >
        <span className="text-base font-medium">Переслать</span>
      </Ui.Button>

      <Ui.Button
        onClick={handleAssignmentClick}
        size="large"
        className={`w-full! h-14! px-4! py-3! rounded-xl! transition-all duration-200 flex items-center justify-start! gap-3! shadow-sm! ${
          isDarkMode
            ? "bg-gray-800! border-gray-700! text-gray-200! hover:bg-gray-700! hover:border-[#8B5CF6]!"
            : "bg-white! border-[#A78BFA]! text-gray-700! hover:bg-gray-50! hover:border-[#8B5CF6]!"
        }`}
        icon={
          <Icons.FileDoneOutlined
            style={{
              fontSize: "18px",
              color: isDarkMode ? "#9CA3AF" : "#6B7280",
            }}
          />
        }
      >
        <span className="text-base font-medium">Поручение</span>
      </Ui.Button>
    </div>
  );
};
