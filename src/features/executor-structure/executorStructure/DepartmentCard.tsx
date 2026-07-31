import React from "react";
import { Avatar } from "antd";
import { ApartmentOutlined } from "@ant-design/icons";
import { IDepartment } from "./executorStructureModel";

interface DepartmentCardProps {
  department: IDepartment;
  isSelected: boolean;
  onToggleSelection: (id: number) => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  isSelected,
  onToggleSelection,
}) => {
  return (
    <div
      onClick={() => onToggleSelection(department.id)}
      className={`
        relative w-full flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer transition-all duration-300 border min-h-[140px]
        ${
          isSelected
            ? "bg-[#F4F8FF] border-blue-100/50 shadow-inner"
            : "bg-white border-transparent hover:border-blue-200 hover:shadow-[0_12px_40px_rgba(31,38,135,0.1)]!"
        }
      `}
    >
      <div className="mb-3 transition-transform duration-300">
        <Avatar
          size={60}
          className={`shadow-sm bg-indigo-50 text-indigo-500 flex items-center justify-center transition-all duration-300 ${isSelected ? "ring-4 ring-white" : ""}`}
          icon={<ApartmentOutlined style={{ fontSize: 28 }} />}
        />
      </div>

      <h3 className="text-[14px] font-bold text-gray-900 text-center leading-tight px-1 line-clamp-3">
        {department.name}
      </h3>
    </div>
  );
};
