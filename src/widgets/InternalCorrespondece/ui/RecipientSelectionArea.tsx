import React from "react";
import { Avatar, Tooltip } from "antd";
import { UserOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, If } from "@shared/ui";
import { Recipient, SelectionMode } from "./DocumentHeaderFormTypes";

interface RecipientSelectionAreaProps {
  list: Recipient[];
  mode: SelectionMode;
  emptyText: string;
  emptyIcon: React.ReactNode;
  hasError?: boolean;
  isDarkMode: boolean;
  isIncoming: boolean;
  isReadOnly: boolean;
  chipClass: string;
  textSecondary: string;
  onOpenSelector: (mode: SelectionMode) => void;
  onOpenViewer: (mode: SelectionMode) => void;
}

export const RecipientSelectionArea: React.FC<RecipientSelectionAreaProps> = ({
  list,
  mode,
  emptyText,
  emptyIcon,
  hasError = false,
  isDarkMode,
  isIncoming,
  isReadOnly,
  chipClass,
  textSecondary,
  onOpenSelector,
  onOpenViewer,
}) => {
  const errorColor = "#ff4d4f";
  const errorClass = "text-red-500!";
  const normalClass = isDarkMode
    ? "text-gray-400! hover:text-gray-300!"
    : "text-[#4a5565]! hover:text-gray-400!";

  if (list.length === 0) {
    return (
      <Button
        antdIcon={emptyIcon}
        type="text"
        text={hasError ? `${emptyText} (обязательно)` : emptyText}
        onClick={() => onOpenSelector(mode)}
        className={`text-sm! px-0! hover:bg-transparent! transition-colors! ${
          hasError ? errorClass : normalClass
        }`}
        style={hasError ? { color: errorColor } : undefined}
      />
    );
  }

  const MAX_VISIBLE = 2;
  const visibleUsers = list.slice(0, MAX_VISIBLE);
  const hiddenCount = list.length - MAX_VISIBLE;
  const hiddenNames = list
    .slice(MAX_VISIBLE)
    .map((u) => u.full_name)
    .join(", ");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {visibleUsers.map((user) => (
        <div
          key={user.id}
          onClick={() => onOpenViewer(mode)}
          className={`
            flex items-center gap-2 pl-1 pr-3 py-1 rounded-full! border! cursor-pointer transition-all shadow-sm select-none
            ${chipClass}
          `}
        >
          <Avatar
            src={user.photo_path || null}
            size={24}
            icon={<UserOutlined />}
          />
          <span className="text-xs font-medium whitespace-nowrap">
            {user.full_name}
          </span>
        </div>
      ))}

      {hiddenCount > 0 && (
        <Tooltip title={`Показать скрытых: ${hiddenNames}`}>
          <div
            onClick={() => onOpenViewer(mode)}
            className={`
              flex items-center justify-center h-[34px] min-w-[34px] px-2 rounded-full border cursor-pointer transition-all shadow-sm
              ${chipClass}
            `}
          >
            <span className="text-xs font-semibold">+{hiddenCount}</span>
          </div>
        </Tooltip>
      )}

      <If is={!isIncoming && !isReadOnly}>
        <Button
          antdIcon={<PlusOutlined style={{ fontSize: "12px" }} />}
          type="text"
          onClick={() => onOpenSelector(mode)}
          className={`
          min-w-[32px]! h-[32px]! w-[32px]! rounded-full! flex items-center justify-center p-0!
          ${textSecondary} ${isDarkMode ? "hover:bg-gray-800!" : "hover:bg-gray-100!"}
        `}
        />
      </If>
    </div>
  );
};
