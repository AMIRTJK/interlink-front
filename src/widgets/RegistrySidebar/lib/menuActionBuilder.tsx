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
 * Creates the context menu actions for a custom folder
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

  // Edit action
  menuActions.push({
    key: "edit",
    label: "Редактировать",
    icon: <EditOutlined className="text-[#0037AF]!" />,
    onClick: (e) => {
      e.domEvent.stopPropagation();
      handleEditClick(folderId, folderName);
    },
  });

  // Create subfolder action (only if depth < MAX_FOLDER_DEPTH)
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

  // Delete action
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
