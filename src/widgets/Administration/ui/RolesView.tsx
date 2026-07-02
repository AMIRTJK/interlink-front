// Подмодуль «Роли и доступы» — порт RolesTabContent + RoleDrawer из
// IAMDashboard.tsx, подключённый к GET_ROLES/GET_ROLE/FETCH_PERMISSIONS/GET_USERS.
import * as React from "react";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes, _axios } from "@shared/api";
import type { IAdminUser } from "@entities/hr";
import {
  T,
  getRoleColor,
  STATUS_CFG,
  thStyle,
  tdStyle,
  paginBtnStyle,
} from "../theme/tokens";
import { ToastContainer } from "./components";
import { useToasts } from "../lib/useToasts";
import { RoleDrawer } from "./RoleDrawer";
import { CreateRoleModal } from "./CreateRoleModal";
import { DeleteRoleModal } from "./DeleteRoleModal";
import type { RoleCard, PermModule } from "../model";
import {
  adaptRoleCard,
  adaptTableUser,
  extractPermNames,
  unwrapList,
} from "../lib/adapters";

const PER_PAGE = 10;

function countTotalPerms(perms: PermModule[]): number {
  let count = 0;
  perms.forEach((mod) =>
    mod.perms.forEach((perm) => {
      perm.subperms?.forEach((sp) => {
        if (sp.value) count++;
      });
      perm.children?.forEach((ch) =>
        ch.subperms?.forEach((csp) => {
          if (csp.value) count++;
        }),
      );
    }),
  );
  return count;
}

export function RolesView() {
  const { toasts, addToast, removeToast } = useToasts();
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = React.useState(true);
  const [isFirstOpen, setIsFirstOpen] = React.useState(false);
  const [pulsingCardId, setPulsingCardId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<"block" | "registry">("block");
  const [viewTransitioning, setViewTransitioning] = React.useState(false);
  const [checkedUsers, setCheckedUsers] = React.useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showCreateRole, setShowCreateRole] = React.useState(false);
  const [showDeleteRole, setShowDeleteRole] = React.useState(false);

  const { data: rolesData } = useGetQuery({
    url: ApiRoutes.GET_ROLES,
    useToken: true,
    options: { refetchOnWindowFocus: false, staleTime: 30 * 60 * 1000 },
  });

  const { data: allPermsData } = useGetQuery({
    url: ApiRoutes.FETCH_PERMISSIONS,
    useToken: true,
    options: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 30 * 60 * 1000,
    },
  });

  const rolesList = React.useMemo(
    () =>
      unwrapList<{
        id: number;
        name: string;
        description?: string;
        permissions?: unknown;
        created_at?: string;
      }>(rolesData),
    [rolesData],
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

  // Реальный счётчик «пользователей на роль» — total из GET_USERS?role=X&per_page=1
  const [roleUserCounts, setRoleUserCounts] = React.useState<
    Record<string, number>
  >({});
  React.useEffect(() => {
    if (rolesList.length === 0) return;
    let cancelled = false;
    Promise.all(
      rolesList.map((r) =>
        _axios
          .get(ApiRoutes.GET_USERS, { params: { role: r.name, per_page: 1 } })
          .then((res) => {
            const body = res.data;
            const total = body?.data?.total ?? body?.total ?? 0;
            return [r.name, total] as const;
          })
          .catch(() => [r.name, 0] as const),
      ),
    ).then((results) => {
      if (!cancelled) setRoleUserCounts(Object.fromEntries(results));
    });
    return () => {
      cancelled = true;
    };
  }, [rolesList]);

  const roleCards: RoleCard[] = React.useMemo(
    () =>
      rolesList.map((r) =>
        adaptRoleCard(r, {
          allPermNames,
          userCount: roleUserCounts[r.name] ?? 0,
        }),
      ),
    [rolesList, allPermNames, roleUserCounts],
  );

  // Выбор первой роли по умолчанию
  React.useEffect(() => {
    if (roleCards.length > 0 && selectedRoleId === null && drawerOpen) {
      setSelectedRoleId(roleCards[0].id);
    }
  }, [roleCards, selectedRoleId, drawerOpen]);

  const selectedCard =
    roleCards.find((c) => c.id === selectedRoleId) ?? null;
  const selectedRoleName = selectedCard?.name ?? null;
  const isRoleFiltered = drawerOpen && selectedRoleName !== null;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedRoleId, searchQuery]);

  // Пользователи (для таблицы) — фильтр по выбранной роли + поиск
  const usersParams = React.useMemo(() => {
    const p: Record<string, string> = {
      page: String(currentPage),
      per_page: String(PER_PAGE),
    };
    if (isRoleFiltered && selectedRoleName) p.role = selectedRoleName;
    if (searchQuery) p.search = searchQuery;
    return p;
  }, [currentPage, isRoleFiltered, selectedRoleName, searchQuery]);

  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
    params: usersParams,
    options: {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const rawUsers = React.useMemo(
    () => unwrapList<IAdminUser>(usersData),
    [usersData],
  );
  const displayedUsers = React.useMemo(
    () => rawUsers.map(adaptTableUser),
    [rawUsers],
  );
  const totalUsers = React.useMemo(() => {
    const d = usersData as
      | { data?: { total?: number }; total?: number }
      | undefined;
    return d?.data?.total ?? d?.total ?? displayedUsers.length;
  }, [usersData, displayedUsers.length]);

  const memberInitials = React.useMemo(
    () => displayedUsers.slice(0, 12).map((u) => u.avatarInitials),
    [displayedUsers],
  );

  const totalPages = Math.max(1, Math.ceil(totalUsers / PER_PAGE));
  const pagesList = React.useMemo(() => {
    const limit = 4;
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + limit - 1);
    if (end - start + 1 < limit) start = Math.max(1, end - limit + 1);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [currentPage, totalPages]);

  const switchView = (mode: "block" | "registry") => {
    if (mode === viewMode) return;
    setViewTransitioning(true);
    setTimeout(() => {
      setViewMode(mode);
      setViewTransitioning(false);
    }, 150);
  };

  const handleCardClick = (cardId: string) => {
    if (selectedRoleId === cardId && drawerOpen) {
      setDrawerOpen(false);
      setSelectedRoleId(null);
      setPulsingCardId(null);
    } else {
      const isOpening = !drawerOpen || selectedRoleId === null;
      setIsFirstOpen(isOpening);
      setSelectedRoleId(cardId);
      setDrawerOpen(true);
      setPulsingCardId(cardId);
      setTimeout(() => setPulsingCardId(null), 700);
    }
  };

  const handleRowClick = (roleNames: string[]) => {
    const card = roleCards.find((c) => roleNames.includes(c.name));
    if (!card) return;
    handleCardClick(card.id);
  };

  const toggleCheck = (id: string) => {
    setCheckedUsers((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const showRoleDrawer = drawerOpen && selectedCard;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 0,
        height: "calc(100vh - 212px)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: "0 24px 24px",
          height: "100%",
          overflowY: "auto",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 20,
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
              Роли и доступы
            </h1>
            <p
              style={{
                margin: "3px 0 0",
                fontSize: 13,
                color: T.textSecondary,
              }}
            >
              Управление ролями пользователей СЭД
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => switchView("block")}
                title="Блочный вид"
                aria-label="Блочный вид"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: viewMode === "block" ? "none" : `1px solid #E2E8F0`,
                  background: viewMode === "block" ? "#3B82F6" : "#FFFFFF",
                  color: viewMode === "block" ? "#FFFFFF" : "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => switchView("registry")}
                title="Реестровый вид"
                aria-label="Реестровый вид"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border:
                    viewMode === "registry" ? "none" : `1px solid #E2E8F0`,
                  background: viewMode === "registry" ? "#3B82F6" : "#FFFFFF",
                  color: viewMode === "registry" ? "#FFFFFF" : "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                  padding: 0,
                }}
              >
                <List size={15} />
              </button>
            </div>
            <button
              onClick={() => setShowCreateRole(true)}
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
                (e.currentTarget as HTMLButtonElement).style.background =
                  "#2563EB";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  T.accent;
              }}
            >
              <Plus size={14} />
              <span>Создать роль</span>
            </button>
          </div>
        </div>

        {/* Roles display */}
        <div
          style={{
            opacity: viewTransitioning ? 0 : 1,
            transition: "opacity 0.15s ease",
            marginBottom: 24,
          }}
        >
          {viewMode === "block" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
              }}
            >
              {roleCards.map((card) => {
                const isSelected = selectedRoleId === card.id && drawerOpen;
                const isPulsing = pulsingCardId === card.id;
                const borderColor = getRoleColor(card.name).text;
                const permCount = countTotalPerms(card.perms);
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    style={{
                      background: isSelected ? `${borderColor}0D` : T.surface,
                      borderRadius: 10,
                      padding: "14px 16px",
                      borderTop: isSelected
                        ? `1px solid ${borderColor}40`
                        : `1px solid ${T.border}`,
                      borderRight: isSelected
                        ? `1px solid ${borderColor}40`
                        : `1px solid ${T.border}`,
                      borderBottom: isSelected
                        ? `1px solid ${borderColor}40`
                        : `1px solid ${T.border}`,
                      borderLeft: `4px solid ${borderColor}`,
                      cursor: "pointer",
                      transition:
                        "border-color 0.15s, box-shadow 0.15s, background 0.15s",
                      boxShadow: isPulsing
                        ? `0 0 0 0 ${borderColor}33`
                        : isSelected
                          ? `0 4px 12px ${borderColor}15`
                          : T.shadow,
                      animation: isPulsing
                        ? "cardPulse 0.6s ease-out forwards"
                        : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadowMd;
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderTopColor = `${borderColor}40`;
                        el.style.borderRightColor = `${borderColor}40`;
                        el.style.borderBottomColor = `${borderColor}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadow;
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.borderTopColor = T.border;
                        el.style.borderRightColor = T.border;
                        el.style.borderBottomColor = T.border;
                      }
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: borderColor,
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: T.textPrimary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {card.name}
                        </span>
                      </div>
                      <span
                        style={{
                          background: T.hoverBg,
                          color: T.textSecondary,
                          borderRadius: 20,
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        {card.userCount}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: T.textSecondary,
                        marginBottom: 10,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {card.description}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 4,
                        marginBottom: 10,
                      }}
                    >
                      {permCount > 0 && (
                        <span
                          style={{
                            background: `${borderColor}10`,
                            color: borderColor,
                            borderRadius: 5,
                            padding: "1px 5px",
                            fontSize: 10,
                            fontWeight: 600,
                            border: `1px solid ${borderColor}25`,
                            height: 18,
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          {permCount} разр.
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        borderTop: `1px solid ${T.border}`,
                        paddingTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(card.id);
                        }}
                        style={{
                          fontSize: 11,
                          color: T.accent,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: T.font,
                          fontWeight: 500,
                          padding: 0,
                        }}
                      >
                        Ред.
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRoleId(card.id);
                          setShowDeleteRole(true);
                        }}
                        style={{
                          fontSize: 11,
                          color: T.danger,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: T.font,
                          fontWeight: 500,
                          padding: 0,
                        }}
                      >
                        Уд.
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === "registry" && (
            <div
              style={{
                background: T.surface,
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                overflow: "hidden",
                boxShadow: T.shadow,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: T.bg }}>
                    <th style={{ ...thStyle, width: 32, padding: "0 8px 0 16px" }} />
                    <th style={{ ...thStyle, textAlign: "left", paddingLeft: 8 }}>
                      Название роли
                    </th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Описание</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>
                      Пользователей
                    </th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Разрешений</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>
                      Дата создания
                    </th>
                    <th
                      style={{
                        ...thStyle,
                        textAlign: "center",
                        paddingRight: 16,
                      }}
                    >
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roleCards.map((card) => {
                    const isSelected =
                      selectedRoleId === card.id && drawerOpen;
                    const borderColor = getRoleColor(card.name).text;
                    const permCount = countTotalPerms(card.perms);
                    return (
                      <tr
                        key={card.id}
                        onClick={() => handleCardClick(card.id)}
                        style={{
                          height: 48,
                          borderBottom: `1px solid #F1F5F9`,
                          background: isSelected
                            ? `${borderColor}08`
                            : "transparent",
                          cursor: "pointer",
                          transition: "background 0.12s",
                          borderLeft: `4px solid ${borderColor}`,
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected)
                            (e.currentTarget as HTMLTableRowElement).style.background =
                              "#F8FAFC";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).style.background =
                            isSelected ? `${borderColor}08` : "transparent";
                        }}
                      >
                        <td
                          style={{
                            padding: "0 8px 0 12px",
                            verticalAlign: "middle",
                            width: 32,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: borderColor,
                              display: "inline-block",
                            }}
                          />
                        </td>
                        <td
                          style={{
                            padding: "0 12px 0 8px",
                            verticalAlign: "middle",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: borderColor,
                            }}
                          >
                            {card.name}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "0 12px",
                            verticalAlign: "middle",
                            maxWidth: 220,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              color: T.textSecondary,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              maxWidth: 200,
                            }}
                          >
                            {card.description}
                          </span>
                        </td>
                        <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                          <span
                            style={{
                              background: `${borderColor}12`,
                              color: borderColor,
                              borderRadius: 20,
                              padding: "2px 10px",
                              fontSize: 12,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {card.userCount} чел.
                          </span>
                        </td>
                        <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                          <span style={{ fontSize: 13, color: T.textSecondary }}>
                            {permCount} разрешений
                          </span>
                        </td>
                        <td style={{ padding: "0 12px", verticalAlign: "middle" }}>
                          <span style={{ fontSize: 12, color: T.textSecondary }}>
                            {card.createdAt}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "0 16px 0 12px",
                            verticalAlign: "middle",
                            textAlign: "center",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                            }}
                          >
                            <button
                              onClick={() => handleCardClick(card.id)}
                              title="Редактировать"
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                border: `1px solid ${T.border}`,
                                background: T.surface,
                                color: T.textSecondary,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                              }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              title="Удалить"
                              onClick={() => {
                                setSelectedRoleId(card.id);
                                setShowDeleteRole(true);
                              }}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                border: `1px solid ${T.border}`,
                                background: T.surface,
                                color: T.textSecondary,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Users table */}
        <div
          style={{
            background: T.surface,
            borderRadius: 10,
            border: `1px solid ${T.border}`,
            overflow: "hidden",
            boxShadow: T.shadow,
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
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>
                  <input
                    type="checkbox"
                    style={{ accentColor: T.accent, cursor: "pointer" }}
                  />
                </th>
                <th style={{ ...thStyle, textAlign: "left", paddingLeft: 0 }}>
                  ФИО / Должность
                </th>
                <th style={{ ...thStyle, textAlign: "left" }}>Отдел</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Роли</th>
                <th style={{ ...thStyle, textAlign: "left" }}>Статус</th>
                <th style={{ ...thStyle, textAlign: "left" }}>
                  Дата назначения
                </th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => {
                const primaryRole = user.roles[0];
                const roleCfg = getRoleColor(primaryRole);
                const statusCfg =
                  STATUS_CFG[user.status] ?? STATUS_CFG["Активен"];
                const isRowHighlighted =
                  isRoleFiltered &&
                  !!selectedRoleName &&
                  user.roles.includes(selectedRoleName);
                return (
                  <tr
                    key={user.id}
                    onClick={() => handleRowClick(user.roles)}
                    style={{
                      background: isRowHighlighted ? "#EFF6FF" : "transparent",
                      borderBottom: `1px solid ${T.bg}`,
                      transition: "background 0.12s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!isRowHighlighted)
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          T.hoverBg;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background =
                        isRowHighlighted ? "#EFF6FF" : "transparent";
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
                            borderRadius: 8,
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
                              fontSize: 13,
                              fontWeight: 600,
                              color: T.textPrimary,
                            }}
                          >
                            {user.fio}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: T.textSecondary,
                              marginTop: 1,
                            }}
                          >
                            {user.position}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 13, color: T.textPrimary }}>
                        {user.department}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                          justifyContent: "flex-start",
                        }}
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
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 12, color: T.textSecondary }}>
                        {user.assignedDate}
                      </span>
                    </td>
                    <td
                      style={{ ...tdStyle, width: 36 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
              <strong style={{ color: T.textPrimary }}>
                {displayedUsers.length}
              </strong>
              <span> из </span>
              <strong style={{ color: T.textPrimary }}>{totalUsers}</strong>
              <span> пользователей</span>
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
      </div>

      {showRoleDrawer && selectedCard && (
        <div
          style={{
            position: "sticky",
            top: 0,
            alignSelf: "flex-start",
            height: "100%",
            flexShrink: 0,
          }}
        >
          <RoleDrawer
            key={selectedCard.id}
            role={selectedCard}
            allPermNames={allPermNames}
            userCount={selectedCard.userCount}
            memberInitials={memberInitials}
            onClose={() => {
              setDrawerOpen(false);
              setSelectedRoleId(null);
            }}
            isFirstOpen={isFirstOpen}
            onSaved={() => {}}
            onDeleteRequest={() => setShowDeleteRole(true)}
            addToast={addToast}
          />
        </div>
      )}

      {showCreateRole && (
        <CreateRoleModal
          allPermNames={allPermNames}
          roleCards={roleCards}
          onClose={() => setShowCreateRole(false)}
          onCreated={() => {}}
          addToast={addToast}
        />
      )}
      {showDeleteRole && selectedCard && (
        <DeleteRoleModal
          roleId={selectedCard.id}
          roleName={selectedCard.name}
          userCount={selectedCard.userCount}
          onClose={() => setShowDeleteRole(false)}
          onDeleted={() => {
            setDrawerOpen(false);
            setSelectedRoleId(null);
          }}
          addToast={addToast}
        />
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
