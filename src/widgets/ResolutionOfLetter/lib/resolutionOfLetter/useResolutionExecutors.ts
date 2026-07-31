import { useState } from "react";
import type { FormInstance } from "antd";
import { IDepartment, IUser } from "@features/SelectExecutors";

/** Выбранные исполнители резолюции и синхронизация их с полями формы. */
export const useResolutionExecutors = (form: FormInstance) => {
  // Выбранные отделы и сотрудники
  const [selectedDepts, setSelectedDepts] = useState<IDepartment[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);

  // ID главных исполнителей (человек или отдел)
  const [mainUserId, setMainUserId] = useState<number | undefined>();
  const [mainDeptId, setMainDeptId] = useState<number | undefined>();

  /**
   * Выбор исполнителей в модальном окне.
   * Синхронизирует локальное состояние с полями формы.
   */
  const applyExecutorsSelection = (
    departments: IDepartment[],
    users: IUser[],
    mainUid?: number,
    mainDid?: number,
  ) => {
    setSelectedDepts(departments);
    setSelectedUsers(users);
    setMainUserId(mainUid);
    setMainDeptId(mainDid);

    form.setFieldsValue({
      assignee_departments: departments?.map((d) => d.id),
      assignee_users: users?.map((u) => u.id),
      main_assignee_user_id: mainUid,
      main_assignee_dept_id: mainDid,
    });
  };

  /**
   * Удаление отдела из списка выбранных.
   */
  const handleRemoveDept = (id: number) => {
    const newDepts = selectedDepts?.filter((d) => d.id !== id);
    setSelectedDepts(newDepts);

    if (mainDeptId === id) {
      setMainDeptId(undefined);
      form.setFieldValue("main_assignee_dept_id", undefined);
    }
    form.setFieldValue(
      "assignee_departments",
      newDepts?.map((d) => d.id),
    );
  };

  /**
   * Удаление сотрудника из списка выбранных.
   */
  const handleRemoveUser = (id: number) => {
    const newUsers = selectedUsers?.filter((u) => u.id !== id);
    setSelectedUsers(newUsers);

    if (mainUserId === id) {
      setMainUserId(undefined);
      form.setFieldValue("main_assignee_user_id", undefined);
    }
    form.setFieldValue(
      "assignee_users",
      newUsers.map((u) => u.id),
    );
  };

  /**
   * Переключение статуса главного исполнителя (сотрудник).
   */
  const handleSetMainUser = (id: number) => {
    const newId = mainUserId === id ? undefined : id;
    setMainUserId(newId);
    setMainDeptId(undefined);
    form.setFieldsValue({
      main_assignee_user_id: newId,
      main_assignee_dept_id: undefined,
    });
  };

  /**
   * Переключение статуса главного исполнителя (отдел).
   */
  const handleSetMainDept = (id: number) => {
    const newId = mainDeptId === id ? undefined : id;
    setMainDeptId(newId);
    setMainUserId(undefined);
    form.setFieldsValue({
      main_assignee_dept_id: newId,
      main_assignee_user_id: undefined,
    });
  };

  return {
    selectedDepts,
    selectedUsers,
    mainUserId,
    mainDeptId,
    hasSelection: selectedDepts.length > 0 || selectedUsers.length > 0,
    applyExecutorsSelection,
    handleRemoveDept,
    handleRemoveUser,
    handleSetMainUser,
    handleSetMainDept,
  };
};
