import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Check, ChevronDown } from "lucide-react";
import { If } from "@shared/ui";
import { ACCESS_STATUS_META, IAccessUser } from "../../model";
import type { TTab } from "./userProfileModalModel";

interface IProps {
  user: IAccessUser;
  currentStatus: string;
  tab: TTab;
  isDataLoading: boolean;
  onClose: () => void;
  onEdit: (user: IAccessUser) => void;
  onUpdateStatus: (status: string) => void;
  onDeleteConfirm: () => void;
  onSaveRoles: () => void;
  onSavePermissions: () => void;
  isRolesPending: boolean;
  isDirectPending: boolean;
  isDeniedPending: boolean;
}

export function UserProfileFooter({
  user,
  currentStatus,
  tab,
  isDataLoading,
  onClose,
  onEdit,
  onUpdateStatus,
  onDeleteConfirm,
  onSaveRoles,
  onSavePermissions,
  isRolesPending,
  isDirectPending,
  isDeniedPending,
}: IProps) {
  const renderStatusItem = (statusKey: string, labelText: string) => {
    const meta = ACCESS_STATUS_META[statusKey] || { dotClass: "bg-slate-400!" };
    const isActive = currentStatus === statusKey;
    return (
      <div className="flex items-center justify-between w-full min-w-[150px] py-0.5 select-none">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dotClass}`} />
          <span
            className={
              isActive ? "font-bold text-slate-800" : "text-slate-600 font-medium"
            }
          >
            {labelText}
          </span>
        </div>
        {isActive && <Check size={14} className="text-blue-500! ml-4" />}
      </div>
    );
  };

  const actionItems: MenuProps["items"] = [
    {
      key: "edit",
      label: (
        <span className="font-semibold text-slate-700">
          Редактировать сотрудника
        </span>
      ),
      onClick: () => {
        onClose();
        onEdit(user);
      },
    },
    { type: "divider" },
    {
      key: "status_active",
      label: renderStatusItem("active", "Активен"),
      onClick: () => onUpdateStatus("active"),
    },
    {
      key: "status_inactive",
      label: renderStatusItem("inactive", "Неактивен"),
      onClick: () => onUpdateStatus("inactive"),
    },
    {
      key: "status_vacation",
      label: renderStatusItem("vacation", "В отпуске"),
      onClick: () => onUpdateStatus("vacation"),
    },
    {
      key: "status_business_trip",
      label: renderStatusItem("business_trip", "В командировке"),
      onClick: () => onUpdateStatus("business_trip"),
    },
    { type: "divider" },
    {
      key: "delete",
      label: <span className="font-semibold">Удалить сотрудника</span>,
      danger: true,
      onClick: onDeleteConfirm,
    },
  ];

  return (
    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
      <Dropdown
        menu={{ items: actionItems }}
        trigger={["click"]}
        placement="topRight"
      >
        <button className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
          <span>Действие</span>
          <ChevronDown size={16} className="text-slate-400" />
        </button>
      </Dropdown>
      <If is={tab === "profile"}>
        <button
          onClick={onSaveRoles}
          disabled={isRolesPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
        >
          <Check size={16} />
          <span>Сохранить изменения</span>
        </button>
      </If>
      <If is={tab === "permissions"}>
        <button
          onClick={onSavePermissions}
          disabled={isDataLoading || isDirectPending || isDeniedPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60 transition-colors"
        >
          <Check size={16} />
          <span>Сохранить права</span>
        </button>
      </If>
    </div>
  );
}
