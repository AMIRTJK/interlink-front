import React from "react";
import {
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { ISearchItem } from "../model";

interface IProps {
  item: ISearchItem;
  isSelected: boolean;
  isActive: boolean;
  onClick: (item: ISearchItem) => void;
  isDarkMode?: boolean;
}

export const SearchListItem: React.FC<IProps> = ({
  item,
  isSelected,
  isActive,
  onClick,
  isDarkMode,
}) => {
  return (
    <div
      onClick={() => onClick(item)}
      className={`
        p-5 rounded-[24px] cursor-pointer transition-all border relative
        ${
          isSelected
            ? isDarkMode
              ? "border-[#8C52FF] bg-[rgba(140,82,255,0.2)]"
              : "border-[#8C52FF] bg-[rgba(167,139,250,0.12)]"
            : isActive
              ? isDarkMode
                ? "border-gray-600 bg-gray-800"
                : "border-gray-200 bg-gray-50"
              : isDarkMode
                ? "border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-500"
                : "border-gray-50 bg-white hover:bg-gray-50 hover:border-purple-200"
        }
        ${!isSelected && !isActive && (isDarkMode ? "shadow-none" : "shadow-sm")}
      `}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col min-w-0 flex-1 pr-4">
          <div className="mb-2">
            <span
              className={`text-[15px] leading-tight font-bold ${
                isSelected
                  ? isDarkMode
                    ? "text-white"
                    : "text-gray-900"
                  : isDarkMode
                    ? "text-gray-200"
                    : "text-gray-800"
              }`}
            >
              {item.title}
            </span>
          </div>

          <div
            className={`flex items-center gap-3 text-[12px] font-medium ${isDarkMode ? "text-gray-400" : "text-gray-400"}`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <UserOutlined className="text-[10px]!" />
              {item.subtitle}
            </span>
            {item.date && (
              <span className="flex items-center gap-1.5 shrink-0">
                <ClockCircleOutlined className="text-[10px]!" />
                {item.date}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 shrink-0">
          {item.tag && (
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                item.tag === "Входящее"
                  ? isDarkMode
                    ? "bg-purple-900/50 text-purple-300"
                    : "bg-purple-100 text-purple-600"
                  : item.tag === "Отправленные"
                    ? isDarkMode
                      ? "bg-blue-900/50 text-blue-300"
                      : "bg-blue-100 text-blue-600"
                    : isDarkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
              }`}
            >
              {item.tag}
            </span>
          )}

          <div className="mt-auto">
            {isSelected ? (
              <CheckCircleOutlined
                style={{ color: "#8C52FF" }}
                className="text-xl!"
              />
            ) : (
              <div
                className={`w-5 h-5 rounded-full border-2 ${isDarkMode ? "border-gray-600" : "border-gray-200"}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
