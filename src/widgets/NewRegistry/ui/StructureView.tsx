import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ChevronDown,
  Pin,
  User,
  Inbox,
  GitBranch,
  PenLine,
  CircleCheckBig,
  Check,
  X,
  Eye,
  Clock,
} from "lucide-react";
import { cn } from "@shared/lib";
import { EmptyState } from "@shared/ui";
import {
  buildLetterMovement,
  groupLettersByDate,
  pluralizeDocuments,
  getInitials,
  type LetterDirection,
  type MovementEvent,
  type MovementKind,
} from "../lib/structure";

// ─── Справочники отображения ───────────────────────────────────────────────

// Иконка + цвета для каждого типа события в таймлайне.
const KIND_META: Record<
  MovementKind,
  { icon: React.ElementType; ring: string; icon_color: string; badge: string }
> = {
  created: {
    icon: Inbox,
    ring: "bg-blue-100",
    icon_color: "text-blue-500",
    badge: "bg-blue-100 border-blue-200 text-blue-700",
  },
  to_approve: {
    icon: GitBranch,
    ring: "bg-violet-100",
    icon_color: "text-violet-500",
    badge: "bg-violet-100 border-violet-200 text-violet-700",
  },
  pending_approve: {
    icon: Clock,
    ring: "bg-slate-100 dark:bg-slate-700",
    icon_color: "text-slate-400 dark:text-slate-400",
    badge: "bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300",
  },
  approved: {
    icon: Check,
    ring: "bg-emerald-100",
    icon_color: "text-emerald-500",
    badge: "bg-emerald-100 border-emerald-200 text-emerald-700",
  },
  rejected: {
    icon: X,
    ring: "bg-rose-100",
    icon_color: "text-rose-500",
    badge: "bg-rose-100 border-rose-200 text-rose-700",
  },
  to_sign: {
    icon: GitBranch,
    ring: "bg-violet-100",
    icon_color: "text-violet-500",
    badge: "bg-violet-100 border-violet-200 text-violet-700",
  },
  pending_sign: {
    icon: Clock,
    ring: "bg-amber-100",
    icon_color: "text-amber-500",
    badge: "bg-amber-100 border-amber-200 text-amber-700",
  },
  signed: {
    icon: PenLine,
    ring: "bg-purple-100",
    icon_color: "text-purple-500",
    badge: "bg-purple-100 border-purple-200 text-purple-700",
  },
  sent: {
    icon: CircleCheckBig,
    ring: "bg-emerald-100",
    icon_color: "text-emerald-500",
    badge: "bg-emerald-100 border-emerald-200 text-emerald-700",
  },
  read: {
    icon: Eye,
    ring: "bg-blue-100",
    icon_color: "text-blue-500",
    badge: "bg-blue-100 border-blue-200 text-blue-700",
  },
};

// Статус-пилюля письма (item.status).
const STATUS_STYLE: Record<string, { label: string; className: string; dot: string }> =
  {
    draft: {
      label: "Черновик",
      className: "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300",
      dot: "bg-slate-400",
    },
    analysis: {
      label: "Анализ",
      className: "bg-blue-50 border-blue-100 text-blue-700",
      dot: "bg-blue-400",
    },
    to_approve: {
      label: "Согласование",
      className: "bg-violet-50 border-violet-100 text-violet-700",
      dot: "bg-violet-400",
    },
    approved: {
      label: "Согласован",
      className: "bg-blue-50 border-blue-100 text-blue-700",
      dot: "bg-blue-400",
    },
    to_sign: {
      label: "На подпись",
      className: "bg-purple-50 border-purple-100 text-purple-700",
      dot: "bg-purple-400",
    },
    signed: {
      label: "Подписан",
      className: "bg-purple-50 border-purple-100 text-purple-700",
      dot: "bg-purple-400",
    },
    sent: {
      label: "Отправлено",
      className: "bg-emerald-50 border-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    },
  };

// Читаемые названия типов документа (значение реальное — маппится только ярлык).
const DOC_TYPE_LABELS: Record<string, string> = {
  darkhost: "Дархост",
  ariza: "Ариза",
  guzorish: "Гузориш",
};

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ru-RU") : "—";

const formatTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// ─── Одно событие в таймлайне ──────────────────────────────────────────────

const EventRow = ({
  event,
  isLast,
}: {
  event: MovementEvent;
  isLast: boolean;
}) => {
  const meta = KIND_META[event.kind];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3 group/event", !isLast && "mb-3")}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 -ml-8 ring-2 ring-white relative z-10",
          meta.ring,
        )}
      >
        <Icon size={12} className={meta.icon_color} />
      </div>
      <div className="flex-1 min-w-0 pb-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0",
                event.actor.isSystem
                  ? "bg-violet-100 text-violet-700"
                  : "bg-blue-100 text-blue-700",
              )}
            >
              {event.actor.initials}
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
              {event.actor.fullName}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-400">·</span>
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full border",
                meta.badge,
              )}
            >
              {event.statusLabel}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-400 flex-shrink-0 mt-0.5 font-medium">
            {formatTime(event.at)}
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
          {event.title}
        </p>
        {event.note && (
          <div className="mt-1.5 pl-3 border-l-2 border-amber-200">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
              {event.note}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Карточка одного письма (шапка + аккордеон с таймлайном) ───────────────

const LetterActivityCard = ({
  item,
  direction,
  index,
  onClick,
}: {
  item: any;
  direction: LetterDirection;
  index: number;
  onClick: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const events = buildLetterMovement(item, direction);
  const status = STATUS_STYLE[item.status];
  const docTypeLabel = item.document_type
    ? DOC_TYPE_LABELS[item.document_type] || item.document_type
    : null;

  const creatorName = item.creator?.full_name || "—";
  const primaryRecipient =
    item.recipients?.find((r: any) => r.type === "to")?.user?.full_name ||
    item.recipients?.[0]?.user?.full_name;
  const isUnread = item.is_unread;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25 }}
      className="group"
    >
      <div className="rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-blue-200">
        <div className="flex items-start gap-3 px-4 py-3.5">
          {/* Индикатор непрочитанного */}
          <span className="mt-1 w-5 h-5 flex items-center justify-center flex-shrink-0">
            {isUnread ? (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            ) : (
              <span className="w-2 h-2 rounded-full border-2 border-slate-200 dark:border-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </span>

          {/* Аватар автора */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {getInitials(creatorName)}
            </div>
          </div>

          {/* Основной блок (кликабельный — открывает документ) */}
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={onClick}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-sm text-slate-900 dark:text-slate-100",
                    isUnread ? "font-bold" : "font-semibold text-slate-700 dark:text-slate-200",
                  )}
                >
                  {creatorName}
                </span>
                {item.is_pinned && (
                  <Pin
                    size={11}
                    className="text-blue-500 fill-blue-500 flex-shrink-0"
                  />
                )}
                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded">
                  {item.reg_number || "Без номера"}
                </span>
                {status && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                      status.className,
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full flex-shrink-0",
                        status.dot,
                      )}
                    />
                    <span>{status.label}</span>
                  </span>
                )}
                {docTypeLabel && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                    {docTypeLabel}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-400 flex-shrink-0">
                {formatDate(item.created_at)}
              </span>
            </div>
            <p
              className={cn(
                "text-sm leading-snug",
                isUnread
                  ? "font-medium text-slate-800 dark:text-slate-200"
                  : "text-slate-600 dark:text-slate-300",
              )}
            >
              {item.subject || "Без темы"}
            </p>
            {primaryRecipient && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <User size={11} className="text-slate-400 dark:text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {primaryRecipient}
                </span>
              </div>
            )}
          </div>

          {/* Кнопка-аккордеон с индикатором количества событий */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (events.length > 0) setOpen((v) => !v);
            }}
            disabled={events.length === 0}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0 mt-0.5 cursor-pointer",
              events.length === 0
                ? "text-slate-300 dark:text-slate-600 cursor-default"
                : open
                  ? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  : "text-slate-400 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200",
            )}
            aria-label="Показать движение письма"
          >
            <Activity size={12} />
            <span>{events.length}</span>
            <motion.div animate={{ rotate: open ? 180 : 0 }}>
              <ChevronDown size={12} />
            </motion.div>
          </button>
        </div>

        {/* Раскрываемый таймлайн движения */}
        <AnimatePresence initial={false}>
          {open && events.length > 0 && (
            <motion.div
              key="timeline"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                <div className="relative pl-8">
                  <div className="absolute left-[14px] top-0 bottom-4 w-px bg-slate-100 dark:bg-slate-700" />
                  {events.map((event, i) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      isLast={i === events.length - 1}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ─── Вью «Структура»: письма, сгруппированные по датам ─────────────────────

interface StructureViewProps {
  documents: any[];
  direction: LetterDirection;
  onCardClick: (id: number) => void;
}

export const StructureView = ({
  documents,
  direction,
  onCardClick,
}: StructureViewProps) => {
  if (!documents || documents.length === 0) {
    return <EmptyState />;
  }

  const groups = groupLettersByDate(documents);

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-[0.12em]">
                {group.label}
              </span>
              <span className="text-[11px] font-semibold text-slate-300 dark:text-slate-600">·</span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                {group.items.length} {pluralizeDocuments(group.items.length)}
              </span>
            </div>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
          </div>

          <div className="space-y-4">
            {group.items.map((item, index) => (
              <LetterActivityCard
                key={item.id}
                item={item}
                direction={direction}
                index={index}
                onClick={() => onCardClick(item.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
