import * as React from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { Table } from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import { Avatar } from "@shared/ui";
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
  const userColumns: ColumnsType<TableUser> = React.useMemo(
    () => [
      {
        title: "ФИО / Должность",
        key: "employee",
        onHeaderCell: () => ({ style: { paddingLeft: 20 } }),
        onCell: () => ({ style: { paddingLeft: 20 } }),
        render: (_, user) => {
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar
                colleague={{
                  id: user.id,
                  name: user.fio,
                  initials: user.avatarInitials,
                  photo: user.photoUrl,
                }}
                className="w-8 h-8 rounded-lg"
                allowPreview={true}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>
                  {user.fio}
                </div>
                <div style={{ fontSize: 11, color: T.textSecondary, marginTop: 1 }}>
                  {user.position}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        title: "Отдел",
        dataIndex: "department",
        key: "department",
        render: (val: string) => (
          <span style={{ fontSize: 13, color: T.textPrimary }}>{val}</span>
        ),
      },
      {
        title: "Роли",
        dataIndex: "roles",
        key: "roles",
        render: (roles: string[]) => (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
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
              <span
                style={{
                  background: T.hoverBg,
                  color: T.textSecondary,
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
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
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: statusCfg.dot,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: T.textPrimary, fontWeight: 500 }}>
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
          <span style={{ fontSize: 12, color: T.textSecondary }}>{val}</span>
        ),
      },
      {
        title: "Действия",
        key: "actions",
        width: 120,
        align: "right",
        render: () => (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: T.textSecondary,
                padding: 4,
                borderRadius: 6,
                display: "flex",
              }}
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
    <div
      style={{
        background: T.surface,
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        overflow: "hidden",
        boxShadow: T.shadow,
        minHeight: 700,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "14px 20px 12px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}
          >
            {isRoleFiltered ? (
              <span>
                <span>Пользователи с ролью: </span>
                <span style={{ color: T.accent }}>{selectedRoleName}</span>
              </span>
            ) : (
              <span>Все пользователи и их роли</span>
            )}
          </div>
          <div
            style={{ fontSize: 12, color: T.textSecondary, marginTop: 2 }}
          >
            {isRoleFiltered
              ? `Найдено: ${totalUsers}`
              : "Назначение ролей сотрудникам системы"}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "0 12px",
            height: 36,
            minWidth: 200,
          }}
        >
          <Search size={13} color={T.textSecondary} />
          <input
            type="text"
            className="admin__search-input"
            placeholder="Поиск пользователя..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 13,
              color: T.textPrimary,
              fontFamily: T.font,
              width: "100%",
            }}
          />
        </div>
      </div>
      <Table<TableUser>
        className="admin__users-table"
        rowKey="id"
        columns={userColumns}
        dataSource={displayedUsers}
        rowSelection={rowSelection}
        onRow={(user) => ({
          onClick: () => onRowClick(user.id),
          style: {
            cursor: "pointer",
            background:
              isRoleFiltered &&
              !!selectedRoleName &&
              user.roles.includes(selectedRoleName)
                ? "#EFF6FF"
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
            borderTop: `1px solid ${T.border}`,
            margin: 0,
            display: "flex",
            alignItems: "center",
            width: "100%",
          },
          showTotal: (total, range) => (
            <span style={{ fontSize: 13, color: T.textSecondary, marginRight: "auto" }}>
              Показано <strong style={{ color: T.textPrimary }}>{range[0]}-{range[1]}</strong> из{" "}
              <strong style={{ color: T.textPrimary }}>{total}</strong> пользователей
            </span>
          ),
        }}
        locale={{ emptyText: "Пользователи не найдены" }}
      />
    </div>
  );
}
