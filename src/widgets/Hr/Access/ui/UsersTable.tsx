import React, { useState } from "react";
import { Table } from "antd";
import type { TableRowSelection } from "antd/es/table/interface";
import { IAccessUser } from "../model";
import { getAccessTableColumns } from "../lib";

interface IProps {
  items: IAccessUser[];
  loading: boolean;
  onViewAccess: (user: IAccessUser) => void;
  onEdit: (user: IAccessUser) => void;
  onDelete: (id: number) => void;
}

export const UsersTable = ({
  items,
  loading,
  onViewAccess,
  onEdit,
  onDelete,
}: IProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns = getAccessTableColumns({
    onViewAccess,
    onEdit,
    onDelete,
  });

  const rowSelection: TableRowSelection<IAccessUser> = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
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
      className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
    />
  );
};
