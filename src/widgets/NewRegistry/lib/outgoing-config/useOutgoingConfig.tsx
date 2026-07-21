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
  UserCheck,
  CornerUpLeft,
} from "lucide-react";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { CORRESPONDENCE_INVALIDATE_KEYS } from "@shared/config";
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
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
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
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
    },
  });

  const { mutate: pinCorrespondence } = useMutationQuery({
    url: (data) => ApiRoutes.PIN_CORRESPONDENCE.replace(":id", String(data.id)),
    method: "PATCH",
    messages: {
      success: "Закреплено",
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
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
      invalidate: CORRESPONDENCE_INVALIDATE_KEYS,
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
      {
        label: "Тип письма",
        icon: <CornerUpLeft size={10} />,
        color: "purple",
        render: (d) => {
          // Бэкенд отдаёт локализованный relation_label и link_type
          // ("reply" | "forward" | null). Null — обычное письмо без связи.
          if (d.relation_label) return d.relation_label;
          if (d.link_type === "reply") return "Ответное";
          if (d.link_type === "forward") return "Пересланное";
          return "Обычное";
        },
      },
      {
        label: "Мой статус",
        icon: <UserCheck size={10} />,
        color: "emerald",
        render: (d) => {
          const rawStatus =
            typeof d.my_status === "string"
              ? d.my_status
              : d.my_status?.primary;

          if (!rawStatus) return "—";

          const statusMap: Record<string, string> = {
            to_sign: "На подпись",
            to_approve: "На согласовании",
            to_visa: "На визировании",
            to_execute: "На исполнении",
            to_register: "На регистрации",
            approved: "Согласовано",
            rejected: "Отклонено",
            pending: "В ожидании",
            signed: "Подписано",
            draft: "Черновик",
            done: "Завершено",
            cancelled: "Отменено",
            canceled: "Отменено",
            sent: "Отправлено",
            in_review: "На рассмотрении",
            on_approval: "На согласовании",
            revoked: "Отозвано",
            author: "Автор",
          };

          return statusMap[rawStatus] || rawStatus;
        },
      },
    ],
    getActions: (record, onMove) => {
      const isTrashed = type.includes("trashed");
      const isArchived = type.includes("archived");
      const isPinned = record.is_pinned;

      const items: MenuProps["items"] = [];

      if (!isArchived && !isInternal) {
        items.push({
          key: "archive",
          label: "В архив",
          icon: <Archive size={16} />,
          onClick: () =>
            archiveCorrespondence({ id: record.id, is_archived: true }),
        });
      }

      if (!isPinned && !isInternal) {
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
