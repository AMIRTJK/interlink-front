import type { FormInstance } from "antd";
import { useMutationQuery } from "@shared/lib";
import { ApiRoutes } from "@shared/api";

interface IParams {
  isInternal: boolean;
  form: FormInstance;
  onCloseModal: () => void;
  refetchFolders: () => void;
}

/** Создание, переименование и удаление пользовательских папок сайдбара. */
export const useSidebarFolderMutations = ({
  isInternal,
  form,
  onCloseModal,
  refetchFolders,
}: IParams) => {
  const { mutate: createFolder } = useMutationQuery({
    url: isInternal ? ApiRoutes.CREATE_INTERNAL_FOLDER : ApiRoutes.CREATE_FOLDER,
    method: "POST",
    messages: {
      onSuccessCb: () => {
        onCloseModal();
        form.resetFields();
        refetchFolders();
      },
    },
  });

  const { mutate: updateFolder } = useMutationQuery<{
    id: number;
    name: string;
  }>({
    url: (data) =>
      (isInternal ? ApiRoutes.UPDATE_INTERNAL_FOLDER : ApiRoutes.UPDATE_FOLDER).replace(
        ":id",
        String(data.id),
      ),
    method: "PATCH",
    messages: {
      onSuccessCb: () => {
        onCloseModal();
        form.resetFields();
        refetchFolders();
      },
    },
  });

  const { mutate: deleteFolder } = useMutationQuery<{ id: number }>({
    url: (data) =>
      (isInternal ? ApiRoutes.DELETE_INTERNAL_FOLDER : ApiRoutes.DELETE_FOLDER).replace(
        ":id",
        String(data.id),
      ),
    method: "DELETE",
    messages: {
      onSuccessCb: () => {
        refetchFolders();
      },
    },
  });

  return { createFolder, updateFolder, deleteFolder };
};
