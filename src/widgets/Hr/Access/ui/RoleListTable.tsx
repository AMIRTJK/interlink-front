import React from "react";
import { Table } from "antd";
import { IRoleItem, getRolesTableColumns } from "../lib";

interface IProps {
	items: IRoleItem[];
	onSelect: (role: IRoleItem) => void;
	onEdit: (role: IRoleItem) => void;
	onDelete: (role: IRoleItem) => void;
	selectedRoleId?: number;
	userCounts: Record<string, number>;
}

export const RoleListTable = ({
	items,
	onSelect,
	onEdit,
	onDelete,
	selectedRoleId,
	userCounts,
}: IProps) => {
	const columns = getRolesTableColumns({
		onEdit,
		onDelete,
		userCounts,
	});

	return (
		<Table<IRoleItem>
			columns={columns}
			dataSource={items}
			rowKey="id"
			pagination={false}
			onRow={(record) => ({
				onClick: () => onSelect(record),
				className: "cursor-pointer transition-colors duration-150",
			})}
			rowClassName={(record) =>
				record.id === selectedRoleId
					? "bg-th-accent-50/20! border-l-2! border-l-th-accent-500! dark:bg-th-accent-900/35!"
					: "hover:bg-slate-50/40! dark:hover:bg-th-high/40!"
			}
			className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white dark:border-th-high dark:bg-th-raised"
		/>
	);
};
