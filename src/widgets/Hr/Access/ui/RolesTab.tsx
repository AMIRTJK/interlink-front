import React from "react";
import { EmployeeFormModal } from "@features/Hr";
import { RoleCard } from "./RoleCard";
import { RoleListTable } from "./RoleListTable";
import { RolePermissionsSidebar } from "./RolePermissionsSidebar";
import { UserPermissionsSidebar } from "./UserPermissionsSidebar";
import { CreateRoleModal } from "./CreateRoleModal";
import { CreateUiPermissionModal } from "./CreateUiPermissionModal";
import { useRolesTabState } from "./rolesTab/useRolesTabState";
import { RolesTabHeader } from "./rolesTab/RolesTabHeader";
import { RolesTabPagination } from "./rolesTab/RolesTabPagination";
import { RolesTabUsersSection } from "./rolesTab/RolesTabUsersSection";

export const RolesTab = () => {
  const {
    selectedRole,
    setSelectedRole,
    setSearchQuery,
    isCreateOpen,
    setIsCreateOpen,
    isCreateUiPermOpen,
    setIsCreateUiPermOpen,
    currentPage,
    setCurrentPage,
    rolesPage,
    setRolesPage,
    viewMode,
    setViewMode,
    viewingUser,
    setViewingUser,
    editingUser,
    isFormOpen,
    setIsFormOpen,
    rolesList,
    roleUserCounts,
    paginatedRoles,
    usersLoading,
    normalizedUsers,
    allSystemPermissions,
    handleOpenEditUser,
    handleDeleteUser,
    handleDeleteRole,
    totalUsers,
    perPage,
  } = useRolesTabState();

  const selectedRoleDisplayName = selectedRole ? selectedRole.name : "";

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full!">
      <div className="flex-1 w-full! space-y-6">
        <RolesTabHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenCreateUiPerm={() => setIsCreateUiPermOpen(true)}
          onOpenCreateRole={() => setIsCreateOpen(true)}
        />

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {paginatedRoles.map((r) => (
              <RoleCard
                key={r.id}
                role={r}
                userCount={roleUserCounts[r.name] ?? 0}
                isSelected={selectedRole?.id === r.id}
                onSelect={() => {
                  setSelectedRole(r);
                  setViewingUser(null);
                }}
                onEdit={() => {
                  setSelectedRole(r);
                  setViewingUser(null);
                }}
                onDelete={() => handleDeleteRole(r)}
              />
            ))}
          </div>
        ) : (
          <div>
            <RoleListTable
              items={paginatedRoles}
              selectedRoleId={selectedRole?.id}
              onSelect={(r) => {
                setSelectedRole(r);
                setViewingUser(null);
              }}
              onEdit={(r) => {
                setSelectedRole(r);
                setViewingUser(null);
              }}
              onDelete={handleDeleteRole}
              userCounts={roleUserCounts}
            />
          </div>
        )}

        <RolesTabPagination
          totalRoles={rolesList.length}
          rolesPage={rolesPage}
          onRolesPageChange={setRolesPage}
        />

        {selectedRole && (
          <RolesTabUsersSection
            selectedRoleDisplayName={selectedRoleDisplayName}
            totalUsers={totalUsers}
            onSearchChange={setSearchQuery}
            normalizedUsers={normalizedUsers}
            usersLoading={!!usersLoading}
            currentPage={currentPage}
            perPage={perPage}
            onPageChange={setCurrentPage}
            onViewAccess={setViewingUser}
            onOpenEditUser={handleOpenEditUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </div>

      {viewingUser ? (
        <div className="shrink-0! sticky top-6 w-[320px] pb-4">
          <UserPermissionsSidebar
            user={viewingUser}
            allSystemPermissions={allSystemPermissions}
            onClose={() => setViewingUser(null)}
          />
        </div>
      ) : (
        selectedRole && (
          <div className="shrink-0! sticky top-6 w-[320px] pb-4">
            <RolePermissionsSidebar
              role={selectedRole}
              allSystemPermissions={allSystemPermissions}
              onClose={() => setSelectedRole(null)}
            />
          </div>
        )
      )}

      <CreateRoleModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <CreateUiPermissionModal
        open={isCreateUiPermOpen}
        onClose={() => setIsCreateUiPermOpen(false)}
      />

      <EmployeeFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employee={editingUser}
      />
    </div>
  );
};
