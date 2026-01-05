import {
  MoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  MenuProps,
  TableColumnsType,
  Tag,
  Typography,
} from "antd";
import { getCorrespondenseOutgoingStatusLabel } from "./getCorrespondenseOutgoingStatusLabel";

import archiveIcon from "../../../../assets/icons/archive-icon.svg";
import pinnedIcon from "../../../../assets/icons/pinned-icon.svg";
import folderIcon from "../../../../assets/icons/folder-icon.svg";
import trashIcon from "../../../../assets/icons/trash-icon.svg";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";

export const useCorrespondenseOutgoingColumns = (): TableColumnsType => {
  // Archive mutation
  const { mutate: archiveCorrespondence } = useMutationQuery<{ id: number; is_archived: boolean }>({
    url: (data) => ApiRoutes.ARCHIVE_CORRESPONDENCE.replace(':id', String(data.id)),
    method: "PATCH",
    messages: {
      success: "Письмо успешно архивировано",
      error: "Ошибка архивирования письма",
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  // Pin mutation
  const { mutate: pinCorrespondence } = useMutationQuery<{ id: number; is_pinned: boolean }>({
    url: (data) => ApiRoutes.PIN_CORRESPONDENCE.replace(':id', String(data.id)),
    method: "PATCH",
    messages: {
      success: "Письмо успешно закреплено",
      error: "Ошибка закрепления письма",
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  // Move to folder mutation
  const { mutate: _moveToFolder } = useMutationQuery<{ id: number; folder_id: number }>({
    url: (data) => ApiRoutes.FOLDER_CORRESPONDENCE.replace(':id', String(data.id)),
    method: "PATCH",
    messages: {
      success: "Письмо перемещено в папку",
      error: "Ошибка перемещения письма",
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  // Delete mutation
  const { mutate: deleteCorrespondence } = useMutationQuery<{ id: number }>({
    url: (data) => ApiRoutes.DELETE_CORRESPONDENCE.replace(':id', String(data.id)),
    method: "DELETE",
    messages: {
      success: "Письмо успешно удалено",
      error: "Ошибка удаления письма",
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  return [
    {
      title: "Вх. номер",
      dataIndex: "1",
    },

    {
      title: "Исх. номер",
      dataIndex: "2",
    },
    {
      title: "Отправитель",
      dataIndex: "3",
    },
    {
      title: "Дата",
      dataIndex: "4",
    },
    {
      title: "Тема",
      dataIndex: "5",
    },
    {
      title: "Исполнитель",
      dataIndex: "6",
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (_, { status }) => {
        const { label, color } = getCorrespondenseOutgoingStatusLabel(status);
        return (
          <Tag
            color={color}
            className="py-0! px-3! overflow-hidden! w-full! block!"
          >
            <Typography.Text
              className="font-medium! text-[#252525]! text-center! truncate! block!"
              ellipsis
            >
              {label}
            </Typography.Text>
          </Tag>
        );
      },
    },
    {
      title: "",
      width: 40,
      fixed: "right",
      render: (record) => {
        const items: MenuProps["items"] = [
          {
            key: "archive",
            label: "В архив",
            icon: <img src={archiveIcon} className="w-5 h-5" />,
            onClick: () => {
              archiveCorrespondence({ das: record.id, is_archived: true });
            },
          },
          {
            key: "pin",
            label: "Закрепить",
            icon: <img src={pinnedIcon} className="w-5 h-5" />,
            onClick: () => {
              pinCorrespondence({ id: record.id, is_pinned: true });
            },
          },
          {
            key: "folder",
            label: "В папку",
            icon: <img src={folderIcon} className="w-5 h-5" />,
            onClick: () => {
              // TODO: Open modal to select folder, then call mutation with folder_id
              console.log("Move to folder", record);
              // moveToFolder({ id: record.id, folder_id: selectedFolderId });
            },
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Удалить",
            danger: true,
            icon: <img src={trashIcon} className="w-5 h-5" />,
            onClick: () => {
              deleteCorrespondence({ id: record.id });
            },
          },
        ];

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              menu={{ items }}
              trigger={["click"]}
              placement="bottomRight"
              overlayClassName="custom-registry-dropdown"
            >
              <Button
                type="text"
                icon={
                  <MoreOutlined
                    style={{ fontSize: "20px", color: "#8C8C8C" }}
                  />
                }
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];
};

// Backward compatibility export

