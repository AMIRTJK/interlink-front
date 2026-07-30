import React from "react";
import { Search } from "lucide-react";
import { Input } from "antd";
import { RoleUsersTable } from "../RoleUsersTable";
import type { IAccessUser } from "../../model";

interface IProps {
  selectedRoleDisplayName: string;
  totalUsers: number;
  onSearchChange: (val: string) => void;
  normalizedUsers: IAccessUser[];
  usersLoading: boolean;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onViewAccess: (user: IAccessUser) => void;
  onOpenEditUser: (user: IAccessUser) => void;
  onDeleteUser: (id: number) => void;
}

export function RolesTabUsersSection({
  selectedRoleDisplayName,
  totalUsers,
  onSearchChange,
  normalizedUsers,
  usersLoading,
  currentPage,
  perPage,
  onPageChange,
  onViewAccess,
  onOpenEditUser,
  onDeleteUser,
}: IProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-[15px] font-bold text-slate-800 flex items-center gap-2 flex-wrap">
            <span>{"Пользователи с ролью:"}</span>
            <span className="text-blue-600">{selectedRoleDisplayName}</span>
          </h3>
          <div className="text-xs text-slate-400 font-semibold pl-0.5">
            {"Найдено:"} {totalUsers}
          </div>
        </div>

        <Input
          placeholder={"Поиск пользователя..."}
          prefix={<Search size={14} className="text-slate-400" />}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-72! rounded-xl! border-slate-200!"
        />
      </div>

      <RoleUsersTable
        items={normalizedUsers}
        loading={usersLoading}
        total={totalUsers}
        currentPage={currentPage}
        pageSize={perPage}
        onPageChange={onPageChange}
        onViewAccess={onViewAccess}
        onEdit={onOpenEditUser}
        onDelete={onDeleteUser}
      />
    </div>
  );
}
