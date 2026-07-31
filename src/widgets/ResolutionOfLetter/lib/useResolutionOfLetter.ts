import { useState } from "react";
import { Form, message } from "antd";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import { IDepartment, IUser } from "@features/SelectExecutors";
import { useResolutionAttachments } from "./resolutionOfLetter/useResolutionAttachments";
import { useResolutionExecutors } from "./resolutionOfLetter/useResolutionExecutors";

// ID текущего письма (в реальном приложении получаем из контекста или пропсов)
const CORRESPONDENCE_ID = "1";

/**
 * Хук для управления логикой создания резолюции.
 * Инкапсулирует состояние формы, выбор исполнителей и работу с файлами.
 */
export const useResolutionOfLetter = () => {
  // Форма Ant Design
  const [form] = Form.useForm();

  // Состояние модалки выбора исполнителей
  const [executorModalOpen, setExecutorModalOpen] = useState(false);

  const {
    selectedDepts,
    selectedUsers,
    mainUserId,
    mainDeptId,
    hasSelection,
    applyExecutorsSelection,
    handleRemoveDept,
    handleRemoveUser,
    handleSetMainUser,
    handleSetMainDept,
  } = useResolutionExecutors(form);

  const {
    uploadedFiles,
    isCorrespondenceLoading,
    isUploading,
    handleRemoveFile,
    handleUploadChange,
  } = useResolutionAttachments(CORRESPONDENCE_ID);

  // Мутация для создания основной записи резолюции
  const {
    mutate: chooseResolutionMutate,
    isPending: chooseResolutionIsPending,
    isAllowed,
  } = useMutationQuery({
    url: ApiRoutes.CREATE_RESOLUTION,
    method: "POST",
    preload: true,
    preloadConditional: ["correspondence.create"],
    messages: {
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  // Наблюдение за полем "Виза" для динамического изменения UI
  const visaValue = Form.useWatch("visa", form);

  // Мутация для отправки формы создания резолюции
  const { mutate: submitResolution, isPending: isSubmitting } =
    useMutationQuery({
      url: ApiRoutes.CREATE_RESOLUTION.replace(":id", CORRESPONDENCE_ID),
      method: "POST",
      queryOptions: {
        onSuccess: (data: Record<string, unknown>) => {
          // Вызываем мутацию создания основной связи
          chooseResolutionMutate(data as any);
          message.success("Резолюция успешно создана");
        },
        onError: () => {
          message.error("Ошибка при создании резолюции");
        },
      },
    });

  const handleExecutorsSelected = (
    departments: IDepartment[],
    users: IUser[],
    mainUid?: number,
    mainDid?: number,
  ) => {
    applyExecutorsSelection(departments, users, mainUid, mainDid);
    setExecutorModalOpen(false);
  };

  /**
   * Отправка финальной формы.
   */
  const onFinish = (values: Record<string, unknown>) => {
    // Формируем финальный объект данных
    const payload = {
      ...values,
      main_user_id: mainUserId,
      main_dept_id: mainDeptId,
      attachments: uploadedFiles.map((f) => f.id),
    };

    submitResolution(payload as any);
  };

  // Флаги состояния для UI
  const isTotalPending =
    isSubmitting ||
    chooseResolutionIsPending ||
    isUploading ||
    isCorrespondenceLoading;

  return {
    form,
    executorModalOpen,
    setExecutorModalOpen,
    selectedDepts,
    selectedUsers,
    mainUserId,
    mainDeptId,
    uploadedFiles,
    visaValue,
    isTotalPending,
    isAllowed,
    hasSelection,
    handleExecutorsSelected,
    handleRemoveDept,
    handleRemoveUser,
    handleSetMainUser,
    handleSetMainDept,
    handleRemoveFile,
    handleUploadChange,
    onFinish,
  };
};
