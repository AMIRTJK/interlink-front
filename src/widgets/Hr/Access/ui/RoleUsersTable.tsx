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
		<div className="space-y-4">
			<Table<IAccessUser>
				rowSelection={rowSelection}
				columns={columns}
				dataSource={items}
				rowKey="id"
				loading={loading}
				pagination={false}
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
				className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white"
			/>

			{total > pageSize && (() => {
				const totalPages = Math.ceil(total / pageSize);
				const pageLimit = 5;
				const pagesList: number[] = [];
				let start = Math.max(1, currentPage - 2);
				let end = Math.min(totalPages, start + pageLimit - 1);
				if (end - start + 1 < pageLimit) {
					start = Math.max(1, end - pageLimit + 1);
				}
				for (let i = start; i <= end; i++) {
					pagesList.push(i);
				}

				return (
					<div className="flex items-center justify-between px-1 pt-1">
						<span className="text-xs text-slate-400 font-medium">
							Показано {(currentPage - 1) * pageSize + 1}–
							{Math.min(currentPage * pageSize, total)} из {total}{" "}
							пользователей
						</span>
						<div className="flex items-center gap-1.5">
							<button
								onClick={() => onPageChange(Math.max(1, currentPage - 1))}
								disabled={currentPage === 1}
								className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M15 18l-6-6 6-6" />
								</svg>
							</button>
							{pagesList.map((p) => (
								<button
									key={p}
									onClick={() => onPageChange(p)}
									className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
										currentPage === p
											? "bg-blue-600 text-white border border-blue-600 shadow-sm"
											: "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
									}`}
								>
									{p}
								</button>
							))}
							<button
								onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
								disabled={currentPage === totalPages}
								className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white"
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M9 18l6-6-6-6" />
								</svg>
							</button>
						</div>
					</div>
				);
			})()}
		</div>
	);
};
