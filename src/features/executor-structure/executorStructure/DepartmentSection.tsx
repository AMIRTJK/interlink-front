import React from "react";
import { IDepartment } from "./executorStructureModel";
import { DepartmentCard } from "./DepartmentCard";

interface DepartmentSectionProps {
  title: string;
  departments: IDepartment[];
  selectedIds: number[];
  onToggleSelection: (id: number) => void;
}

export const DepartmentSection: React.FC<DepartmentSectionProps> = ({
  title,
  departments,
  selectedIds,
  onToggleSelection,
}) => {
  if (departments.length === 0) return null;

  return (
    <div className="relative border border-indigo-100 rounded-[32px] pt-8 pb-4 bg-white">
      <div className="max-h-[420px] overflow-y-auto no-scrollbar px-6 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center items-start">
          {departments.map((dept) => (
            <div key={dept.id} className="w-full max-w-[180px]">
              <DepartmentCard
                department={dept}
                isSelected={selectedIds.includes(dept.id)}
                onToggleSelection={onToggleSelection}
              />
            </div>
          ))}
        </div>
      </div>
      <span className="absolute -bottom-3 right-8 bg-[#f8fafc] px-3 text-xs md:text-sm text-indigo-300 font-medium rounded-md">
        {title}
      </span>
    </div>
  );
};
