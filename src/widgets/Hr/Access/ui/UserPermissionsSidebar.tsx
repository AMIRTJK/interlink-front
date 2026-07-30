import React from "react";
import { Check, Search } from "lucide-react";
import { Input } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import type { IAccessUser } from "../model";
import { getInitials } from "../lib";
import { useUserPermissionsSidebarState } from "./userPermissionsSidebar/useUserPermissionsSidebarState";
import { UserPermissionsHeader } from "./userPermissionsSidebar/UserPermissionsHeader";
import { UserPermissionsGroupList } from "./userPermissionsSidebar/UserPermissionsGroupList";

interface IProps {
  user: IAccessUser | null;
  allSystemPermissions: string[];
  onClose: () => void;
}

export const UserPermissionsSidebar = ({
  user,
  allSystemPermissions,
  onClose,
}: IProps) => {
  const {
    directPermissionsState,
    deniedPermissionsState,
    roleGrantedPermissions,
    searchQuery,
    setSearchQuery,
    sidebarPage,
    setSidebarPage,
    isDataLoading,
    filteredGroups,
    paginatedGroups,
    totalSidebarPages,
    handleToggleDirect,
    handleToggleDenied,
    handleSave,
    isPending,
  } = useUserPermissionsSidebarState({
    user,
    allSystemPermissions,
  });

  if (!user) return null;

  const initials = getInitials(user.fullName);
  const rolesText = user.roles.join(", ") || "Без роли";

  return (
    <div className="w-[320px] bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[750px]! justify-between relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex flex-col h-full w-full justify-between"
        >
          <UserPermissionsHeader
            fullName={user.fullName}
            rolesText={rolesText}
            initials={initials}
            onClose={onClose}
          />

          <div className="px-5 pt-4">
            <Input
              placeholder="Поиск прав..."
              prefix={<Search size={14} className="text-slate-400" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
              className="rounded-xl! border-slate-200!"
            />
          </div>

          <UserPermissionsGroupList
            isDataLoading={isDataLoading}
            filteredGroups={filteredGroups}
            paginatedGroups={paginatedGroups}
            sidebarPage={sidebarPage}
            totalSidebarPages={totalSidebarPages}
            roleGrantedPermissions={roleGrantedPermissions}
            deniedPermissionsState={deniedPermissionsState}
            directPermissionsState={directPermissionsState}
            onToggleDenied={handleToggleDenied}
            onToggleDirect={handleToggleDirect}
            onPageChange={setSidebarPage}
          />

          <div className="p-4 border-t border-slate-50 bg-slate-50/20">
            <button
              onClick={handleSave}
              disabled={isDataLoading || isPending}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors shadow-sm"
            >
              <Check size={14} />
              <span>{"Сохранить"}</span>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
