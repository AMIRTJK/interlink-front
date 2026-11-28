import * as React from "react";
import { TableColumnsType } from "antd";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@shared/ui";
import { T, getRoleColor, EXT_STATUS_CFG } from "../theme/tokens";
import type { ExtUser } from "../model";

export const getUsersColumns = (
  setProfileUser: (u: ExtUser) => void,
  activeActionsUserId: string | null,
  setActiveActionsUserId: (id: string | null) => void,
  addToast: (msg: string) => void
): TableColumnsType<ExtUser> => [
  {
    title: "Сотрудник",
    key: "user",
    width: 240,
    render: (_, user) => (
      <div className="flex items-center gap-2.5">
        <Avatar
          colleague={{
            id: user.id,
            name: user.fio,
            initials: user.avatarInitials,
            photo: user.photoUrl,
          }}
          className="w-8 h-8 rounded-full shrink-0"
          allowPreview={true}
        />
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {user.fio}
          </div>
          {user.position && user.position !== "—" && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {user.position}
            </div>
          )}
        </div>
      </div>
    ),
  },
  {
    title: "Email",
    key: "email",
    width: 210,
    render: (_, user) => {
      const primary = user.corporateEmail || user.email;
      const secondary =
        user.personalEmail && user.personalEmail !== primary
          ? user.personalEmail
          : "";
      if (!primary && !secondary) {
        return <span className="text-xs text-slate-400">—</span>;
      }
      return (
        <div className="min-w-0">
          {primary && (
            <div className="text-xs text-slate-700 dark:text-slate-200 truncate">
              {primary}
            </div>
          )}
          {secondary && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {secondary}
            </div>
          )}
        </div>
      );
    },
  },
  {
    title: "Отдел",
    dataIndex: "department",
    key: "department",
    width: 170,
    render: (text) => (
      <span className="text-[13px] text-slate-900 dark:text-slate-100">
        {text}
      </span>
    ),
  },
  {
    title: "Роли",
    key: "roles",
    width: 180,
    render: (_, user) => (
      <div className="flex flex-wrap gap-1">
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
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md px-2 py-0.5 text-[11px] font-semibold">
            +{user.roles.length - 2}
          </span>
        )}
      </div>
    ),
  },
  {
    title: "Статус",
    key: "status",
    width: 130,
    render: (_, user) => {
      const statusCfg = EXT_STATUS_CFG[user.status] ?? EXT_STATUS_CFG["Активен"];
      return (
        <div className="flex items-center gap-1.5">
          <span
            className="w-[7px] h-[7px] rounded-full inline-block shrink-0"
            style={{ background: statusCfg.dot }}
          />
          <span className="text-[13px] text-slate-900 dark:text-slate-100 font-medium">
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
    width: 130,
    render: (text) => (
      <span className="text-xs text-slate-500 dark:text-slate-400">{text}</span>
    ),
  },
  {
    title: "В системе с",
    dataIndex: "joinedDate",
    key: "joinedDate",
    width: 130,
    render: (text) => (
      <span className="text-xs text-slate-500 dark:text-slate-400">{text}</span>
    ),
  },
  {
    key: "actions",
    width: 60,
    fixed: "right",
    render: (_, user, idx) => (
      <div className="relative" onClick={(e) => e.stopPropagation()}>
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
            className="absolute right-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-[950] min-w-[130px] p-1 flex flex-col gap-0.5"
            style={{
              ...(idx >= 5 ? { bottom: 40 } : { top: 40 }),
              animation: "fieldsSlideDown 120ms ease-out forwards",
            }}
          >
            <button
              onClick={() => {
                setProfileUser(user);
                setActiveActionsUserId(null);
              }}
              className="bg-transparent border-0 rounded-md px-2 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-left cursor-pointer transition-colors"
              style={{ fontFamily: T.font }}
            >
              Профиль
            </button>
            <button
              onClick={() => {
                addToast("Редактирование сотрудника временно недоступно");
                setActiveActionsUserId(null);
              }}
              className="bg-transparent border-0 rounded-md px-2 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/70 text-left cursor-pointer transition-colors"
              style={{ fontFamily: T.font }}
            >
              Редактировать
            </button>
            <button
              onClick={() => {
                addToast("Удаление сотрудника временно недоступно");
                setActiveActionsUserId(null);
              }}
              className="bg-transparent border-0 rounded-md px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 text-left cursor-pointer transition-colors"
              style={{ fontFamily: T.font }}
            >
              Удалить
            </button>
          </div>
        )}
      </div>
    ),
  },
];
