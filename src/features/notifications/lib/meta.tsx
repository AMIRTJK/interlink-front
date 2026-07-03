import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileSignature,
  Mail,
  PenLine,
  type LucideIcon,
} from "lucide-react";

interface INotificationMeta {
  Icon: LucideIcon;
  /** Цвет иконки. */
  iconClass: string;
  /** Фон кружка иконки (свет/тёмная тема). */
  circleClass: string;
}

/** Палитра акцентов со светлыми и тёмными вариантами фона кружка. */
const ACCENTS = {
  rose: { iconClass: "text-rose-500", circleClass: "bg-rose-50 dark:bg-rose-500/15" },
  indigo: { iconClass: "text-indigo-500", circleClass: "bg-indigo-50 dark:bg-indigo-500/15" },
  blue: { iconClass: "text-blue-500", circleClass: "bg-blue-50 dark:bg-blue-500/15" },
  violet: { iconClass: "text-violet-500", circleClass: "bg-violet-50 dark:bg-violet-500/15" },
  amber: { iconClass: "text-amber-500", circleClass: "bg-amber-50 dark:bg-amber-500/15" },
  emerald: { iconClass: "text-emerald-500", circleClass: "bg-emerald-50 dark:bg-emerald-500/15" },
  sky: { iconClass: "text-sky-500", circleClass: "bg-sky-50 dark:bg-sky-500/15" },
  zinc: { iconClass: "text-zinc-500 dark:text-zinc-400", circleClass: "bg-zinc-100 dark:bg-zinc-700/50" },
} as const;

type Accent = keyof typeof ACCENTS;

const TYPE_MAP: Record<string, { Icon: LucideIcon; accent: Accent }> = {
  personal_task_created: { Icon: ClipboardList, accent: "indigo" },
  personal_task_status_changed: { Icon: ClipboardCheck, accent: "blue" },
  personal_task_overdue: { Icon: AlertTriangle, accent: "rose" },
  task_assigned: { Icon: ClipboardList, accent: "indigo" },
  task_status_changed: { Icon: ClipboardCheck, accent: "blue" },
  task_overdue: { Icon: AlertTriangle, accent: "rose" },
  event_invited: { Icon: CalendarPlus, accent: "violet" },
  event_updated: { Icon: CalendarClock, accent: "amber" },
  event_status_changed: { Icon: CalendarCheck, accent: "emerald" },
  event_reminder: { Icon: CalendarClock, accent: "amber" },
  internal_correspondence_approval_invited: { Icon: Mail, accent: "sky" },
  internal_correspondence_approval_status_changed: { Icon: CheckCircle2, accent: "emerald" },
  internal_correspondence_signer_invited: { Icon: PenLine, accent: "violet" },
  internal_correspondence_signed: { Icon: FileSignature, accent: "emerald" },
};

/** Возвращает иконку и классы акцента для типа уведомления. */
export const getNotificationMeta = (type: string): INotificationMeta => {
  const entry = TYPE_MAP[type] ?? { Icon: Bell, accent: "zinc" as Accent };
  return {
    Icon: entry.Icon,
    iconClass: ACCENTS[entry.accent].iconClass,
    circleClass: ACCENTS[entry.accent].circleClass,
  };
};
