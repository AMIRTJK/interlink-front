import { UserX, MessageSquareX, CalendarX, GitBranch, Layers } from "lucide-react";
import { RejectionViewer } from "@widgets/NewRegistry/ui";
import {
  REJECTION_TYPE_LABELS,
  type IRejection,
  type TRejectionType,
} from "../../model";
import { BadgeDefinition, FieldDefinition } from "../types";

const rejectionOf = (d: any): IRejection | undefined =>
  d?.rejection || (Array.isArray(d?.rejections) ? d.rejections[0] : undefined);

const rejectionsCountOf = (d: any): number => {
  if (typeof d?.rejections_count === "number") return d.rejections_count;
  return Array.isArray(d?.rejections) ? d.rejections.length : 0;
};

/**
 * Поля реестра «Отменено»: вместо отправителя и получателей показываем, кто и
 * почему отклонил письмо. Данные приходят в объектах `rejection` / `rejections`.
 */
export const REJECTED_FIELDS: {
  primary: FieldDefinition;
  secondary: FieldDefinition;
  badges: BadgeDefinition[];
} = {
  primary: {
    label: "Отклонил",
    icon: <UserX size={12} />,
    render: (d) => rejectionOf(d)?.user?.full_name || "Не указано",
  },
  secondary: {
    label: "Причина",
    icon: <MessageSquareX size={12} />,
    render: (d) => (
      <RejectionViewer
        rejection={rejectionOf(d)}
        rejections={d?.rejections}
      />
    ),
  },
  badges: [
    {
      label: "Дата откл.",
      icon: <CalendarX size={10} />,
      color: "rose",
      render: (d) => {
        const rejectedAt = rejectionOf(d)?.rejected_at;
        return rejectedAt
          ? new Date(rejectedAt).toLocaleDateString("ru-RU")
          : "—";
      },
    },
    {
      label: "Кто отклонил",
      icon: <UserX size={10} />,
      color: "purple",
      render: (d) => {
        const type = rejectionOf(d)?.type as TRejectionType | undefined;
        return type ? REJECTION_TYPE_LABELS[type] : "—";
      },
    },
    {
      label: "Версия",
      icon: <GitBranch size={10} />,
      color: "blue",
      render: (d) => rejectionOf(d)?.version || "—",
    },
    {
      label: "Отклонений",
      icon: <Layers size={10} />,
      color: "amber",
      render: (d) => rejectionsCountOf(d) || "—",
    },
  ],
};
