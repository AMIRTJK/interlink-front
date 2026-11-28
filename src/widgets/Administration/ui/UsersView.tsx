import * as React from "react";
import { ConfigProvider, Table, theme } from "antd";
import { useIsDarkMode } from "@shared/lib";
import { T } from "../theme/tokens";
import { ToastContainer } from "./components";
import { getUsersColumns } from "../lib/usersColumns";
import { UserProfileModal } from "./UserProfileModal";
import { AddUserModal } from "./AddUserModal";

import { useUsersViewState } from "./usersView/useUsersViewState";
import { UsersViewTopBar } from "./usersView/UsersViewTopBar";
import { UsersViewStatChips } from "./usersView/UsersViewStatChips";
import { UsersViewFilterBar } from "./usersView/UsersViewFilterBar";

export function UsersView() {
  const isDarkMode = useIsDarkMode();
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
    perPage,
    allRoleNames,
    roleCards,
    chipFilters,
    statChips,
  } = useUsersViewState();

  const columns = React.useMemo(
    () =>
      getUsersColumns(
        setProfileUser,
        activeActionsUserId,
        setActiveActionsUserId,
        addToast,
      ),
    [setProfileUser, activeActionsUserId, setActiveActionsUserId, addToast],
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div
        className="flex-1 min-h-0 px-6 pt-5 pb-6 flex flex-col gap-4"
        style={{ fontFamily: T.font }}
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
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-[10px] overflow-hidden shadow-xs">
          <Table
            className="admin__users-table"
            dataSource={users}
            columns={columns}
            rowKey="id"
            scroll={{ x: 1120 }}
            rowSelection={{
              selectedRowKeys: Array.from(checkedUsers),
              onChange: (newSelectedRowKeys) => {
                setCheckedUsers(new Set(newSelectedRowKeys as string[]));
              },
            }}
            pagination={{
              current: currentPage,
              pageSize: perPage,
              total: totalUsers,
              onChange: (page) => setCurrentPage(page),
              showSizeChanger: false,
              style: {
                padding: "10px 20px",
                borderTop: `1px solid ${isDarkMode ? "#1E293B" : T.border}`,
                background: isDarkMode ? "rgba(15, 23, 42, 0.6)" : T.bg,
                margin: 0,
                display: "flex",
                alignItems: "center",
                width: "100%",
              },
              showTotal: (total, range) => (
                <span className="text-[13px] text-slate-500 dark:text-slate-400 mr-auto">
                  <span>Показано </span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {range[1] - range[0] + 1}
                  </strong>
                  <span> из </span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {total}
                  </strong>
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
    </ConfigProvider>
  );
}
