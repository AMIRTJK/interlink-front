import React from "react";

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  isDarkMode: boolean;
}

export const NavButton: React.FC<NavButtonProps> = ({
  icon,
  label,
  active,
  onClick,
  isDarkMode,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
      active
        ? isDarkMode
          ? "bg-white/10 text-gray-100"
          : "bg-black/5 text-gray-900"
        : isDarkMode
          ? "text-gray-400 hover:bg-white/5"
          : "text-gray-600 hover:bg-black/5"
    }`}
  >
    <span className="text-[16px] flex items-center">{icon}</span>
    <span>{label}</span>
  </button>
);
