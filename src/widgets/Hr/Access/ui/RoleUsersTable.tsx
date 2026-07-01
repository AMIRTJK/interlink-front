import React, { useState } from "react";
import { Table, Tag, Dropdown } from "antd";
import type { ColumnsType, TableRowSelection } from "antd/es/table/interface";
import type { MenuProps } from "antd";
import { MoreHorizontal, Shield, Edit2, Trash } from "lucide-react";
import { IAccessUser, ACCESS_STATUS_META, ROLE_COLOR_MAP } from "../model";

interface IProps {
	items: IAccessUser[];
	loading: boolean;
	total: number;
	currentPage: number;
	pageSize: number;
	onPageChange: (page: number) => void;
	onViewAccess: (user: IAccessUser) => void;
	onEdit: (user: IAccessUser) => void;
	onDelete: (id: number) => void;
}

export const RoleUsersTable = ({
	items,
	loading,
	total,
	currentPage,
	pageSize,
	onPageChange,
	onViewAccess,
	onEdit,
	onDelete,
}: IProps) => {
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

	const rowSelection: TableRowSelection<IAccessUser> = {
		selectedRowKeys,
		onChange: (keys) => setSelectedRowKeys(keys),
	};

	const columns: ColumnsType<IAccessUser> = [
		{
			title: "\u0424\u0418\u041e / \u0414\u041e\u041b\u0416\u041d\u041e\u0421\u0422\u042c",
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
			title: "\u041e\u0422\u0414\u0415\u041b",
			dataIndex: "department",
			key: "department",
			render: (dept) => (
				<span className="text-slate-700 font-medium">{dept}</span>
			),
		},
		{
			title: "\u0420\u041e\u041b\u0418",
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
			title: "\u0421\u0422\u0410\u0422\u0423\u0421",
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
			title: "\u0414\u0410\u0422\u0410 \u041d\u0410\u0417\u041d\u0410\u0427\u0415\u041d\u0418\u042f",
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
						label: "\u0420\u043e\u043b\u0438 \u0438 \u043f\u0440\u0430\u0432\u0430",
						icon: <Shield size={14} />,
						onClick: () => onViewAccess(record),
					},
					{
						key: "edit",
						label: "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
						icon: <Edit2 size={14} />,
						onClick: () => onEdit(record),
					},
					{
						key: "delete",
						label: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c",
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
							getPopupContainer={(triggerNode) =>
								triggerNode.parentElement || document.body
							}
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

	return (
		<Table<IAccessUser>
			rowSelection={rowSelection}
			columns={columns}
			dataSource={items}
			rowKey="id"
			loading={loading}
			pagination={{
				current: currentPage,
				pageSize: pageSize,
				total: total,
				onChange: onPageChange,
				showSizeChanger: false,
				className: "px-4 py-3",
				showTotal: (totalVal, range) => (
					<span className="text-xs text-slate-400 font-semibold">
						{"\u041f\u043e\u043a\u0430\u0437\u0430\u043d\u043e"} {range[0]}&ndash;{range[1]} {"\u0438\u0437"} {totalVal} {"\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435\u0439"}
					</span>
				),
			}}
			onRow={(record) => ({
				onClick: (event) => {
					const target = event.target as HTMLElement;
					if (
						target.closest(".ant-table-selection-column") ||
						target.closest(".ant-checkbox-wrapper")
					) {
						return;
					}
					onViewAccess(record);
				},
				className: "cursor-pointer",
			})}
			className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
		/>
	);
};
