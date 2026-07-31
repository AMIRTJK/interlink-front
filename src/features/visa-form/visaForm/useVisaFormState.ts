import { useEffect, useMemo, useState } from "react";
import { Form, message, type FormInstance } from "antd";
import { tokenControl, useGetQuery, useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import {
  CorrespondenceResponse,
  CreateAssignmentRequest,
} from "@entities/correspondence";
import { IApiDepartment, IApiUser } from "./visaFormModel";

interface IParams {
  correspondenceData?: CorrespondenceResponse;
  selectedUserIds: number[];
  selectedDeptIds: number[];
  selectedMainExecutorIds: number[];
  onSuccess?: () => void;
  onClose: () => void;
}

interface IResult {
  form: FormInstance;
  selectedUsersList: IApiUser[];
  selectedDeptsList: IApiDepartment[];
  hasSelection: boolean;
  isFormValid: boolean;
  handleFormChange: (
    _: unknown,
    allValues: { due_at: unknown; note: string; status: string },
  ) => void;
  handleSubmit: () => void;
}

/** Данные визы: списки выбранных исполнителей, валидность формы и отправка поручения. */
export const useVisaFormState = ({
  correspondenceData,
  selectedUserIds,
  selectedDeptIds,
  selectedMainExecutorIds,
  onSuccess,
  onClose,
}: IParams): IResult => {
  const [isFormValid, setIsFormValid] = useState(false);
  const [form] = Form.useForm();

  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
  });

  const { data: deptsData } = useGetQuery({
    url: ApiRoutes.GET_DEPARTMENTS,
    useToken: true,
  });

  const selectedUsersList = useMemo(() => {
    const allUsers = (usersData?.data?.data as IApiUser[]) || [];
    const filtered = allUsers.filter((u) => selectedUserIds.includes(u.id));

    return filtered.sort((a, b) => {
      const isAMain = selectedMainExecutorIds.includes(a.id);
      const isBMain = selectedMainExecutorIds.includes(b.id);
      if (isAMain && !isBMain) return -1;
      if (!isAMain && isBMain) return 1;
      return 0;
    });
  }, [usersData, selectedUserIds, selectedMainExecutorIds]);

  const selectedDeptsList = useMemo(() => {
    const allDepts = (deptsData?.data?.data as IApiDepartment[]) || [];
    return allDepts.filter((d) => selectedDeptIds.includes(d.id));
  }, [deptsData, selectedDeptIds]);

  const hasSelection =
    selectedUsersList.length > 0 || selectedDeptsList.length > 0;

  const handleFormChange = (
    _: unknown,
    allValues: { due_at: unknown; note: string; status: string },
  ) => {
    const { due_at, note, status } = allValues;
    const isValid = !!due_at && !!note && !!status && hasSelection;
    setIsFormValid(isValid);
  };

  useEffect(() => {
    const values = form.getFieldsValue(["due_at", "note", "status"]);
    const isValid =
      !!values.due_at && !!values.note && !!values.status && hasSelection;
    setIsFormValid(isValid);
  }, [hasSelection, form]);

  const { mutate } = useMutationQuery<CreateAssignmentRequest>({
    url: ApiRoutes.ASSIGNMENTS_CORRESPONDENCE,
    method: "POST",
    messages: {
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
    preload: true,
    preloadConditional: ["correspondence.assign"],
  });

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const userIdStr = tokenControl.getUserId();
      const currentUserId = userIdStr ? Number(userIdStr) : null;

      if (!currentUserId) {
        message.error("Ошибка авторизации: не найден ID пользователя");
        return;
      }

      const assignmentsList = correspondenceData?.assignments || [];

      const myAssignment = assignmentsList.find(
        (item) => item.assignee_user_id === currentUserId,
      );

      const resolutionId = myAssignment?.resolution_id;

      const payload: any = {
        resolution_id: resolutionId,
        note: values.note,
        due_at: values.due_at,
      };

      if (selectedUserIds.length > 0) {
        payload.assignee_users = selectedUserIds;
      }

      if (selectedDeptIds.length > 0) {
        payload.assignee_departments = selectedDeptIds;
      }

      mutate(payload, {
        onSuccess: () => {
          if (onSuccess) onSuccess();
          form.resetFields();
        },
      });
    });
    onClose();
  };

  return {
    form,
    selectedUsersList,
    selectedDeptsList,
    hasSelection,
    isFormValid,
    handleFormChange,
    handleSubmit,
  };
};
