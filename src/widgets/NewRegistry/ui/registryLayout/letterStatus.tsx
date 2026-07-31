import {
  CornerUpLeft,
  Forward,
  Clock,
  FileEdit,
  CheckCheck,
  XCircle,
} from "lucide-react";

export const getLinkTypeInfo = (data: any, isIncoming?: boolean) => {
  if (isIncoming) return null;
  const linkType = data?.link_type || data?.relation_type;
  if (linkType === "reply") {
    return {
      isReply: true,
      label: data?.relation_label || "Ответное письмо",
      borderColor: "border-l-4! border-l-emerald-500!",
      badgeClass:
        "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
      icon: <CornerUpLeft size={11} className="flex-shrink-0" />,
    };
  }
  if (linkType === "forward") {
    return {
      isForward: true,
      label: data?.relation_label || "Пересланное письмо",
      borderColor: "border-l-4! border-l-purple-500!",
      badgeClass:
        "bg-purple-50 text-purple-700 border border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800",
      icon: <Forward size={11} className="flex-shrink-0" />,
    };
  }
  return null;
};

export const getLetterStatusBadge = (
  doc: any,
  isIncoming?: boolean,
): { label: string; color: string } => {
  if (isIncoming === true) {
    const assignments = Array.isArray(doc?.assignments)
      ? doc.assignments
      : Array.isArray(doc?.assignment_list)
      ? doc.assignment_list
      : doc?.assignment
      ? [doc.assignment]
      : [];

    if (assignments.length > 0) {
      const activeAssign = assignments[assignments.length - 1];
      const assignStatus = (activeAssign?.status || "").toString().toLowerCase();

      if (
        assignStatus === "pending" ||
        assignStatus === "in_progress" ||
        assignStatus === "in-progress"
      ) {
        return { label: "В процессе исполнения", color: "amber" };
      }
      if (
        assignStatus === "submitted" ||
        assignStatus === "review" ||
        assignStatus === "to_review"
      ) {
        return { label: "На проверке", color: "purple" };
      }
      if (assignStatus === "done" || assignStatus === "completed") {
        return { label: "Завершено", color: "emerald" };
      }
      if (assignStatus === "returned") {
        return { label: "На доработке", color: "rose" };
      }
      return { label: "В процессе исполнения", color: "amber" };
    }

    return { label: "Без поручения", color: "blue" };
  }

  const isSent =
    doc?.status === "sent" ||
    doc?.status === "sent_out" ||
    doc?.status === "отправлено";

  return isSent
    ? { label: "Отправлено", color: "emerald" }
    : { label: "Черновик", color: "blue" };
};

export const getEffectiveStatusData = (
  doc: any,
  statusConfig: Record<string, any>,
  isIncoming?: boolean,
) => {
  if (!doc || !statusConfig) return statusConfig?.default || {};

  if (isIncoming === true) {
    const badge = getLetterStatusBadge(doc, true);

    if (badge.label === "В процессе исполнения") {
      return (
        statusConfig["in-progress"] ||
        statusConfig.in_progress || {
          label: "В процессе исполнения",
          gradient: "from-amber-500 to-amber-600",
          icon: <Clock size={14} />,
        }
      );
    }
    if (badge.label === "На проверке") {
      return (
        statusConfig.submitted || {
          label: "На проверке",
          gradient: "from-purple-500 to-purple-600",
          icon: <FileEdit size={14} />,
        }
      );
    }
    if (badge.label === "Завершено") {
      return (
        statusConfig.completed ||
        statusConfig.done || {
          label: "Завершено",
          gradient: "from-emerald-500 to-emerald-600",
          icon: <CheckCheck size={14} />,
        }
      );
    }
    if (badge.label === "На доработке") {
      return (
        statusConfig.returned || {
          label: "На доработке",
          gradient: "from-rose-500 to-rose-600",
          icon: <XCircle size={14} />,
        }
      );
    }
    return (
      statusConfig.no_assignment ||
      statusConfig.analysis || {
        label: "Без поручения",
        gradient: "from-blue-500 to-blue-600",
        icon: <Clock size={14} />,
      }
    );
  }

  const letterStatusRaw = (
    doc.letter_status ||
    doc.status ||
    doc.status_code ||
    ""
  )
    .toString()
    .toLowerCase();

  const isSent =
    letterStatusRaw === "sent" ||
    letterStatusRaw === "отправлено" ||
    letterStatusRaw === "sent_out";

  if (isSent) {
    return statusConfig.sent || statusConfig.default || {};
  }

  const rawMyStatus = (
    typeof doc.my_status === "string"
      ? doc.my_status
      : doc.my_status?.key ||
        doc.my_status?.primary ||
        doc.my_status?.status ||
        doc.my_status_code ||
        doc.user_status ||
        ""
  )
    .toString()
    .toLowerCase();

  let effectiveKey = "draft";

  if (
    rawMyStatus.includes("author") ||
    rawMyStatus.includes("автор") ||
    rawMyStatus.includes("draft") ||
    rawMyStatus.includes("черновик")
  ) {
    effectiveKey = "draft";
  } else if (
    rawMyStatus.includes("approve") ||
    rawMyStatus.includes("согласован")
  ) {
    if (
      rawMyStatus === "approved" ||
      rawMyStatus === "согласован" ||
      rawMyStatus === "согласовано"
    ) {
      effectiveKey = "approved";
    } else {
      effectiveKey = "to_approve";
    }
  } else if (rawMyStatus.includes("sign") || rawMyStatus.includes("подпис")) {
    if (
      rawMyStatus === "signed" ||
      rawMyStatus === "подписан" ||
      rawMyStatus === "подписано"
    ) {
      effectiveKey = "signed";
    } else {
      effectiveKey = "to_sign";
    }
  } else if (rawMyStatus && statusConfig[rawMyStatus]) {
    effectiveKey = rawMyStatus;
  } else if (letterStatusRaw && statusConfig[letterStatusRaw]) {
    effectiveKey = letterStatusRaw;
  }

  return (
    statusConfig[effectiveKey] ||
    statusConfig.draft ||
    statusConfig.default ||
    {}
  );
};
