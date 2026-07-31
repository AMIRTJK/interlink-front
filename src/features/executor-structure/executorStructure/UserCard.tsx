import React from "react";
import { Avatar } from "antd";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { IUser } from "./executorStructureModel";

interface UserCardProps {
  user: IUser;
  isSelected: boolean;
  isMain: boolean;
  onToggleSelection: (id: number) => void;
  onToggleMain: (e: React.MouseEvent, id: number) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isSelected,
  isMain,
  onToggleSelection,
  onToggleMain,
}) => {
  return (
    <div
      onClick={() => onToggleSelection(user.id)}
      className={`
        relative w-full flex flex-col items-center justify-start p-4 rounded-2xl cursor-pointer transition-all duration-300 border min-h-[180px]
        ${
          isSelected
            ? "bg-[#F4F8FF] border-blue-100/50 shadow-inner"
            : "bg-white border-transparent hover:border-blue-200 hover:shadow-[0_12px_40px_rgba(31,38,135,0.1)]!"
        }
      `}
    >
      <div className="mb-3 transition-transform duration-300">
        <Avatar
          src={user.avatar}
          size={80}
          className={`shadow-sm bg-gray-200 transition-all duration-300 ${isSelected ? "ring-4 ring-white" : ""}`}
        >
          {!user.avatar && user.name?.[0]}
        </Avatar>
      </div>

      <h3 className="text-[15px] font-bold text-gray-900 text-center leading-tight mb-1 px-1 line-clamp-2">
        {user.name}
      </h3>

      <p className="text-[13px] text-[#9AA4C2] text-center leading-tight px-1 mb-2 line-clamp-2">
        {user.role}
      </p>

      {/* Блок "Главный исполнитель" доступен только если юзер выбран */}
      {isSelected && (
        <div
          key="main-executor-badge"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMain(e, user.id);
          }}
          className="mt-auto pt-2 flex items-center gap-2 cursor-pointer group/star select-none animate-fade-in-up"
          style={{ animationDuration: "0.3s" }}
        >
          <div className="transform transition-transform duration-300 group-hover/star:scale-125 group-hover/star:rotate-12 active:scale-90 flex items-center justify-center">
            {isMain ? (
              <StarFilled
                style={{ fontSize: "18px", color: "#B4833E" }}
                className="drop-shadow-sm"
              />
            ) : (
              <StarOutlined
                style={{ fontSize: "18px", color: "#B4833E" }}
                className="opacity-70 group-hover/star:opacity-100 transition-opacity"
              />
            )}
          </div>

          <span className="text-[13px] text-[#1A1A1A] font-medium leading-none transition-colors duration-200 group-hover/star:text-[#B4833E]">
            Главный исполнитель
          </span>
        </div>
      )}
    </div>
  );
};
