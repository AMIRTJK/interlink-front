import * as React from "react";
import { TableColumnsType } from "antd";
import { MoreHorizontal } from "lucide-react";
import { T, getRoleColor, EXT_STATUS_CFG } from "../theme/tokens";
import type { ExtUser } from "../model";

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

export const getUsersColumns = (
  setProfileUser: (u: ExtUser) => void,
  activeActionsUserId: string | null,
  setActiveActionsUserId: (id: string | null) => void,
  addToast: (msg: string) => void
): TableColumnsType<ExtUser> => [
  {
    title: "Сотрудник",
    key: "user",
    render: (_, user) => {
      const primaryRole = user.roles[0];
      const roleCfg = getRoleColor(primaryRole);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
              {user.fio}
            </div>
            <div style={{ fontSize: 12, color: T.textSecondary, marginTop: 1 }}>
              {user.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (text) => <span style={{ fontSize: 12, color: T.textSecondary }}>{text}</span>,
  },
  {
    title: "Отдел",
    dataIndex: "department",
    key: "department",
    render: (text) => <span style={{ fontSize: 13, color: T.textPrimary }}>{text}</span>,
  },
  {
    title: "Роли",
    key: "roles",
    render: (_, user) => (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
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
    ),
  },
  {
    title: "Статус",
    key: "status",
    render: (_, user) => {
      const statusCfg = EXT_STATUS_CFG[user.status] ?? EXT_STATUS_CFG["Активен"];
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
            {statusCfg.label}
          </span>
        </div>
      );
    },
  },
  {
    title: "Активность",
    dataIndex: "lastActivity",
    key: "lastActivity",
    render: (text) => <span style={{ fontSize: 12, color: T.textSecondary }}>{text}</span>,
  },
  {
    title: "В системе с",
    dataIndex: "joinedDate",
    key: "joinedDate",
    render: (text) => <span style={{ fontSize: 12, color: T.textSecondary }}>{text}</span>,
  },
  {
    key: "actions",
    width: 50,
    render: (_, user, idx) => (
      <div style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
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
      </div>
    ),
  },
];
