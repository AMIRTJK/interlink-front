import React, { useState } from "react";
import { Modal, Button, Form, Input, Row, Col } from "antd";
import { UserOutlined, ApartmentOutlined, FilterOutlined } from "@ant-design/icons";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IDepartment, IUser, ISelectExecutorsModalProps } from "./model";
import { UsersList, DepartmentsList } from "./lib";
import { Tabs, SelectField } from "@shared/ui";
import "./SelectExecutorsModal.css";

export const SelectExecutorsModal: React.FC<ISelectExecutorsModalProps> = ({
  open,
  onCancel,
  onOk,
  initialSelectedDepartments = [],
  initialSelectedUsers = [],
  initialMainUserId,
  initialMainDeptId
}) => {
  const [activeTab, setActiveTab] = useState<string>("users");
  const [selectedDepartments, setSelectedDepartments] = useState<IDepartment[]>(initialSelectedDepartments);
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>(initialSelectedUsers);
  const [mainUserId, setMainUserId] = useState<number | undefined>(initialMainUserId);
  const [mainDeptId, setMainDeptId] = useState<number | undefined>(initialMainDeptId);
  
  const [queryParams, setQueryParams] = useState({
    search: "",
    department_id: undefined as number | undefined,
    role_id: undefined as number | undefined,
  });

  const [usersPage, setUsersPage] = useState(1);
  const [departmentsPage, setDepartmentsPage] = useState(1);

  const [form] = Form.useForm();

  const { data: deptsResponse, isLoading: loadingDepartments } = useGetQuery<{ search?: string; page?: number }, any>({
    url: ApiRoutes.GET_DEPARTMENTS,
    params: { 
        ...(activeTab === 'departments' && queryParams.search ? { search: queryParams.search } : {}),
        page: departmentsPage 
    }, 
    options: { enabled: open, keepPreviousData: true },
  });

  const { data: usersResponse, isLoading: loadingUsers } = useGetQuery<{ search?: string; department_id?: number; role_id?: number; page?: number; with_departments?: number; with_roles?: number }, any>({
    url: ApiRoutes.GET_USERS,
    params: {
        ...(queryParams.search ? { search: queryParams.search } : {}),
        ...(queryParams.department_id ? { department_id: queryParams.department_id } : {}),
        ...(queryParams.role_id ? { role_id: queryParams.role_id } : {}),
        with_departments: 1,
        with_roles: 1,
        page: usersPage
    },
    options: { enabled: open, keepPreviousData: true },
  });

  const extractData = <T,>(resp: unknown): T[] => {
    if (!resp) return [];
    const typed = resp as { data?: T[] | { data?: T[] } };
    const root = typed.data || typed;
    if (Array.isArray(root)) return root;
    if (root && typeof root === 'object' && 'data' in root && Array.isArray(root.data)) return root.data;
    return [];
  };

  const getMeta = (resp: unknown) => {
    const typed = resp as { data?: { current_page?: number; last_page?: number }, current_page?: number; last_page?: number };
    const root = typed?.data || typed;
    return {
      current_page: root?.current_page || 1,
      last_page: root?.last_page || 1
    };
  };

  const departments = extractData<IDepartment>(deptsResponse);
  const users = extractData<IUser>(usersResponse);
  const deptsMeta = getMeta(deptsResponse);
  const usersMeta = getMeta(usersResponse);

  React.useEffect(() => {
    if (open) {
      setSelectedDepartments(initialSelectedDepartments);
      setSelectedUsers(initialSelectedUsers);
      setMainUserId(initialMainUserId);
      setMainDeptId(initialMainDeptId);
    }
  }, [open, initialSelectedDepartments, initialSelectedUsers, initialMainUserId, initialMainDeptId]);

  const handleSetMainUser = (id: number) => {
    setMainUserId(prev => prev === id ? undefined : id);
    setMainDeptId(undefined); // Только один главный
  };

  const handleSetMainDept = (id: number) => {
    setMainDeptId(prev => prev === id ? undefined : id);
    setMainUserId(undefined); // Только один главный
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setUsersPage(1);
    setDepartmentsPage(1);
    setQueryParams({
        search: values.search,
        department_id: values.department_id,
        role_id: values.role_id,
    });
  };

  const handleClose = () => {
    setQueryParams({ search: "", department_id: undefined, role_id: undefined });
    setUsersPage(1);
    setDepartmentsPage(1);
    setMainUserId(undefined);
    setMainDeptId(undefined);
    form.resetFields();
    onCancel();
  }

  const handleDepartmentToggle = (dept: IDepartment) => {
    setSelectedDepartments(prev => {
        const isExist = prev.find(d => d.id === dept.id);
        if (isExist) {
            if (mainDeptId === dept.id) setMainDeptId(undefined);
            return prev.filter(d => d.id !== dept.id);
        }
        return [...prev, dept];
    });
  };

  const handleUserToggle = (user: IUser) => {
    setSelectedUsers(prev => {
        const isExist = prev.find(u => u.id === user.id);
        if (isExist) {
            if (mainUserId === user.id) setMainUserId(undefined);
            return prev.filter(u => u.id !== user.id);
        }
        return [...prev, user];
    });
  };

  const handleOk = () => {
    onOk(selectedDepartments, selectedUsers, mainUserId, mainDeptId);
    handleClose();
  };

  const tabItems = [
      { key: "users", label: (<span><UserOutlined /> Сотрудники</span>) },
      { key: "departments", label: (<span><ApartmentOutlined /> Отделы</span>) },
  ];

  const transformSelectResponse = (resp: unknown) => {
      const data = extractData<{ id: number; name?: string; full_name?: string; title?: string }>(resp);
      return data.map((item) => ({
          value: item.id.toString(),
          label: item.name || item.full_name || item.title || ""
      }));
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="back" onClick={handleClose} type="text" style={{ color: '#999' }}>Отмена</Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Добавить ({selectedDepartments.length + selectedUsers.length})
        </Button>,
      ]}
      title="Выберите исполнителей"
      className="select-executors-modal"
      width={1000}
      centered
    >
      <div className="select-executors-search bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
        <Form form={form} layout="vertical" onFinish={handleSearch}>
            <Row gutter={16} align="bottom">
                <Col span={activeTab === 'users' ? 7 : 18}>
                    <Form.Item name="search" label={<span className="text-gray-700 font-bold">Поиск</span>} className="mb-0">
                        <Input placeholder="ФИО или название" onPressEnter={handleSearch} allowClear />
                    </Form.Item>
                </Col>
                
                {activeTab === 'users' && (
                    <>
                        <Col span={5}>
                            <SelectField 
                                name="department_id" 
                                label="Отдел"
                                url={ApiRoutes.GET_DEPARTMENTS}
                                placeholder="Любой"
                                allowClear
                                showSearch
                                isFetchAllowed={open}
                                transformResponse={transformSelectResponse}
                                className="mb-0"
                                searchParamKey="search"
                            />
                        </Col>
                        <Col span={5}>
                            <SelectField 
                                name="role_id" 
                                label="Роль"
                                url={ApiRoutes.GET_ROLES}
                                placeholder="Любая"
                                allowClear
                                showSearch
                                isFetchAllowed={open}
                                transformResponse={transformSelectResponse}
                                className="mb-0"
                                searchParamKey="search"
                            />
                        </Col>
                    </>
                )}
                
                <Col span={activeTab === 'users' ? 7 : 6}>
                    <Form.Item label=" " className="mb-0">
                        <Button type="primary" icon={<FilterOutlined />} onClick={handleSearch} block>
                            Найти
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </Form>
      </div>

      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} className="mb-4" />

      <div className="mt-4">
          {activeTab === 'users' ? (
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
