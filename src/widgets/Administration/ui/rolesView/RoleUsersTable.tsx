import * as React from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { Table } from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import { Avatar } from "@shared/ui";
import { useIsDarkMode } from "@shared/lib";
import { T, getRoleColor, STATUS_CFG } from "../../theme/tokens";
import type { TableUser } from "../../model";
import { PER_PAGE } from "./rolesViewModel";

interface IProps {
  isRoleFiltered: boolean;
  selectedRoleName: string | null;
  totalUsers: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  displayedUsers: TableUser[];
  rowSelection: TableRowSelection<TableUser>;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRowClick: (userId: string) => void;
}

export function RoleUsersTable({
  isRoleFiltered,
  selectedRoleName,
  totalUsers,
  searchQuery,
  onSearchChange,
  displayedUsers,
  rowSelection,
  currentPage,
  onPageChange,
  onRowClick,
}: IProps) {
  const isDarkMode = useIsDarkMode();
  const userColumns: ColumnsType<TableUser> = React.useMemo(
    () => [
      {
        title: "ФИО / Должность",
        key: "employee",
        onHeaderCell: () => ({ style: { paddingLeft: 20 } }),
        onCell: () => ({ style: { paddingLeft: 20 } }),
        render: (_, user) => (
          <div className="flex items-center gap-2.5">
            <Avatar
              colleague={{
                id: user.id,
                name: user.fio,
                initials: user.avatarInitials,
                photo: user.photoUrl,
              }}
              className="w-8 h-8 rounded-lg shrink-0"
              allowPreview={true}
            />
            <div>
              <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                {user.fio}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {user.position}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Отдел",
        dataIndex: "department",
        key: "department",
        render: (val: string) => (
          <span className="text-[13px] text-slate-900 dark:text-slate-100">
            {val}
          </span>
        ),
      },
      {
        title: "Роли",
        dataIndex: "roles",
        key: "roles",
        render: (roles: string[]) => (
          <div className="flex flex-wrap gap-1">
            {roles.slice(0, 2).map((role) => {
              const cfg = getRoleColor(role);
              return (
                <span
                  key={role}
                  style={{
                    background: cfg.bg,
                    color: cfg.text,
                    borderRadius: 6,
                    padding: "2px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {role}
                </span>
              );
            })}
            {roles.length > 2 && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md px-2 py-0.5 text-[11px] font-semibold">
                +{roles.length - 2}
              </span>
            )}
          </div>
        ),
      },
      {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        render: (status: string) => {
          const statusCfg = STATUS_CFG[status] ?? STATUS_CFG["Активен"];
          return (
            <div className="flex items-center gap-1.5">
              <span
                className="w-[7px] h-[7px] rounded-full inline-block shrink-0"
                style={{ background: statusCfg.dot }}
              />
              <span className="text-[13px] text-slate-900 dark:text-slate-100 font-medium">
                {status}
              </span>
            </div>
          );
        },
      },
      {
        title: "Дата назначения",
        dataIndex: "assignedDate",
        key: "assignedDate",
        render: (val: string) => (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {val}
          </span>
        ),
      },
      {
        title: "Действия",
        key: "actions",
        width: 120,
        align: "right",
        render: () => (
          <div className="flex justify-end">
            <button
              onClick={(e) => e.stopPropagation()}
              className="bg-transparent border-0 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 p-1 rounded-md flex"
            >
              <MoreHorizontal size={15} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-[10px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col">
      <div className="px-5 pt-3.5 pb-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {isRoleFiltered ? (
              <span>
                <span>Пользователи с ролью: </span>
                <span className="text-blue-500">{selectedRoleName}</span>
              </span>
            ) : (
              <span>Все пользователи и их роли</span>
            )}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRoleFiltered
              ? `Найдено: ${totalUsers}`
              : "Назначение ролей сотрудникам системы"}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 h-9 min-w-[200px]">
          <Search size={13} className="text-slate-400 shrink-0" />
          <input
            type="text"
            className="admin__search-input border-0 outline-none bg-transparent text-[13px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 w-full"
            placeholder="Поиск пользователя..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ fontFamily: T.font }}
          />
        </div>
      </div>
      <Table<TableUser>
        className="admin__users-table"
        rowKey="id"
        columns={userColumns}
        dataSource={displayedUsers}
        rowSelection={rowSelection}
        scroll={{ x: 960 }}
        onRow={(user) => ({
          onClick: () => onRowClick(user.id),
          style: {
            cursor: "pointer",
            background:
              isRoleFiltered &&
              !!selectedRoleName &&
              user.roles.includes(selectedRoleName)
                ? isDarkMode
                  ? "rgba(59, 130, 246, 0.12)"
                  : "#EFF6FF"
                : undefined,
          },
        })}
        pagination={{
          current: currentPage,
          pageSize: PER_PAGE,
          total: totalUsers,
          onChange: (page) => onPageChange(page),
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
              Показано{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                {range[0]}-{range[1]}
              </strong>{" "}
              из{" "}
              <strong className="text-slate-900 dark:text-slate-100">
                {total}
              </strong>{" "}
              пользователей
            </span>
          ),
        }}
        locale={{ emptyText: "Пользователи не найдены" }}
      />
    </div>
  );
}
