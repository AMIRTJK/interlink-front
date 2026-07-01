import { Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IAdminUser } from "@entities/hr";
import { Edit2, MoreHorizontal, Shield, Trash } from "lucide-react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { IAccessUser, ACCESS_STATUS_META, ROLE_COLOR_MAP } from "./model";

export const formatActivity = (id: number): string => {
	const mockActivities: Record<number, string> = {
		1: "2 мин. назад",
		2: "15 мин. назад",
		3: "1 час назад",
		4: "3 часа назад",
		5: "Вчера 17:42",
		6: "3 дня назад",
		7: "30 мин. назад",
		8: "2 часа назад",
	};
	return mockActivities[id] || `${(id % 5) + 1} час(а) назад`;
};

export const formatJoinedDate = (dateStr?: string): string => {
	if (!dateStr) return "12.01.2022";
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) return "12.01.2022";
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();
	return `${day}.${month}.${year}`;
};

export const normalizeAccessUsers = (raw: IAdminUser[]): IAccessUser[] => {
	return (Array.isArray(raw) ? raw : []).map((u) => ({
		id: u.id,
		fullName:
			u.full_name ||
			`${u.last_name || ""} ${u.first_name || ""}`.trim() ||
			"Без имени",
		email: u.email || "—",
		department: u.department?.name || u.departments?.[0]?.name || "—",
		roles: (u.roles || []).map((r) => r.name),
		status: u.status || "active",
		lastActive: formatActivity(u.id),
		joinedAt: formatJoinedDate(u.photo_path),
		raw: u,
	}));
};

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

export const getInitials = (name: string): string => {
	return name
		.split(" ")
		.map((n) => n[0])
		.filter(Boolean)
		.slice(0, 2)
		.join("")
		.toUpperCase();
};

