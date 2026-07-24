import "./style.css";
import { MoreOutlined, RollbackOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  MenuProps,
  TableColumnsType,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { getCorrespondenseIncomingStatusLabel } from "./getCorrespondenseIncomingStatusLabel";

import archiveIcon from "../../../../assets/icons/archive-icon.svg";
import pinnedIcon from "../../../../assets/icons/pinned-icon.svg";
import folderIcon from "../../../../assets/icons/folder-icon.svg";
import trashIcon from "../../../../assets/icons/trash-icon.svg";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";

export const useCorrespondenseIncomingColumns = (
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
    preload: true,
    preloadConditional: [
      "correspondence.create",
      "correspondence.update",
      "correspondence.delete",
    ],
    messages: {
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
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  return [
    {
      title: isInternal ? "Рег. номер" : "Вх. номер",
      dataIndex: "reg_number",
      render: (val: string, record: any) => {
        const num = val || record?.reg_number;
        if (!num) return "—";
        const prefix = record?.my_prefix || "IN";
        return num.replace(/^[A-Z]+/i, prefix);
      },
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
      title: isInternal ? "Получатель" : "Исполнитель",
      // Условный dataIndex: для внутренней берем из вложенного массива, для внешней - обычное поле
      dataIndex: isInternal
        ? ["recipients", 0, "user", 0, "full_name"]
        : "recipient_name",
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
      title: "Ознакомились",
      dataIndex: "acknowledged_users",
      render: (users: any[]) => {
        const list = Array.isArray(users) ? users : [];
        if (list.length === 0) return "—";
        const initials = (name: string) => {
          if (!name) return "?";
          const parts = name.trim().split(/\s+/);
          return (
            parts.length >= 2
              ? parts[0][0] + parts[1][0]
              : parts[0].slice(0, 2)
          ).toUpperCase();
        };
        return (
          <Avatar.Group max={{ count: 3 }} size="small">
            {list.map((au: any) => {
              const u = au?.user || au;
              return (
                <Tooltip
                  key={au?.id || u?.id}
                  title={u?.full_name || "Сотрудник"}
                >
                  <Avatar
                    size="small"
                    style={{ backgroundColor: "#229A2E" }}
                    src={u?.photo_url || u?.photo_path || undefined}
                  >
                    {initials(u?.full_name || "")}
                  </Avatar>
                </Tooltip>
              );
            })}
          </Avatar.Group>
        );
      },
    },
    {
      title: "Статус",
      dataIndex: "status",
      render: (_, record: any) => {
        const assignments = Array.isArray(record?.assignments)
          ? record.assignments
          : Array.isArray(record?.assignment_list)
          ? record.assignment_list
          : record?.assignment
          ? [record.assignment]
          : [];

        let label = "Без поручения";
        let color = "#1890ff";

        if (assignments.length > 0) {
          const activeAssign = assignments[assignments.length - 1];
          const assignStatus = (activeAssign?.status || "").toString().toLowerCase();

          if (
            assignStatus === "pending" ||
            assignStatus === "in_progress" ||
            assignStatus === "in-progress"
          ) {
            label = "В процессе исполнения";
            color = "#faad14";
          } else if (
            assignStatus === "submitted" ||
            assignStatus === "review" ||
            assignStatus === "to_review"
          ) {
            label = "На проверке";
            color = "#722ed1";
          } else if (
            assignStatus === "done" ||
            assignStatus === "completed"
          ) {
            label = "Завершено";
            color = "#52c41a";
          } else if (assignStatus === "returned") {
            label = "На доработке";
            color = "#ff4d4f";
          } else {
            label = "В процессе исполнения";
            color = "#faad14";
          }
        } else {
          const { label: defaultLabel, color: defaultColor } =
            getCorrespondenseIncomingStatusLabel(record?.status);
          if (record?.status && record.status !== "sent") {
            label = defaultLabel;
            color = defaultColor;
          }
        }

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
