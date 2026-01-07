import "./style.css";
import { MoreOutlined, RollbackOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  MenuProps,
  TableColumnsType,
  Tag,
  Typography,
} from "antd";
import { getCorrespondenseIncomingStatusLabel } from "./getCorrespondenseIncomingStatusLabel";

import archiveIcon from "../../../../assets/icons/archive-icon.svg";
import pinnedIcon from "../../../../assets/icons/pinned-icon.svg";
import folderIcon from "../../../../assets/icons/folder-icon.svg";
import trashIcon from "../../../../assets/icons/trash-icon.svg";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";

export const useCorrespondenseIncomingColumns = (
  type?: string
): TableColumnsType => {
  // Archive mutation
  const { mutate: archiveCorrespondence } = useMutationQuery<{
    id: number;
    is_archived: boolean;
  }>({
    url: (data) =>
      ApiRoutes.ARCHIVE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    preload: true,
    preloadConditional: [
      "correspondence.create",
      "correspondence.update",
      "correspondence.delete",
    ],
    messages: {
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  const { mutate: restoreCorrespondence } = useMutationQuery<{ id: number }>({
    url: (data) =>
      ApiRoutes.RESTORE_CORRESPONDENCE.replace(":id", String(data.id)), // Проверьте наличие роута в ApiRoutes
    method: "POST",
    messages: {
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  // Pin mutation
  const { mutate: pinCorrespondence } = useMutationQuery<{
    id: number;
    is_pinned: boolean;
  }>({
    url: (data) => ApiRoutes.PIN_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  // Folder mutation
  const { mutate: moveToFolder } = useMutationQuery<{
    folder_id: number;
    id: number;
  }>({
    url: (data) =>
      ApiRoutes.FOLDER_CORRESPONDENCE.replace(":folder_id", String(data.id)),
    method: "PATCH",
    preload: true,
    preloadConditional: ["correspondence.update"],
    messages: {
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  // Delete mutation
  const { mutate: deleteCorrespondence } = useMutationQuery<{ id: number }>({
    url: (data) =>
      ApiRoutes.DELETE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
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
      dataIndex: "sender_name",
    },
    {
      title: "Дата",
      dataIndex: "created_at",
    },
    {
      title: "Тема",
      dataIndex: "subject",
    },
    {
      title: "Исполнитель",
      dataIndex: "6",
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (_, { status }) => {
        const { label, color } = getCorrespondenseIncomingStatusLabel(status);
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
        const isTrashed = type === "trashed";

        const items: MenuProps["items"] = [
          {
            key: "archive",
            label: "В архив",
            icon: <img src={archiveIcon} className="w-5 h-5" />,
            onClick: () => {
              archiveCorrespondence({ id: record.id, is_archived: true });
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
              //cоздать модалку для выбора папки и отправки запроса с folder_id
              console.log("Move to folder", record);
              moveToFolder({
                id: record.id,
                folder_id: record.id,
              });
            },
          },
          {
            type: "divider",
          },
          isTrashed
            ? {
                key: "restore",
                label: "Восстановить",
                icon: <RollbackOutlined className="text-[#0037AF]!" />,
                onClick: () => restoreCorrespondence({ id: record.id }),
              }
            : {
                key: "delete",
                label: "Удалить",
                danger: true,
                icon: <img src={trashIcon} className="w-5 h-5" />,
                onClick: () => deleteCorrespondence({ id: record.id }),
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
