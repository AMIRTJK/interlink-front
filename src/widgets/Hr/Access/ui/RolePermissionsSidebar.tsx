import React from "react";
import { Check, Trash2, Search } from "lucide-react";
import { Input } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { useRolePermissionsSidebarState } from "./rolePermissionsSidebar/useRolePermissionsSidebarState";
import { RolePermissionsHeader } from "./rolePermissionsSidebar/RolePermissionsHeader";
import { RolePermissionsGroupList } from "./rolePermissionsSidebar/RolePermissionsGroupList";

interface IProps {
  role: {
    id: number;
    name: string;
    permissions?: string[] | { name: string }[];
  } | null;
  allSystemPermissions: string[];
  onClose: () => void;
}

export const RolePermissionsSidebar = ({
  role,
  allSystemPermissions,
  onClose,
}: IProps) => {
  const {
    rolePermissionsState,
    searchQuery,
    setSearchQuery,
    sidebarPage,
    setSidebarPage,
    filteredGroups,
    paginatedGroups,
    totalSidebarPages,
    handleTogglePermission,
    handleSave,
    handleDelete,
    colors,
    isUpdatePending,
    isDeletePending,
  } = useRolePermissionsSidebarState({
    role,
    allSystemPermissions,
    onClose,
  });

  if (!role) return null;

  const displayName = role.name;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-[320px] bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col h-[750px]! justify-between relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="flex flex-col h-full w-full justify-between"
        >
          <RolePermissionsHeader
            roleName={displayName}
            initials={initials}
            colors={colors}
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

          <RolePermissionsGroupList
            filteredGroups={filteredGroups}
            paginatedGroups={paginatedGroups}
            sidebarPage={sidebarPage}
            totalSidebarPages={totalSidebarPages}
            rolePermissionsState={rolePermissionsState}
            onTogglePermission={handleTogglePermission}
            onPageChange={setSidebarPage}
          />

          <div className="p-4 border-t border-slate-50 flex items-center justify-between gap-2.5 bg-slate-50/20">
            <button
              onClick={handleSave}
              disabled={isUpdatePending}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors shadow-sm"
            >
              <Check size={14} />
              <span>{"Сохранить"}</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeletePending}
              className="flex items-center justify-center p-2.5 rounded-xl text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100/60 disabled:opacity-60 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
