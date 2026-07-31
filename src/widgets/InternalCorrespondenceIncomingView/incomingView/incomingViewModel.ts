import React from "react";
import { Eye, CornerUpLeft, Forward, ShieldCheck, ClipboardList } from "lucide-react";

export type TActionId = "seen" | "reply" | "forward" | "visor" | "task";

export interface Recipient {
  id: number;
  type: "to" | "cc";
  user?: {
    id: number;
    full_name: string;
  };
}

export interface ActionUser {
  id?: string | number;
  user_id?: string | number;
  correspondence_id?: string | number;
  link_type?: "reply" | "forward";
  status?: string;
  action_at?: string;
  acknowledged_at?: string;
  user?: {
    id?: string | number;
    full_name?: string;
    position?: string;
  };
}

export interface RegistryItem {
  id: string | number;
  reg_prefix?: string;
  my_prefix?: string;
  reg_number?: string;
  sender_name?: string | null;
  sent_at?: string;
  subject?: string;
  body?: string;
  status: string;
  is_unread?: boolean;
  recipients?: Recipient[];
  creator?: {
    id?: string | number;
    full_name: string;
    position?: string;
    department?: string;
  };
  priority?: string;
  acknowledged_users?: ActionUser[];
  replied_users?: ActionUser[];
  forwarded_users?: ActionUser[];
  reply_count?: number;
  forward_count?: number;
  attachments?: any[];
  visors?: any[];
  is_visor?: boolean;
  can_invite_visor?: boolean;
  can_create_assignment?: boolean;
}

export interface InternalCorrespondenceIncomingViewProps {
  item: RegistryItem;
  onBack: () => void;
}

export const inboxStatusStyle: Record<string, string> = {
  "на резолюции": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "на исполнении": "bg-amber-50 text-amber-700 border-amber-100",
  "на согласовании": "bg-blue-50 text-blue-700 border-blue-100",
  "на подпись": "bg-purple-50 text-purple-700 border-purple-100",
  завершено: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-100",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  to_register: "bg-emerald-50 text-emerald-700 border-emerald-100",
  to_visa: "bg-emerald-50 text-emerald-700 border-emerald-100",
  to_execute: "bg-amber-50 text-amber-700 border-amber-100",
  to_approve: "bg-blue-50 text-blue-700 border-blue-100",
  to_sign: "bg-purple-50 text-purple-700 border-purple-100",
  done: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-100",
  approved: "bg-blue-50 text-blue-700 border-blue-100",
  signed: "bg-purple-50 text-purple-700 border-purple-100",
};

export const statusTranslations: Record<string, string> = {
  draft: "Черновик",
  to_register: "Регистрация",
  to_visa: "На резолюции",
  to_execute: "На исполнении",
  to_approve: "На согласовании",
  to_sign: "На подпись",
  done: "Завершено",
  cancelled: "Отклонено",
  sent: "Отправлено",
  approved: "Согласовано",
  signed: "Подписано",
};

export const priorityConfig: Record<string, { label: string; className: string }> = {
  high: {
    label: "Высокая",
    className: "bg-rose-50! text-rose-700! border-rose-100!",
  },
  middle: {
    label: "Средняя",
    className: "bg-amber-50! text-amber-700! border-amber-100!",
  },
  medium: {
    label: "Средняя",
    className: "bg-amber-50! text-amber-700! border-amber-100!",
  },
  normal: {
    label: "Средняя",
    className: "bg-amber-50! text-amber-700! border-amber-100!",
  },
  low: {
    label: "Низкая важность",
    className: "bg-slate-50! text-slate-600! border-slate-200!",
  },
};

export const ACTION_MENU_ITEMS: {
  id: TActionId;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "seen", label: "Ознакомлен", icon: Eye },
  { id: "reply", label: "Ответить", icon: CornerUpLeft },
  { id: "forward", label: "Перенаправить", icon: Forward },
  { id: "visor", label: "Пригласить визирующего", icon: ShieldCheck },
  { id: "task", label: "Поручение", icon: ClipboardList },
];

export const initialsOf = (fullName?: string) => {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
  ).toUpperCase();
};
