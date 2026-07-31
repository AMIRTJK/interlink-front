import React from "react";
import { IUser } from "./executorStructureModel";
import { UserCard } from "./UserCard";

interface UserSectionProps {
  title: string;
  users: IUser[];
  selectedIds: number[];
  mainExecutorIds: number[];
  onToggleSelection: (id: number) => void;
  onToggleMain: (e: React.MouseEvent, id: number) => void;
}

export const UserSection: React.FC<UserSectionProps> = ({
  title,
  users,
  selectedIds,
  mainExecutorIds,
  onToggleSelection,
  onToggleMain,
}) => {
  if (users.length === 0) return null;

  return (
    <div className="relative border border-blue-100 rounded-[32px] pt-8 pb-4 bg-white">
      <div className="max-h-[420px] overflow-y-auto no-scrollbar px-6 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center items-start">
          {users.map((user) => (
            <div key={user.id} className="w-full max-w-[180px]">
              <UserCard
                user={user}
                isSelected={selectedIds.includes(user.id)}
                isMain={mainExecutorIds.includes(user.id)}
                onToggleSelection={onToggleSelection}
                onToggleMain={onToggleMain}
              />
            </div>
          ))}
        </div>
      </div>
      <span className="absolute -bottom-3 right-8 bg-[#f8fafc] px-3 text-xs md:text-sm text-[#BCC5DF] font-medium rounded-md">
        {title}
      </span>
    </div>
  );
};
