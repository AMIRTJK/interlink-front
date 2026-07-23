import {
  Inbox,
  GitBranch,
  PenLine,
  Clock,
  Check,
  X,
  FileText,
  FileCheck,
  UserPlus,
  Send,
  Undo,
} from "lucide-react";
import { ITimelineEvent, IGroupedStructureLetters } from "./types";

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
    const versionNum = event.data?.version ? ` v${event.data.version}` : "";
    return {
      icon: FileText,
      ring: "bg-slate-100 dark:bg-slate-700",
      iconColor: "text-slate-500",
      badge: "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300",
      title: `Создал новую версию${versionNum}`.trim(),
      badgeText: versionNum.trim() || "Версия",
    };
  }

  if (
    type === "version_selected_for_signature" ||
    type === "version_selected" ||
    action === "version_selected_for_signing" ||
    action === "version_selected"
  ) {
    const versionNum = event.data?.version ? ` (v${event.data.version})` : "";
    return {
      icon: FileCheck,
      ring: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-500",
      badge: "bg-purple-100 dark:bg-purple-900/40 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300",
      title: `Выбрал версию для подписи${versionNum}`,
      badgeText: "Для подписи",
    };
  }

  if (type === "approval_invited" || action === "approval_invited") {
    return {
      icon: UserPlus,
      ring: "bg-violet-100 dark:bg-violet-900/40",
      iconColor: "text-violet-500",
      badge: "bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300",
      title: "Отправил на согласование",
      badgeText: "Согласование",
    };
  }

  if (type === "approval_result" || action === "approved" || action === "returned") {
    const isApproved = action === "approved";
    return {
      icon: isApproved ? Check : X,
      ring: isApproved ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-rose-100 dark:bg-rose-900/40",
      iconColor: isApproved ? "text-emerald-500" : "text-rose-500",
      badge: isApproved
        ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
        : "bg-rose-100 dark:bg-rose-900/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300",
      title: isApproved ? "Согласовал документ" : "Вернул документ",
      badgeText: isApproved ? "Согласовано" : "Возвращено",
    };
  }

  if (type === "signer_invited" || action === "signer_invited") {
    return {
      icon: GitBranch,
      ring: "bg-amber-100 dark:bg-amber-900/40",
      iconColor: "text-amber-500",
      badge: "bg-amber-100 dark:bg-amber-900/40 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300",
      title: "Направил на подпись",
      badgeText: "На подпись",
    };
  }

  if (type === "document_signed" || action === "signed") {
    return {
      icon: PenLine,
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

  if (type === "document_sent" || action === "sent") {
    return {
      icon: Send,
      ring: "bg-emerald-100 dark:bg-emerald-900/40",
      iconColor: "text-emerald-500",
      badge: "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
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

  documents.forEach((doc) => {
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
