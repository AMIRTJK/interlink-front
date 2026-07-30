import React from "react";
import { Tag, Button, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { Edit2, MoreHorizontal, Shield, Trash } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { IAccessUser, ACCESS_STATUS_META, ROLE_COLOR_MAP } from "../model";
import { formatJoinedDate, getRoleColorMeta } from "./accessFormatters";

interface IColumnActions {
  onViewAccess: (user: IAccessUser) => void;
  onEdit: (user: IAccessUser) => void;
  onDelete: (id: number) => void;
}

export const getAccessTableColumns = ({
  onViewAccess,
  onEdit,
  onDelete,
}: IColumnActions): ColumnsType<IAccessUser> => [
  {
    title: "СОТРУДНИК",
    key: "employee",
    render: (_, record) => {
      const initials = record.fullName
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-50 text-blue-600">
            {initials || "—"}
          </div>
          <div>
            <div className="font-semibold text-slate-800">
              {record.fullName}
            </div>
            <div className="text-xs text-slate-400 font-normal">
              {record.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    title: "EMAIL",
    dataIndex: "email",
    key: "email",
    render: (email) => (
      <span className="text-slate-400 font-normal">{email}</span>
    ),
  },
  {
    title: "ОТДЕЛ",
    dataIndex: "department",
    key: "department",
    render: (dept) => (
      <span className="text-slate-700 font-medium">{dept}</span>
    ),
  },
  {
    title: "РОЛИ",
    dataIndex: "roles",
    key: "roles",
    render: (roles: string[]) => (
      <div className="flex flex-wrap gap-1">
        {roles.map((role) => (
          <Tag key={role} color={ROLE_COLOR_MAP[role] || "default"}>
            {role}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: "СТАТУС",
    dataIndex: "status",
    key: "status",
    render: (status) => {
      const meta = ACCESS_STATUS_META[status] || ACCESS_STATUS_META.active;
      return (
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
          <span className={`text-sm font-medium ${meta.textClass}`}>
            {meta.label}
          </span>
        </div>
      );
    },
  },
  {
    title: "АКТИВНОСТЬ",
    dataIndex: "lastActive",
    key: "lastActive",
    render: (val) => <span className="text-slate-500 font-normal">{val}</span>,
  },
  {
    title: "В СИСТЕМЕ С",
    dataIndex: "joinedAt",
    key: "joinedAt",
    render: (val) => <span className="text-slate-500 font-normal">{val}</span>,
  },
  {
    title: "",
    key: "actions",
    render: (_, record) => {
      const items: MenuProps["items"] = [
        {
          key: "view",
          label: "Роли и права",
          icon: <Shield size={14} />,
          onClick: () => onViewAccess(record),
        },
        {
          key: "edit",
          label: "Редактировать",
          icon: <Edit2 size={14} />,
          onClick: () => onEdit(record),
        },
        {
          key: "delete",
          label: "Удалить",
          icon: <Trash size={14} />,
          danger: true,
          onClick: () => onDelete(record.id),
        },
      ];

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </Dropdown>
        </div>
      );
    },
  },
];

export interface IRoleItem {
  id: number;
  name: string;
  description?: string;
  permissions?: string[] | { name: string }[];
  created_at?: string;
}

interface IRoleColumnActions {
  onEdit: (role: IRoleItem) => void;
  onDelete: (role: IRoleItem) => void;
  userCounts: Record<string, number>;
}

export const getRolesTableColumns = ({
  onEdit,
  onDelete,
  userCounts,
}: IRoleColumnActions): ColumnsType<IRoleItem> => [
  {
    title: "НАЗВАНИЕ РОЛИ",
    key: "name",
    render: (_, record) => {
      const meta = getRoleColorMeta(record.name);
      return {
        children: (
          <div className="flex items-center gap-2 pl-2">
            <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
            <span
              className={`font-bold text-[14px] leading-snug truncate ${meta.text}`}
            >
              {record.name}
            </span>
          </div>
        ),
        props: {
          className: `border-l-[4px]! ${meta.borderCell}`,
        },
      };
    },
  },
  {
    title: "ОПИСАНИЕ",
    dataIndex: "description",
    key: "description",
    render: (val) => (
      <span className="text-slate-400 font-medium text-xs line-clamp-1">
        {val || "Без описания"}
      </span>
    ),
  },
  {
    title: "ПОЛЬЗОВАТЕЛЕЙ",
    key: "users",
    render: (_, record) => {
      const count = userCounts[record.name] ?? 0;
      const meta = getRoleColorMeta(record.name);
      return (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${meta.badge}`}
        >
          {count} чел.
        </span>
      );
    },
  },
  {
    title: "РАЗРЕШЕНИЙ",
    key: "permissions",
    render: (_, record) => {
      const perms = Array.isArray(record.permissions)
        ? record.permissions.length
        : 0;
      return (
        <span className="text-slate-500 font-semibold text-xs">
          {perms} разрешений
        </span>
      );
    },
  },
  {
    title: "ДАТА СОЗДАНИЯ",
    dataIndex: "created_at",
    key: "created_at",
    render: (val) => (
      <span className="text-slate-400 font-medium text-xs">
        {formatJoinedDate(val)}
      </span>
    ),
  },
  {
    title: "ДЕЙСТВИЯ",
    key: "actions",
    render: (_, record) => (
      <div
        className="flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <Tooltip title="Редактировать">
          <Button
            type="text"
            icon={
              <Edit2
                size={14}
                className="text-slate-400 hover:text-blue-600 transition-colors"
              />
            }
            onClick={() => onEdit(record)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-50! p-0!"
          />
        </Tooltip>
        <Tooltip title="Удалить">
          <Button
            type="text"
            icon={
              <Trash
                size={14}
                className="text-slate-400 hover:text-rose-600 transition-colors"
              />
            }
            onClick={() => onDelete(record)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-rose-50/50! p-0!"
          />
        </Tooltip>
      </div>
    ),
  },
];
