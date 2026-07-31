import { Tag, Dropdown } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import type { MenuProps } from "antd";
import { MoreHorizontal, Shield, Edit2, Trash } from "lucide-react";
import { IAccessUser, ACCESS_STATUS_META, ROLE_COLOR_MAP } from "../../model";

interface IColumnsDeps {
	onViewAccess: (user: IAccessUser) => void;
	onEdit: (user: IAccessUser) => void;
	onDelete: (id: number) => void;
}

export const buildRoleUsersColumns = ({
	onViewAccess,
	onEdit,
	onDelete,
}: IColumnsDeps): ColumnsType<IAccessUser> => [
	{
		title: "ФИО / ДОЛЖНОСТЬ",
		key: "employee",
		render: (_, record) => {
			const nameParts = record.fullName.split(" ");
			const initials = nameParts
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
							{record.raw.position || "—"}
						</div>
					</div>
				</div>
			);
		},
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
			const meta =
				ACCESS_STATUS_META[status] || ACCESS_STATUS_META.active;
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
		title: "ДАТА НАЗНАЧЕНИЯ",
		dataIndex: "joinedAt",
		key: "joinedAt",
		render: (val) => (
			<span className="text-slate-500 font-normal">{val}</span>
		),
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
