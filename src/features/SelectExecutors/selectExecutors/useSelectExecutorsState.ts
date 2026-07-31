import React, { useState } from "react";
import { Form } from "antd";
import { useGetQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IDepartment, IUser } from "../model";
import { extractData, getMeta } from "./selectExecutorsLib";

interface IParams {
  open: boolean;
  onCancel: () => void;
  onOk: (
    departments: IDepartment[],
    users: IUser[],
    mainUserId?: number,
    mainDeptId?: number,
  ) => void;
  initialSelectedDepartments: IDepartment[];
  initialSelectedUsers: IUser[];
  initialMainUserId?: number;
  initialMainDeptId?: number;
}

/** Состояние окна выбора исполнителей: вкладки, поиск, пагинация и выбор. */
export const useSelectExecutorsState = ({
  open,
  onCancel,
  onOk,
  initialSelectedDepartments,
  initialSelectedUsers,
  initialMainUserId,
  initialMainDeptId,
}: IParams) => {
  const [activeTab, setActiveTab] = useState<string>("users");
  const [selectedDepartments, setSelectedDepartments] = useState<IDepartment[]>(
    initialSelectedDepartments,
  );
  const [selectedUsers, setSelectedUsers] =
    useState<IUser[]>(initialSelectedUsers);
  const [mainUserId, setMainUserId] = useState<number | undefined>(
    initialMainUserId,
  );
  const [mainDeptId, setMainDeptId] = useState<number | undefined>(
    initialMainDeptId,
  );

  const [queryParams, setQueryParams] = useState({
    search: "",
    department_id: undefined as number | undefined,
    role_id: undefined as number | undefined,
  });

  const [usersPage, setUsersPage] = useState(1);
  const [departmentsPage, setDepartmentsPage] = useState(1);

  const [form] = Form.useForm();

  const { data: deptsResponse, isLoading: loadingDepartments } = useGetQuery<
    { search?: string; page?: number },
    any
  >({
    url: ApiRoutes.GET_DEPARTMENTS,
    params: {
      ...(activeTab === "departments" && queryParams.search
        ? { search: queryParams.search }
        : {}),
      page: departmentsPage,
    },
    options: { enabled: open, keepPreviousData: true },
  });

  const { data: usersResponse, isLoading: loadingUsers } = useGetQuery<
    {
      search?: string;
      department_id?: number;
      role_id?: number;
      page?: number;
      with_departments?: number;
      with_roles?: number;
      per_page?: number;
    },
    any
  >({
    url: ApiRoutes.GET_USERS,
    params: {
      ...(queryParams.search ? { search: queryParams.search } : {}),
      ...(queryParams.department_id
        ? { department_id: queryParams.department_id }
        : {}),
      ...(queryParams.role_id ? { role_id: queryParams.role_id } : {}),
      with_departments: 1,
      with_roles: 1,
      per_page: 100,
      page: usersPage,
    },
    options: { enabled: open, keepPreviousData: true },
  });

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
  }, [
    open,
    initialSelectedDepartments,
    initialSelectedUsers,
    initialMainUserId,
    initialMainDeptId,
  ]);

  const handleSetMainUser = (id: number) => {
    setMainUserId((prev) => (prev === id ? undefined : id));
    setMainDeptId(undefined); // Только один главный
  };

  const handleSetMainDept = (id: number) => {
    setMainDeptId((prev) => (prev === id ? undefined : id));
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
    setQueryParams({
      search: "",
      department_id: undefined,
      role_id: undefined,
    });
    setUsersPage(1);
    setDepartmentsPage(1);
    setMainUserId(undefined);
    setMainDeptId(undefined);
    form.resetFields();
    onCancel();
  };

  const handleDepartmentToggle = (dept: IDepartment) => {
    setSelectedDepartments((prev) => {
      const isExist = prev.find((d) => d.id === dept.id);
      if (isExist) {
        if (mainDeptId === dept.id) setMainDeptId(undefined);
        return prev.filter((d) => d.id !== dept.id);
      }
      return [...prev, dept];
    });
  };

  const handleUserToggle = (user: IUser) => {
    setSelectedUsers((prev) => {
      const isExist = prev.find((u) => u.id === user.id);
      if (isExist) {
        if (mainUserId === user.id) setMainUserId(undefined);
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleOk = () => {
    onOk(selectedDepartments, selectedUsers, mainUserId, mainDeptId);
    handleClose();
  };

  return {
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
  };
};
