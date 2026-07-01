import React from "react";
import { Calendar, FileText } from "lucide-react";
import { cn } from "@shared/lib";

interface IProps {
  sender: string;
  date: string;
  status: string;
  inboundNumber: string;
  subject: string;
}

const STATUS_STYLE: Record<string, string> = {
  "на резолюции": "bg-emerald-50 text-emerald-700 border-emerald-100",
  "на исполнении": "bg-amber-50 text-amber-700 border-amber-100",
  "на согласовании": "bg-blue-50 text-blue-700 border-blue-100",
  "на подпись": "bg-purple-50 text-purple-700 border-purple-100",
  завершено: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-100",
};

const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export const OriginalLetterDetails = ({
  sender,
  date,
  status,
  inboundNumber,
  subject,
}: IProps) => {
  const initials = getInitials(sender);
  const statusClass = STATUS_STYLE[status] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="w-[300px] h-[480px] shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4 font-sans!">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <FileText size={16} className="text-amber-500" />
        <span className="text-sm font-bold text-slate-800">
          Детали документа
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Отправитель
        </span>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 leading-tight truncate">
              {sender}
            </p>
            <p className="text-[10px] text-slate-400">
              Автор документа
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Входящий номер
        </span>
        <span className="font-mono text-xs bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 w-fit">
          {inboundNumber}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Дата отправки
        </span>
        <div className="flex items-center gap-1.5 text-slate-700">
          <Calendar size={13} className="text-slate-400" />
          <span className="text-xs font-semibold">
            {date}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Тема письма
        </span>
        <p className="text-xs font-medium text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {subject || "Без темы"}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Текущий статус
        </span>
        <span className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border w-fit capitalize",
          statusClass
        )}>
          {status}
        </span>
      </div>
    </div>
  );
};
