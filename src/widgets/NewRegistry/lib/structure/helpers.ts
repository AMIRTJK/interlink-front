import {
  Inbox,
  Handshake,
  Signature,
  Send,
  LoaderCircle,
  Clock,
  X,
  FileText,
  Undo,
  MessageSquare,
  Eye,
  ClipboardList,
  ClipboardCheck,
  CheckCircle2,
} from "lucide-react";
import { FileSignatureIcon } from "../../ui/newRegistry/newRegistryModel";
import {
  ITimelineEvent,
  IGroupedStructureLetters,
  IStructureCountable,
} from "./types";

// Количество этапов структуры письма берём из самого реестра: бэкенд отдаёт
// structure_count (длина timeline из /structure) в каждом письме, поэтому до
// раскрытия аккордиона дополнительный запрос не нужен. Остальные ключи —
// поддержка старых ответов.
export const getStructureCount = (
  item?: IStructureCountable | null,
): number | undefined => {
  const value =
    item?.structure_count ??
    item?.events_count ??
    item?.timeline_count ??
    item?.history_count;

  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
};

export const estimateStructureCount = (
  item?: (IStructureCountable & { status?: string }) | null,
): number | undefined => {
  const count = getStructureCount(item);
  if (typeof count !== "number") return undefined;
  const isSentOrSigned =
    item?.status === "sent" ||
    item?.status === "signed" ||
    item?.status === "processed" ||
    item?.status === "registered";
  const hiddenCount = isSentOrSigned ? 2 : 1;
  return Math.max(1, count - hiddenCount);
};

export const getInitials = (fullName?: string | null): string => {
  if (!fullName) return "—";
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((p) => p && p !== ".");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return "—";
};

export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU") : "—";

export const formatTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export const formatDateTime = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dateStr = d.toLocaleDateString("ru-RU");
  const timeStr = d.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} ${timeStr}`;
};

export const getTargetUserName = (event: ITimelineEvent): string => {
  const d = event.data;
  if (!d) return "";

  if (typeof d.approver === "object" && d.approver?.full_name) {
    return d.approver.full_name;
  }
  if (typeof d.signer === "object" && d.signer?.full_name) {
    return d.signer.full_name;
  }
  if (typeof d.visor === "object" && d.visor?.full_name) {
    return d.visor.full_name;
  }
  if (typeof d.target_user === "object" && d.target_user?.full_name) {
    return d.target_user.full_name;
  }
  if (typeof d.invited_user === "object" && d.invited_user?.full_name) {
    return d.invited_user.full_name;
  }
  if (typeof d.user === "object" && d.user?.full_name) {
    return d.user.full_name;
  }
  if (typeof d.recipient === "object" && d.recipient?.full_name) {
    return d.recipient.full_name;
  }
  if (typeof d.recipient === "object" && d.recipient?.user?.full_name) {
    return d.recipient.user.full_name;
  }
  if (typeof d.target_name === "string" && d.target_name.trim()) {
    return d.target_name.trim();
  }
  if (typeof d.user_name === "string" && d.user_name.trim()) {
    return d.user_name.trim();
  }
  if (typeof d.user_full_name === "string" && d.user_full_name.trim()) {
    return d.user_full_name.trim();
  }
  if (typeof d.invited_user_name === "string" && d.invited_user_name.trim()) {
    return d.invited_user_name.trim();
  }
  if (typeof d.visor_name === "string" && d.visor_name.trim()) {
    return d.visor_name.trim();
  }
  if (typeof d.recipient_name === "string" && d.recipient_name.trim()) {
    return d.recipient_name.trim();
  }
  if (typeof d.full_name === "string" && d.full_name.trim()) {
    return d.full_name.trim();
  }
  if (typeof d.name === "string" && d.name.trim()) {
    return d.name.trim();
  }
  return "";
};

export const formatVersionLabel = (
  version?: string | number | null,
): string => {
  if (version === null || version === undefined) return "";
  const str = String(version).trim();
  if (!str) return "";
  if (/^версия\s*/i.test(str)) {
    return str.replace(/^версия\s*/i, "Версия ");
  }
  const cleaned = str.replace(/^v\.?\s*/i, "").trim();
  return cleaned ? `Версия ${cleaned}` : "Версия";
};

export const isInitialVersionEvent = (event: ITimelineEvent): boolean => {
  const isVersionCreated =
    event.type === "version_created" || event.action === "version_created";
  if (!isVersionCreated) return false;

  const raw = event.data?.version ?? event.data?.version_number;
  if (raw === null || raw === undefined || raw === "") return false;
  const str = String(raw).trim().toLowerCase().replace(/^v\.?\s*/i, "").trim();
  return str === "1" || str === "1.0" || str === "1.0.0" || /^1\.0+$/.test(str);
};

export const isDocumentSentEvent = (event: ITimelineEvent): boolean => {
  const type = event.type;
  const action = event.action;
  return (
    type === "document_sent" ||
    action === "sent" ||
    type === "internal_correspondence_sent" ||
    action === "internal_correspondence_sent" ||
    type === "internal_correspondence.sent" ||
    action === "internal_correspondence.sent"
  );
};

export const isVersionSelectedEvent = (event: ITimelineEvent): boolean => {
  const type = event.type;
  const action = event.action;
  return (
    type === "version_selected_for_signature" ||
    type === "version_selected" ||
    action === "version_selected_for_signing" ||
    action === "version_selected"
  );
};

export const filterTimelineEvents = (
  events?: ITimelineEvent[] | null,
): ITimelineEvent[] => {
  if (!Array.isArray(events)) return [];
  let hasBeenSent = false;
  return events.filter((e) => {
    // 1. Никогда не показываем авто-созданную начальную версию 1.0
    if (isInitialVersionEvent(e)) return false;

    // 2. После отправки документа выбор версии для подписи не имеет смысла и скрывается
    if (hasBeenSent && isVersionSelectedEvent(e)) return false;

    if (isDocumentSentEvent(e)) {
      hasBeenSent = true;
    }

    return true;
  });
};

export const getEventMeta = (event: ITimelineEvent) => {
  const type = event.type;
  const action = event.action;

  if (type === "document_created" || action === "created") {
    return {
      icon: Inbox,
      ring: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-500",
      badge: "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
      title: "Создал документ",
      badgeText: "Черновик",
    };
  }

  if (type === "version_created" || action === "version_created") {
    const rawVersion = event.data?.version ?? event.data?.version_number;
    const versionLabel = formatVersionLabel(rawVersion);
    return {
      icon: FileText,
      ring: "bg-slate-100 dark:bg-slate-700",
      iconColor: "text-slate-500",
      badge: "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300",
      title: versionLabel ? `Создал новую версию (${versionLabel})` : "Создал новую версию",
      badgeText: versionLabel || "Версия",
    };
  }

  if (
    type === "version_selected_for_signature" ||
    type === "version_selected" ||
    action === "version_selected_for_signing" ||
    action === "version_selected"
  ) {
    const rawVersion = event.data?.version ?? event.data?.version_number;
    const versionLabel = formatVersionLabel(rawVersion);
    return {
      icon: FileSignatureIcon,
      ring: "bg-yellow-100 dark:bg-yellow-900/40",
      iconColor: "text-yellow-600",
      badge: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
      title: versionLabel
        ? `Выбрал версию для подписи (${versionLabel})`
        : "Выбрал версию для подписи",
      badgeText: "Для подписи",
    };
  }

  if (type === "approval_invited" || action === "approval_invited") {
    const targetName = getTargetUserName(event);
    const title = targetName
      ? `Пригласил на согласование ${targetName}`
      : "Пригласил на согласование";
    return {
      icon: LoaderCircle,
      ring: "bg-orange-100 dark:bg-orange-900/40",
      iconColor: "text-orange-500",
      badge: "bg-orange-100 dark:bg-orange-900/40 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300",
      title,
      badgeText: "Согласование",
    };
  }

  if (type === "approval_result" || action === "approved" || action === "returned") {
    const isApproved = action === "approved";
    return {
      icon: isApproved ? Handshake : X,
      ring: isApproved ? "bg-blue-100 dark:bg-blue-900/40" : "bg-rose-100 dark:bg-rose-900/40",
      iconColor: isApproved ? "text-blue-500" : "text-rose-500",
      badge: isApproved
        ? "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
        : "bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
      title: isApproved ? "Согласовал документ" : "Вернул документ",
      badgeText: isApproved ? "Согласовано" : "Возвращено",
    };
  }

  if (type === "signer_invited" || action === "signer_invited") {
    const targetName = getTargetUserName(event);
    const title = targetName
      ? `Пригласил на подписание ${targetName}`
      : "Пригласил на подписание";
    return {
      icon: FileSignatureIcon,
      ring: "bg-yellow-100 dark:bg-yellow-900/40",
      iconColor: "text-yellow-600",
      badge: "bg-yellow-100 dark:bg-yellow-900/40 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300",
      title,
      badgeText: "На подпись",
    };
  }

  if (type === "document_signed" || action === "signed") {
    return {
      icon: Signature,
      ring: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-500",
      badge: "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
      title: "Подписал документ",
      badgeText: "Подписан",
    };
  }

  if (
    type === "signature_declined" ||
    action === "declined" ||
    event.data?.status === "declined"
  ) {
    return {
      icon: X,
      ring: "bg-rose-100 dark:bg-rose-900/40",
      iconColor: "text-rose-500",
      badge: "bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
      title: "Отклонил подпись",
      badgeText: "Отклонено",
    };
  }

  if (
    type === "signature_revoked" ||
    action === "revoked" ||
    event.data?.status === "revoked"
  ) {
    return {
      icon: Undo,
      ring: "bg-amber-100 dark:bg-amber-900/40",
      iconColor: "text-amber-500",
      badge: "bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
      title: "Отменил подпись",
      badgeText: "Отменено",
    };
  }

  if (
    type === "visor_invited" ||
    action === "visor_invited" ||
    type === "internal_correspondence.visor_invited" ||
    action === "internal_correspondence.visor_invited" ||
    type === "internal_correspondence_visor_invited" ||
    action === "internal_correspondence_visor_invited"
  ) {
    const targetName = getTargetUserName(event);
    const title = targetName
      ? `Пригласил визирующего ${targetName}`
      : "Пригласил визирующего";
    return {
      icon: Eye,
      ring: "bg-violet-100 dark:bg-violet-900/40",
      iconColor: "text-violet-500",
      badge:
        "bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300",
      title,
      badgeText: "Визирующий",
    };
  }

  if (type === "resolution_created" || action === "resolution_created") {
    return {
      icon: FileText,
      ring: "bg-indigo-100 dark:bg-indigo-900/40",
      iconColor: "text-indigo-500",
      badge:
        "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300",
      title: "Создал резолюцию",
      badgeText: "Резолюция",
    };
  }

  if (
    type === "assignment_created" ||
    action === "assignment_created" ||
    type === "internal_correspondence.assignment_created" ||
    action === "internal_correspondence.assignment_created" ||
    type === "internal_correspondence_assignment_created" ||
    action === "internal_correspondence_assignment_created"
  ) {
    const targetName = getTargetUserName(event);
    const title = targetName
      ? `Создал поручение для ${targetName}`
      : "Создал поручение";
    return {
      icon: ClipboardList,
      ring: "bg-indigo-100 dark:bg-indigo-900/40",
      iconColor: "text-indigo-500",
      badge:
        "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300",
      title,
      badgeText: "Поручение",
    };
  }

  if (
    type === "assignment_submitted" ||
    action === "assignment_submitted" ||
    type === "internal_correspondence_assignment_submitted" ||
    action === "internal_correspondence_assignment_submitted"
  ) {
    return {
      icon: ClipboardCheck,
      ring: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-500",
      badge:
        "bg-blue-100 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
      title: "Исполнил поручение",
      badgeText: "Исполнено",
    };
  }

  if (
    type === "assignment_reviewed" ||
    action === "assignment_reviewed" ||
    type === "internal_correspondence_assignment_reviewed" ||
    action === "internal_correspondence_assignment_reviewed"
  ) {
    return {
      icon: CheckCircle2,
      ring: "bg-emerald-100 dark:bg-emerald-900/40",
      iconColor: "text-emerald-500",
      badge:
        "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
      title: "Проверил поручение",
      badgeText: "Проверено",
    };
  }

  if (type === "comment_created" || action === "comment_created") {
    return {
      icon: MessageSquare,
      ring: "bg-sky-100 dark:bg-sky-900/40",
      iconColor: "text-sky-500",
      badge:
        "bg-sky-100 dark:bg-sky-900/40 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300",
      title: "Оставил комментарий",
      badgeText: "Комментарий",
    };
  }

  if (type === "document_sent" || action === "sent") {
    return {
      icon: Send,
      ring: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-500",
      badge: "bg-green-100 dark:bg-green-900/40 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
      title: "Отправил документ",
      badgeText: "Отправлено",
    };
  }

  return {
    icon: Clock,
    ring: "bg-slate-100 dark:bg-slate-700",
    iconColor: "text-slate-400",
    badge: "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300",
    title: action || type,
    badgeText: action || "Событие",
  };
};

export const groupLettersByDate = (documents: any[]): IGroupedStructureLetters[] => {
  const map: Record<string, any[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const sortedDocs = Array.isArray(documents)
    ? [...documents].sort((a, b) => (Number(b?.id) || 0) - (Number(a?.id) || 0))
    : [];

  sortedDocs.forEach((doc) => {
    const d = doc.created_at ? new Date(doc.created_at) : new Date();
    const dateStr = d.toDateString();
    let label = d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });

    if (dateStr === today) label = "Сегодня";
    else if (dateStr === yesterday) label = "Вчера";

    if (!map[label]) map[label] = [];
    map[label].push(doc);
  });

  return Object.keys(map).map((label) => ({ label, items: map[label] }));
};

export const pluralizeDocuments = (count: number): string => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return "писем";
  if (mod10 === 1) return "письмо";
  if (mod10 >= 2 && mod10 <= 4) return "письма";
  return "писем";
};
