import {
  Building2,
  User,
  Mail,
  Send,
  Archive,
  Pin,
  Trash2,
  FolderInput,
  Undo2,
} from "lucide-react";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib"; // Ваши хуки
import { RegistryConfig } from "../types";
import { getIncomingFilters } from "../filters.config";

export const useIncomingConfig = (type: string): RegistryConfig => {
  const isInternal = type.includes("internal");

  // --- MUTATIONS (Логика из вашего примера) ---

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

  // --- CONFIGURATION ---

  return {
    primary: {
      label: "Отправитель",
      icon: <Building2 size={12} />,
      render: (d) => d.sender_name || "Не указано",
    },
    secondary: {
      label: "Исполнитель",
      icon: <User size={12} />,
      render: (d) =>
        isInternal
          ? d.recipients?.[0]?.user?.full_name || "—"
          : d.recipient_name || "—",
    },
    badges: [
      {
        label: isInternal ? "Рег. №" : "Вх.",
        icon: <Mail size={10} />,
        color: "blue",
        render: (d) => d.reg_number || "—",
      },
      {
        label: "Исх.",
        icon: <Send size={10} />,
        color: "emerald",
        render: (d) => d.outgoing_number || "—",
      },
    ],
    getActions: (record) => {
      const isTrashed = type.includes("trashed");
      const isArchived = type.includes("archived");
      const isPinned = record.is_pinned;

      const items = [];

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
        onClick: () => console.log("Open folder modal", record.id),
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
    filters: getIncomingFilters(),
  };
};
