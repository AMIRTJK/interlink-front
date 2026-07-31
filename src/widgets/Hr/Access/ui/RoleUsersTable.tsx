import React, { useState } from "react";
import { Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { IAccessUser } from "../model";
import { buildRoleUsersColumns } from "./roleUsersTable/roleUsersTableColumns";
import { RoleUsersPagination } from "./roleUsersTable/RoleUsersPagination";

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

	const columns = buildRoleUsersColumns({ onViewAccess, onEdit, onDelete });

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

			{total > pageSize && (
				<RoleUsersPagination
					total={total}
					currentPage={currentPage}
					pageSize={pageSize}
					onPageChange={onPageChange}
				/>
			)}
		</div>
	);
};
