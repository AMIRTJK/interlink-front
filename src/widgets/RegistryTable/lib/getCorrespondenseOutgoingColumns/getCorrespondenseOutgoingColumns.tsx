import { MoreOutlined, RollbackOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  MenuProps,
  TableColumnsType,
  Tag,
  Typography,
} from "antd";
import { getCorrespondenseOutgoingStatusLabel } from "./getCorrespondenseOutgoingStatusLabel";
import { getCorrespondenceLinkTypeLabel } from "../getCorrespondenceLinkTypeLabel";

import archiveIcon from "../../../../assets/icons/archive-icon.svg";
import pinnedIcon from "../../../../assets/icons/pinned-icon.svg";
import folderIcon from "../../../../assets/icons/folder-icon.svg";
import trashIcon from "../../../../assets/icons/trash-icon.svg";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";

export const useCorrespondenseOutgoingColumns = (
  type?: string,
  onOpenFolderModal?: (id: number) => void,
): TableColumnsType => {
  const isInternal = type?.includes("internal");

  const { mutate: archiveCorrespondence } = useMutationQuery<{
    id: number;
    is_archived: boolean;
  }>({
    url: (data) =>
      ApiRoutes.ARCHIVE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      success: "Письмо успешно архивировано",
      error: "Ошибка архивирования письма",
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  const { mutate: restoreCorrespondence } = useMutationQuery<{ id: number }>({
    url: (data) =>
      isInternal
        ? ApiRoutes.RESTORE_INTERNAL.replace(":id", String(data.id))
        : ApiRoutes.RESTORE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "POST",
    messages: {
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  const { mutate: pinCorrespondence } = useMutationQuery<{
    id: number;
    is_pinned: boolean;
  }>({
    url: (data) => ApiRoutes.PIN_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      success: "Письмо успешно закреплено",
      error: "Ошибка закрепления письма",
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  const { mutate: deleteCorrespondence } = useMutationQuery<{ id: number }>({
    url: (data) =>
      isInternal
        ? ApiRoutes.DELETE_INTERNAL.replace(":id", String(data.id))
        : ApiRoutes.DELETE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
      success: "Письмо успешно удалено",
      error: "Ошибка удаления письма",
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  return [
    {
      title: isInternal ? "Рег. номер" : "Вх. номер",
      dataIndex: "reg_number",
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
      dataIndex: "created_at",
    },
    {
      title: "Тема",
      dataIndex: "subject",
    },
    {
      title: "Тип письма",
      dataIndex: "link_type",
      render: (linkType: string, record: any) => {
        const info = getCorrespondenceLinkTypeLabel(
          linkType as any,
          record?.relation_label,
          record,
        );
        if (!info) return "—";
        return (
          <Tag
            color={info.color}
            className="py-0! px-3! overflow-hidden! block! text-white!"
          >
            <Typography.Text
              className="font-medium! text-white! text-center! truncate! block!"
              ellipsis
            >
              {info.label}
            </Typography.Text>
          </Tag>
        );
      },
    },
    {
      title: isInternal ? "Получатель" : "Исполнитель",
      // Условный dataIndex: для внутренней берем из вложенного массива, для внешней - обычное поле
      dataIndex: isInternal ? "recipient_name" : "6",
      render: (value, record: any) => {
        if (isInternal) {
          // Безопасное получение данных для внутренней
          const internalRecipient = record.recipients?.[0]?.user?.full_name;
          return internalRecipient;
        }
        // Для внешней
        return value || record.recipient_name;
      },
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
        const isTrashed = type === "trashed" || type === "internal-trashed";
        const isArchived = type === "archived" || type === "internal-archived";
        const isPinned = type === "pinned" || type === "internal-pinned";

        const items: MenuProps["items"] = [
          isArchived
            ? null
            : {
                key: "archive",
                label: "В архив",
                icon: <img src={archiveIcon} className="w-5 h-5" />,
                onClick: () => {
                  archiveCorrespondence({ id: record.id, is_archived: true });
                },
              },
          isPinned
            ? null
            : {
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
              if (onOpenFolderModal) {
                onOpenFolderModal(record.id);
              }
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
