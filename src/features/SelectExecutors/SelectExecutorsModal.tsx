import React from "react";
import { Modal, Button } from "antd";
import { UserOutlined, ApartmentOutlined } from "@ant-design/icons";
import { ISelectExecutorsModalProps } from "./model";
import { UsersList, DepartmentsList } from "./lib";
import { Tabs } from "@shared/ui";
import { useSelectExecutorsState } from "./selectExecutors/useSelectExecutorsState";
import { ExecutorsSearchBar } from "./selectExecutors/ExecutorsSearchBar";
import "./SelectExecutorsModal.css";

const TAB_ITEMS = [
  {
    key: "users",
    label: (
      <span>
        <UserOutlined /> Сотрудники
      </span>
    ),
  },
  {
    key: "departments",
    label: (
      <span>
        <ApartmentOutlined /> Отделы
      </span>
    ),
  },
];

export const SelectExecutorsModal: React.FC<ISelectExecutorsModalProps> = ({
  open,
  onCancel,
  onOk,
  initialSelectedDepartments = [],
  initialSelectedUsers = [],
  initialMainUserId,
  initialMainDeptId,
}) => {
  const {
    form,
    activeTab,
    setActiveTab,
    departments,
    users,
    deptsMeta,
    usersMeta,
    loadingDepartments,
    loadingUsers,
    selectedDepartments,
    selectedUsers,
    mainUserId,
    mainDeptId,
    setUsersPage,
    setDepartmentsPage,
    handleSetMainUser,
    handleSetMainDept,
    handleSearch,
    handleClose,
    handleDepartmentToggle,
    handleUserToggle,
    handleOk,
  } = useSelectExecutorsState({
    open,
    onCancel,
    onOk,
    initialSelectedDepartments,
    initialSelectedUsers,
    initialMainUserId,
    initialMainDeptId,
  });

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={[
        <Button
          key="back"
          onClick={handleClose}
          type="text"
          style={{ color: "#999" }}
        >
          Отмена
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Добавить ({selectedDepartments.length + selectedUsers.length})
        </Button>,
      ]}
      title="Выберите исполнителей"
      className="select-executors-modal"
      width={1000}
      centered
    >
      <ExecutorsSearchBar
        form={form}
        activeTab={activeTab}
        open={open}
        onSearch={handleSearch}
      />

      <Tabs
        items={TAB_ITEMS}
        activeKey={activeTab}
        onChange={setActiveTab}
        className="mb-4"
      />

      <div className="mt-4">
        {activeTab === "users" ? (
          <UsersList
            loading={loadingUsers || false}
            users={users}
            selectedUsers={selectedUsers}
            mainUserId={mainUserId}
            onToggle={handleUserToggle}
            onSetMain={handleSetMainUser}
            pagination={usersMeta}
            onPageChange={setUsersPage}
          />
        ) : (
          <DepartmentsList
            loading={loadingDepartments || false}
            departments={departments}
            selectedDepartments={selectedDepartments}
            mainDeptId={mainDeptId}
            onToggle={handleDepartmentToggle}
            onSetMain={handleSetMainDept}
            pagination={deptsMeta}
            onPageChange={setDepartmentsPage}
          />
        )}
      </div>
    </Modal>
  );
};
