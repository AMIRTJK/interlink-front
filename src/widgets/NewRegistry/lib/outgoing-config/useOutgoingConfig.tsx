import {
  User,
  CheckCheck,
  FileText,
  Loader,
  Trash2,
  Undo2,
  FolderInput,
  Pin,
  Archive,
} from "lucide-react";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { RegistryConfig } from "../types";
import { getOutgoingFilters } from "../filters.config";
import { RecipientsViewer } from "@widgets/NewRegistry/ui";
import { MenuProps } from "antd";

export const useOutgoingConfig = (type: string): RegistryConfig => {
  const isInternal = type.includes("internal");

  const { mutate: archiveCorrespondence } = useMutationQuery({
    url: (data) =>
      ApiRoutes.ARCHIVE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      success: "Архивировано",
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  const { mutate: restoreCorrespondence } = useMutationQuery({
    url: (data) =>
      isInternal
        ? ApiRoutes.RESTORE_INTERNAL.replace(":id", String(data.id))
        : ApiRoutes.RESTORE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "POST",
    messages: {
      success: "Восстановлено",
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  const { mutate: pinCorrespondence } = useMutationQuery({
    url: (data) => ApiRoutes.PIN_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      success: "Закреплено",
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  const { mutate: deleteCorrespondence } = useMutationQuery({
    url: (data) =>
      isInternal
        ? ApiRoutes.DELETE_INTERNAL.replace(":id", String(data.id))
        : ApiRoutes.DELETE_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "DELETE",
    messages: {
      success: "Удалено",
      invalidate: [ApiRoutes.GET_CORRESPONDENCES],
    },
  });

  return {
    primary: {
      label: "Отправитель",
      icon: <User size={12} />,
      render: (d) => d.creator?.full_name || "Я",
    },
    secondary: {
      label: "Получатели",
      icon: <Loader size={12} />,
      // render: (d) => {
      //   if (d.status === "to_sign") return "На подписании";
      //   return d.recipient_name || d.recipients?.[0]?.user?.full_name || "—";
      // },
      render: (d) => <RecipientsViewer data={d} />,
    },
    badges: [
      {
        label: "Дата",
        icon: <FileText size={10} />,
        color: "gray",
        render: (d) => new Date(d.created_at).toLocaleDateString(),
      },
      {
        label: "Рег. №",
        icon: <CheckCheck size={10} />,
        color: "blue",
        render: (d) => d.reg_number || "Не присвоен",
      },
    ],
    getActions: (record, onMove) => {
      const isTrashed = type.includes("trashed");
      const isArchived = type.includes("archived");
      const isPinned = record.is_pinned;

      const items: MenuProps["items"] = [];

      if (!isArchived) {
        items.push({
          key: "archive",
          label: "В архив",
          icon: <Archive size={16} />,
          onClick: () =>
            archiveCorrespondence({ id: record.id, is_archived: true }),
        });
      }

      if (!isPinned) {
        items.push({
          key: "pin",
          label: "Закрепить",
          icon: <Pin size={16} />,
          onClick: () => pinCorrespondence({ id: record.id, is_pinned: true }),
        });
      }

      items.push({
        key: "folder",
        label: "В папку",
        icon: <FolderInput size={16} />,
        onClick: () => onMove?.(record.id),
      });

      items.push({ type: "divider" });

      if (isTrashed) {
        items.push({
          key: "restore",
          label: "Восстановить",
          icon: <Undo2 size={16} className="text-blue-600" />,
          onClick: () => restoreCorrespondence({ id: record.id }),
        });
      } else {
        items.push({
          key: "delete",
          label: "Удалить",
          danger: true,
          icon: <Trash2 size={16} />,
          onClick: () => deleteCorrespondence({ id: record.id }),
        });
      }

      return items;
    },
    filters: getOutgoingFilters(),
  };
};
