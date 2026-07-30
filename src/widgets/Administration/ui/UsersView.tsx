import * as React from "react";
import { Table } from "antd";
import { T } from "../theme/tokens";
import { ToastContainer } from "./components";
import { getUsersColumns } from "../lib/usersColumns";
import { UserProfileModal } from "./UserProfileModal";
import { AddUserModal } from "./AddUserModal";

import { useUsersViewState } from "./usersView/useUsersViewState";
import { UsersViewTopBar } from "./usersView/UsersViewTopBar";
import { UsersViewStatChips } from "./usersView/UsersViewStatChips";
import { UsersViewFilterBar } from "./usersView/UsersViewFilterBar";
import { PER_PAGE } from "./usersView/usersViewModel";

export function UsersView() {
  const {
    toasts,
    addToast,
    removeToast,
    setSearchQuery,
    searchValue,
    setSearchValue,
    chipFilter,
    setChipFilter,
    departmentFilter,
    setDepartmentFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    checkedUsers,
    setCheckedUsers,
    profileUser,
    setProfileUser,
    isAddOpen,
    setIsAddOpen,
    activeActionsUserId,
    setActiveActionsUserId,
    departments,
    users,
    totalUsers,
    allRoleNames,
    roleCards,
    chipFilters,
    statChips,
  } = useUsersViewState();

  return (
    <div
      style={{
        flex: 1,
        padding: "0 24px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: T.font,
      }}
    >
      <UsersViewTopBar onOpenAdd={() => setIsAddOpen(true)} />

      <UsersViewStatChips statChips={statChips} />

      <UsersViewFilterBar
        searchValue={searchValue}
        onSearchValueChange={setSearchValue}
        onApplySearch={setSearchQuery}
        onClearSearch={() => {
          setSearchValue("");
          setSearchQuery("");
        }}
        chipFilter={chipFilter}
        onChipFilterChange={setChipFilter}
        departmentFilter={departmentFilter}
        onDepartmentFilterChange={setDepartmentFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        allRoleNames={allRoleNames}
        departments={departments}
        chipFilters={chipFilters}
      />

      {/* Table */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: T.shadow,
        }}
      >
        <Table
          dataSource={users}
          columns={getUsersColumns(
            setProfileUser,
            activeActionsUserId,
            setActiveActionsUserId,
            addToast,
          )}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: Array.from(checkedUsers),
            onChange: (newSelectedRowKeys) => {
              setCheckedUsers(new Set(newSelectedRowKeys as string[]));
            },
          }}
          pagination={{
            current: currentPage,
            pageSize: PER_PAGE,
            total: totalUsers,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            style: {
              padding: "10px 20px",
              borderTop: `1px solid ${T.border}`,
              background: T.bg,
              margin: 0,
              display: "flex",
              alignItems: "center",
              width: "100%",
            },
            showTotal: (total, range) => (
              <span
                style={{
                  fontSize: 13,
                  color: T.textSecondary,
                  marginRight: "auto",
                }}
              >
                <span>Показано </span>
                <strong style={{ color: T.textPrimary }}>
                  {range[1] - range[0] + 1}
                </strong>
                <span> из </span>
                <strong style={{ color: T.textPrimary }}>{total}</strong>
                <span> сотрудников</span>
              </span>
            ),
          }}
          onRow={(record) => ({
            onClick: () => {
              setProfileUser(record);
            },
            style: { cursor: "pointer" },
          })}
        />
      </div>

      {profileUser && (
        <UserProfileModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
          allRoleNames={allRoleNames}
          roleCards={roleCards}
          addToast={addToast}
        />
      )}
      {isAddOpen && (
        <AddUserModal
          onClose={() => setIsAddOpen(false)}
          allRoleNames={allRoleNames}
          existingUsers={users}
          addToast={addToast}
        />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
