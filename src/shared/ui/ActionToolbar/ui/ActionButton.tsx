import React from "react";
import { Button } from "antd";

interface IProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const ActionButton: React.FC<IProps> = ({
  icon,
  label,
  onClick,
  loading,
  disabled,
}) => {
  return (
    <Button
      loading={loading}
      disabled={disabled}
      type="text"
      onClick={onClick}
      className={`group flex items-center gap-2 h-10 px-3 rounded-xl border-none bg-transparent hover:bg-gray-50/50 transition-all duration-300 ${disabled ? "opacity-30" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-gray-400 group-hover:text-[#F87171] transition-colors duration-300 flex items-center text-[18px]">
          {icon}
        </span>

        <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors duration-300">
          {label}
        </span>
      </div>
    </Button>
  );
};
