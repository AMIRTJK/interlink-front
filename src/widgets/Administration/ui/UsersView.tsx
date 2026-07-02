// Подмодуль «Пользователи» — порт UsersTable из IAMDashboard.tsx,
// подключённый к реальным API (GET_USERS/GET_ROLES/FETCH_PERMISSIONS).
import * as React from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import {
  T,
  getRoleColor,
  EXT_STATUS_CFG,
  thStyle,
  tdStyle,
  paginBtnStyle,
} from "../theme/tokens";
import { ToastContainer } from "./components";
import { CustomDropdown } from "./CustomDropdown";
import { useToasts } from "../lib/useToasts";
import { UserProfileModal } from "./UserProfileModal";
import { AddUserModal } from "./AddUserModal";
import type { ExtUser, RoleCard } from "../model";
import {
  adaptExtUser,
  adaptRoleCard,
  extractPermNames,
  unwrapList,
} from "../lib/adapters";

const PER_PAGE = 7;

export function UsersView() {
  const { toasts, addToast, removeToast } = useToasts();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [chipFilter, setChipFilter] = React.useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [checkedUsers, setCheckedUsers] = React.useState<Set<string>>(
    new Set(),
  );
  const [profileUser, setProfileUser] = React.useState<ExtUser | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [activeActionsUserId, setActiveActionsUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleGlobalClick = () => {
      setActiveActionsUserId(null);
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, chipFilter, departmentFilter, statusFilter]);

  const queryParams = React.useMemo(() => {
    const p: Record<string, string> = {
      page: String(currentPage),
      per_page: String(PER_PAGE),
    };
    if (searchQuery) p.search = searchQuery;
    if (chipFilter) p.role = chipFilter;
    if (departmentFilter) p.department = departmentFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [currentPage, searchQuery, chipFilter, departmentFilter, statusFilter]);

  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: queryParams,
    options: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const { data: rolesData } = useGetQuery({
    url: ApiRoutes.GET_ROLES,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const { data: deptsData } = useGetQuery({
    url: ApiRoutes.GET_DEPARTMENTS,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const departments = React.useMemo(
    () => unwrapList<{ id: number; name: string }>(deptsData),
    [deptsData],
  );

  const { data: allPermsData } = useGetQuery({
    url: ApiRoutes.FETCH_PERMISSIONS,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const rawUsers = React.useMemo(
    () => unwrapList<IAdminUser>(usersData),
    [usersData],
  );
  const totalUsers = React.useMemo(() => {
    const d = usersData as
      | { data?: { total?: number }; total?: number }
      | undefined;
    return d?.data?.total ?? d?.total ?? rawUsers.length;
  }, [usersData, rawUsers.length]);

  const users = React.useMemo(
    () => rawUsers.map(adaptExtUser),
    [rawUsers],
  );

  const rolesList = React.useMemo(
    () =>
      unwrapList<{ id: number; name: string; permissions?: unknown }>(
        rolesData,
      ),
    [rolesData],
  );
  const allRoleNames = React.useMemo(
    () => rolesList.map((r) => r.name),
    [rolesList],
  );

  const allPermNames = React.useMemo(() => {
    const set = new Set<string>();
    const rawSystem = (allPermsData as { data?: unknown })?.data ?? allPermsData;
    extractPermNames(rawSystem).forEach((n) => set.add(n));
    rolesList.forEach((r) =>
      extractPermNames(r.permissions).forEach((n) => set.add(n)),
    );
    return Array.from(set);
  }, [allPermsData, rolesList]);

  const roleCards: RoleCard[] = React.useMemo(
    () =>
      rolesList.map((r) => adaptRoleCard(r, { allPermNames, userCount: 0 })),
    [rolesList, allPermNames],
  );

  const chipFilters = React.useMemo(
    () => [
      { label: "Все", filter: null as string | null },
      ...allRoleNames.map((name) => ({ label: name, filter: name })),
    ],
    [allRoleNames],
  );

  const toggleCheck = (id: string) => {
    setCheckedUsers((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const statChips = React.useMemo(() => {
    const active = users.filter((u) => u.status === "Активен").length;
    const inactive = users.filter((u) => u.status === "Неактивен").length;
    const blocked = users.filter((u) => u.status === "Заблокирован").length;
    return [
      { label: "Всего", value: totalUsers, dot: null as string | null },
      { label: "Активные", value: active, dot: T.success },
      { label: "Неактивные", value: inactive, dot: "#94A3B8" },
      { label: "Заблокированные", value: blocked, dot: T.danger },
    ];
  }, [users, totalUsers]);

  const totalPages = Math.max(1, Math.ceil(totalUsers / PER_PAGE));
  const pagesList = React.useMemo(() => {
    const limit = 5;
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + limit - 1);
    if (end - start + 1 < limit) start = Math.max(1, end - limit + 1);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [currentPage, totalPages]);

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
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 700,
              color: T.textPrimary,
              letterSpacing: "-0.02em",
            }}
          >
            Пользователи
          </h1>
          <p
            style={{
              margin: "3px 0 0",
              fontSize: 13,
              color: T.textSecondary,
            }}
          >
            Управление сотрудниками и доступами
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 16px",
            height: 36,
            borderRadius: 8,
            border: "none",
            background: T.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: T.font,
            boxShadow: `0 2px 8px ${T.accent}35`,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#2563EB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = T.accent;
          }}
        >
          <Plus size={14} />
          <span>Добавить</span>
        </button>
      </div>

      {/* Stat chips */}
      <div style={{ display: "flex", gap: 8 }}>
        {statChips.map((chip) => (
          <div
            key={chip.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: "4px 10px",
              boxShadow: T.shadow,
            }}
          >
            {chip.dot && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: chip.dot,
                  display: "inline-block",
                }}
              />
            )}
            <span
              style={{ fontSize: 12, color: T.textSecondary, fontWeight: 500 }}
            >
              {chip.label}
            </span>
            <span
              style={{ fontSize: 12, fontWeight: 700, color: T.textPrimary }}
            >
              {chip.value}
            </span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: T.shadow,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: T.bg,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "0 12px",
            width: 240,
            height: 36,
          }}
        >
          <Search size={14} color={T.textSecondary} />
          <input
            type="text"
            className="admin__search-input"
            placeholder="Поиск сотрудника..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        <CustomDropdown
          value={chipFilter}
          onChange={setChipFilter}
          placeholder="Все роли"
          width={180}
          options={[
            { value: "", label: "Все роли" },
            ...allRoleNames.map((role) => ({ value: role, label: role })),
          ]}
        />

        <CustomDropdown
          value={departmentFilter}
          onChange={setDepartmentFilter}
          placeholder="Все отделы"
          width={200}
          options={[
            { value: "", label: "Все отделы" },
            ...departments.map((d) => ({ value: d.name, label: d.name })),
          ]}
        />

        <CustomDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Статус"
          width={160}
          options={[
            { value: "", label: "Статус" },
            { value: "active", label: "Активен" },
            { value: "inactive", label: "Неактивен" },
            { value: "blocked", label: "Заблокирован" },
            { value: "vacation", label: "В отпуске" },
            { value: "business_trip", label: "В командировке" },
          ]}
        />
      </div>

      {/* Role filter chips */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {chipFilters.map((chip) => {
          const isActive = chip.filter === chipFilter;
          const cfg = chip.filter ? getRoleColor(chip.filter) : null;
          return (
            <button
              key={chip.label}
              onClick={() => setChipFilter(chip.filter)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "0 12px",
                height: 28,
                borderRadius: 6,
                border: isActive
                  ? `1px solid ${cfg?.text ?? T.accent}`
                  : `1px solid ${T.border}`,
                background: isActive ? cfg?.bg ?? "#EFF6FF" : "transparent",
                color: isActive ? cfg?.text ?? T.accent : T.textSecondary,
                fontSize: 12,
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                fontFamily: T.font,
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {cfg && isActive && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: cfg.text,
                    display: "inline-block",
                  }}
                />
              )}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>

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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.bg }}>
              <th style={thStyle}>
                <input
                  type="checkbox"
                  style={{ accentColor: T.accent, cursor: "pointer" }}
                />
              </th>
              <th style={{ ...thStyle, textAlign: "left", paddingLeft: 0 }}>
                Сотрудник
              </th>
              <th style={{ ...thStyle, textAlign: "left" }}>Email</th>
              <th style={{ ...thStyle, textAlign: "left" }}>Отдел</th>
              <th style={{ ...thStyle, textAlign: "left" }}>Роли</th>
              <th style={{ ...thStyle, textAlign: "left" }}>Статус</th>
              <th style={{ ...thStyle, textAlign: "left" }}>Активность</th>
              <th style={{ ...thStyle, textAlign: "left" }}>В системе с</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => {
              const primaryRole = user.roles[0];
              const roleCfg = getRoleColor(primaryRole);
              const statusCfg =
                EXT_STATUS_CFG[user.status] ?? EXT_STATUS_CFG["Активен"];
              return (
                <tr
                  key={user.id}
                  onClick={() => setProfileUser(user)}
                  style={{
                    borderBottom: `1px solid ${T.bg}`,
                    cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      T.hoverBg;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent";
                  }}
                >
                  <td
                    style={tdStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCheck(user.id);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checkedUsers.has(user.id)}
                      onChange={() => toggleCheck(user.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ accentColor: T.accent, cursor: "pointer" }}
                    />
                  </td>
                  <td style={{ ...tdStyle, paddingLeft: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: roleCfg.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          fontWeight: 700,
                          color: roleCfg.text,
                          flexShrink: 0,
                        }}
                      >
                        {user.avatarInitials}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: T.textPrimary,
                          }}
                        >
                          {user.fio}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: T.textSecondary,
                            marginTop: 1,
                          }}
                        >
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: T.textSecondary }}>
                      {user.email}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: T.textPrimary }}>
                      {user.department}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                    >
                      {user.roles.slice(0, 2).map((role) => {
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
                      {user.roles.length > 2 && (
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
                          +{user.roles.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
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
                      <span
                        style={{
                          fontSize: 13,
                          color: T.textPrimary,
                          fontWeight: 500,
                        }}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: T.textSecondary }}>
                      {user.lastActivity}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 12, color: T.textSecondary }}>
                      {user.joinedDate}
                    </span>
                  </td>
                  <td
                    style={{ ...tdStyle, width: 36, position: "relative" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={
                        activeActionsUserId === user.id
                          ? "admin__more-btn admin__more-btn--active"
                          : "admin__more-btn"
                      }
                      onClick={() =>
                        setActiveActionsUserId(
                          activeActionsUserId === user.id ? null : user.id
                        )
                      }
                    >
                      <MoreHorizontal size={15} />
                    </button>

                    {activeActionsUserId === user.id && (
                      <div
                        style={{
                          position: "absolute",
                          ...(idx >= 5 ? { bottom: 40 } : { top: 40 }),
                          right: 12,
                          background: T.surface,
                          border: `1px solid ${T.border}`,
                          borderRadius: 8,
                          boxShadow: T.shadowMd,
                          zIndex: 950,
                          minWidth: 130,
                          padding: 4,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          animation: "fieldsSlideDown 120ms ease-out forwards",
                        }}
                      >
                        <button
                          onClick={() => {
                            setProfileUser(user);
                            setActiveActionsUserId(null);
                          }}
                          style={actionMenuItemStyle}
                          onMouseEnter={actionMenuHover}
                          onMouseLeave={actionMenuLeave}
                        >
                          Профиль
                        </button>
                        <button
                          onClick={() => {
                            addToast("Редактирование сотрудника временно недоступно");
                            setActiveActionsUserId(null);
                          }}
                          style={actionMenuItemStyle}
                          onMouseEnter={actionMenuHover}
                          onMouseLeave={actionMenuLeave}
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => {
                            addToast("Удаление сотрудника временно недоступно");
                            setActiveActionsUserId(null);
                          }}
                          style={{ ...actionMenuItemStyle, color: T.danger }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `${T.danger}0D`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          style={{
            padding: "10px 20px",
            borderTop: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: T.bg,
          }}
        >
          <span style={{ fontSize: 13, color: T.textSecondary }}>
            <span>Показано </span>
            <strong style={{ color: T.textPrimary }}>{users.length}</strong>
            <span> из </span>
            <strong style={{ color: T.textPrimary }}>{totalUsers}</strong>
            <span> сотрудников</span>
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button
              style={paginBtnStyle}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={13} />
            </button>
            {pagesList.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  ...paginBtnStyle,
                  background: page === currentPage ? T.accent : "transparent",
                  color: page === currentPage ? "#fff" : T.textSecondary,
                  fontWeight: page === currentPage ? 700 : 400,
                  border:
                    page === currentPage ? "none" : `1px solid ${T.border}`,
                }}
              >
                {page}
              </button>
            ))}
            <button
              style={paginBtnStyle}
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
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

const actionMenuItemStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  borderRadius: 6,
  padding: "6px 8px",
  fontSize: 12,
  fontWeight: 500,
  color: T.textPrimary,
  textAlign: "left",
  cursor: "pointer",
  fontFamily: T.font,
  transition: "background 0.12s",
};

const actionMenuHover = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = T.hoverBg;
};

const actionMenuLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.background = "transparent";
};
