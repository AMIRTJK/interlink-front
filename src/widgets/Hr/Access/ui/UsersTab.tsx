import React from "react";
import { AnimatePresence } from "framer-motion";
import { If } from "@shared/ui";
import { EmployeeFormModal } from "@features/Hr";
import { UsersTable } from "./UsersTable";
import { UserProfileModal } from "./UserProfileModal";
import { useUsersTabState } from "./usersTab/useUsersTabState";
import { UsersTabTopBar } from "./usersTab/UsersTabTopBar";
import { UsersTabStatChips } from "./usersTab/UsersTabStatChips";
import { UsersTabFilterBar } from "./usersTab/UsersTabFilterBar";
import { UsersTabRoleChips } from "./usersTab/UsersTabRoleChips";
import { UsersTabPagination } from "./usersTab/UsersTabPagination";

export const UsersTab = () => {
  const {
    filters,
    setFilters,
    selectedQuickRole,
    viewingUser,
    setViewingUser,
    editingUser,
    isFormOpen,
    setIsFormOpen,
    currentPage,
    perPage,
    usersLoading,
    filteredUsers,
    totalUsers,
    roles,
    rolesList,
    departments,
    counters,
    handlePageChange,
    handleFilterChange,
    handleQuickRoleChange,
    handleOpenCreate,
    handleOpenEdit,
    handleDeleteUser,
  } = useUsersTabState();

  return (
    <div className="space-y-6">
      <UsersTabTopBar onOpenCreate={handleOpenCreate} />

      <UsersTabStatChips
        filters={filters}
        counters={counters}
        onFilterStatus={(status) => setFilters((prev) => ({ ...prev, status }))}
      />

      <UsersTabFilterBar
        filters={filters}
        onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        onFilterChange={handleFilterChange}
        roles={roles}
        departments={departments}
      />

      <UsersTabRoleChips
        selectedQuickRole={selectedQuickRole}
        onQuickRoleChange={handleQuickRoleChange}
        roles={roles}
      />

      <UsersTable
        items={filteredUsers}
        loading={Boolean(usersLoading)}
        onViewAccess={setViewingUser}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteUser}
      />

      <UsersTabPagination
        totalUsers={totalUsers}
        currentPage={currentPage}
        perPage={perPage}
        onPageChange={handlePageChange}
      />

      <AnimatePresence>
        <If is={Boolean(viewingUser)}>
          {viewingUser && (
            <UserProfileModal
              user={viewingUser}
              onClose={() => setViewingUser(null)}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteUser}
              allRoles={rolesList}
            />
          )}
        </If>
      </AnimatePresence>

      <EmployeeFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        employee={editingUser}
      />
    </div>
  );
};
