import { MenuProps } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import trashIcon from "../../../assets/icons/trash-icon.svg";
import { MAX_FOLDER_DEPTH } from "./constants";

interface MenuActionParams {
  folderId: number;
  folderName: string;
  depth: number;
  handleEditClick: (folderId: number, currentName: string) => void;
  handleAddClick: (parentId: number | null) => void;
  deleteFolder: (data: { id: number }) => void;
}

/**
 * Сборка экшенов меню папки
 */
export const createFolderMenuActions = ({
  folderId,
  folderName,
  depth,
  handleEditClick,
  handleAddClick,
  deleteFolder,
}: MenuActionParams): MenuProps["items"] => {
  const menuActions: MenuProps["items"] = [];

// Редактирование
  menuActions.push({
    key: "edit",
    label: "Редактировать",
    icon: <EditOutlined className="text-[#0037AF]!" />,
    onClick: (e) => {
      e.domEvent.stopPropagation();
      handleEditClick(folderId, folderName);
    },
  });

  if (depth < MAX_FOLDER_DEPTH) {
    menuActions.push({
      key: "create-sub",
      label: "Создать папку",
      icon: <PlusOutlined className="text-[#0037AF]!" />,
      onClick: (e) => {
        e.domEvent.stopPropagation();
        handleAddClick(folderId);
      },
    });
  }

// Удаление
  menuActions.push({
    key: "delete",
    label: "Удалить",
    danger: true,
    icon: <img src={trashIcon} className="w-5 h-5" />,
    onClick: (e) => {
      e.domEvent.stopPropagation();
      deleteFolder({ id: folderId });
    },
  });

  return menuActions;
};
