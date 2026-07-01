import { Tag, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IAdminUser } from "@entities/hr";
import { Edit2, MoreHorizontal, Shield, Trash } from "lucide-react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Tooltip } from "@shared/ui";
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
		joinedAt: formatJoinedDate(u.created_at),
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

export const getRoleColorMeta = (roleName: string) => {
	const name = roleName.toLowerCase();
	if (name.includes("администратор") || name.includes("admin")) {
		return {
			dot: "bg-blue-500!",
			text: "text-blue-600!",
			badge: "bg-blue-50 text-blue-600! border border-blue-100",
			borderCell: "border-l-blue-500!",
		};
	}
	if (name.includes("делопроизводитель") || name.includes("recipient")) {
		return {
			dot: "bg-emerald-500!",
			text: "text-emerald-600!",
			badge: "bg-emerald-50 text-emerald-600! border border-emerald-100",
			borderCell: "border-l-emerald-500!",
		};
	}
	if (name.includes("руководитель") || name.includes("signer")) {
		return {
			dot: "bg-orange-500!",
			text: "text-orange-600!",
			badge: "bg-orange-50 text-orange-600! border border-orange-100",
			borderCell: "border-l-orange-500!",
		};
	}
	if (name.includes("исполнитель") || name.includes("approval")) {
		return {
			dot: "bg-indigo-500!",
			text: "text-indigo-600!",
			badge: "bg-indigo-50 text-indigo-600! border border-indigo-100",
			borderCell: "border-l-indigo-500!",
		};
	}
	if (name.includes("контрол") || name.includes("control")) {
		return {
			dot: "bg-purple-500!",
			text: "text-purple-600!",
			badge: "bg-purple-50 text-purple-600! border border-purple-100",
			borderCell: "border-l-purple-500!",
		};
	}
	return {
		dot: "bg-slate-400!",
		text: "text-slate-500!",
		badge: "bg-slate-50 text-slate-500! border border-slate-200",
		borderCell: "border-l-slate-400!",
	};
};

export const getRoleUserCount = (roleName: string): number => {
	const name = roleName.toLowerCase();
	if (name.includes("администратор") || name.includes("admin")) return 5;
	if (name.includes("делопроизводитель") || name.includes("recipient")) return 14;
	if (name.includes("руководитель") || name.includes("signer")) return 8;
	if (name.includes("исполнитель") || name.includes("approval")) return 19;
	if (name.includes("контрол") || name.includes("control")) return 6;
	return 12;
};

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
}

export const getRolesTableColumns = ({
	onEdit,
	onDelete,
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
						<span className={`font-bold text-[14px] leading-snug truncate ${meta.text}`}>
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
			const count = getRoleUserCount(record.name);
			const meta = getRoleColorMeta(record.name);
			return (
				<span className={`px-2 py-0.5 rounded-full text-xs font-bold ${meta.badge}`}>
					{count} чел.
				</span>
			);
		},
	},
	{
		title: "РАЗРЕШЕНИЙ",
		key: "permissions",
		render: (_, record) => {
			const perms = Array.isArray(record.permissions) ? record.permissions.length : 0;
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
			<div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
				<Tooltip title="Редактировать">
					<Button
						type="text"
						icon={<Edit2 size={14} className="text-slate-400 hover:text-blue-600 transition-colors" />}
						onClick={() => onEdit(record)}
						className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-50! p-0!"
					/>
				</Tooltip>
				<Tooltip title="Удалить">
					<Button
						type="text"
						icon={<Trash size={14} className="text-slate-400 hover:text-rose-600 transition-colors" />}
						onClick={() => onDelete(record)}
						className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-rose-50/50! p-0!"
					/>
				</Tooltip>
			</div>
		),
	},
];

