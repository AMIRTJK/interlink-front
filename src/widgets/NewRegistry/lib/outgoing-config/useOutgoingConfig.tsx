import React from "react";
import { User, CheckCheck, FileText, Loader, Trash2 } from "lucide-react";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib";
import { RegistryConfig } from "../types";
import { getOutgoingFilters } from "../filters.config";
import { RecipientsViewer } from "@widgets/NewRegistry/ui";

export const useOutgoingConfig = (): RegistryConfig => {
  // --- MUTATIONS (Можно дублировать логику или вынести в отдельный хук useCorrespondenceActions) ---
  const { mutate: deleteCorrespondence } = useMutationQuery({
    url: (data) =>
      ApiRoutes.DELETE_CORRESPONDENCE.replace(":id", String(data.id)),
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
    getActions: (record) => {
      // Для исходящих логика может отличаться
      return [
        {
          key: "delete",
          label: "Удалить черновик",
          danger: true,
          icon: <Trash2 size={16} />,
          onClick: () => deleteCorrespondence({ id: record.id }),
        },
      ];
    },
    filters: getOutgoingFilters(),
  };
};
