import React, { useState } from "react";
import { ScrollText, FileText, ClipboardList, Shield } from "lucide-react";
import { IEmployee, initials, statusMeta } from "./model";

export const Avatar = ({
  e,
  size = 40,
  rounded = "rounded-full",
}: {
  e: IEmployee;
  size?: number;
  rounded?: string;
}) => {
  const [hasError, setHasError] = useState(false);

  return e.photo && !hasError ? (
    <img
      src={e.photo}
      alt={e.fullName}
      className={`${rounded} object-cover flex-shrink-0`}
      style={{ width: size, height: size }}
      onError={() => {
        setHasError(true);
      }}
    />
  ) : (
    <div
      className={`${rounded} bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-xs`}
      style={{ width: size, height: size }}
    >
      {initials(e.fullName)}
    </div>
  );
};

export const StatusChip = ({ status }: { status: string }) => {
  const m = statusMeta(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${m.chip}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

export const Field = ({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; accent?: boolean;
}) => (
  <div
    className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${
      accent ? "border bg-indigo-50 border-indigo-100" : "bg-gray-50 hover:bg-indigo-50/60"
    }`}
  >
    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
      <span className={accent ? "text-indigo-500" : "text-indigo-400"}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className={`text-[11px] font-medium uppercase tracking-wide ${accent ? "text-indigo-400" : "text-gray-500"}`}>
        {label}
      </p>
      <p className={`text-sm mt-0.5 break-words ${accent ? "font-bold text-indigo-700" : "font-semibold text-gray-800"}`}>
        {value || "—"}
      </p>
    </div>
  </div>
);

export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4 pb-4 border-b border-gray-100 last:mb-0 last:pb-0 last:border-b-0">
    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
      {title}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  </div>
);

export const ActivityTab = () => (
  <div className="relative overflow-hidden h-[340px]!">
    <div className="px-6 py-5 absolute inset-0 overflow-y-auto">
      <div className="relative pl-5">
        <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gray-200" />
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="relative w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Повышение до старшего специалиста</p>
              <p className="text-xs text-gray-400 mt-0.5">12 июн 2025</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="relative w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Завершён проект «Рефакторинг»</p>
              <p className="text-xs text-gray-400 mt-0.5">3 мар 2025</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="relative w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Получена награда за результаты</p>
              <p className="text-xs text-gray-400 mt-0.5">15 янв 2025</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="relative w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0 z-10">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Принят в штат компании</p>
              <p className="text-xs text-gray-400 mt-0.5">7 ноя 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const DocsTab = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div className="flex items-center gap-3 p-4 rounded-xl border bg-gray-50 border-gray-200 hover:border-indigo-200 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-indigo-500/50 transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <ScrollText size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">Трудовой договор</p>
        <p className="text-xs text-gray-400 mt-0.5">
          <span className="font-medium">PDF</span>
          <span> · 01.01.2024</span>
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 p-4 rounded-xl border bg-gray-50 border-gray-200 hover:border-indigo-200 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-indigo-500/50 transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <FileText size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">Приказ о назначении</p>
        <p className="text-xs text-gray-400 mt-0.5">
          <span className="font-medium">DOCX</span>
          <span> · 01.01.2024</span>
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 p-4 rounded-xl border bg-gray-50 border-gray-200 hover:border-indigo-200 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-indigo-500/50 transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <ClipboardList size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">Должностная инструкция</p>
        <p className="text-xs text-gray-400 mt-0.5">
          <span className="font-medium">PDF</span>
          <span> · 15.02.2024</span>
        </p>
      </div>
    </div>

    <div className="flex items-center gap-3 p-4 rounded-xl border bg-gray-50 border-gray-200 hover:border-indigo-200 dark:bg-slate-900/50 dark:border-slate-800 dark:hover:border-indigo-500/50 transition-all cursor-pointer">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
        <Shield size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">NDA соглашение</p>
        <p className="text-xs text-gray-400 mt-0.5">
          <span className="font-medium">PDF</span>
          <span> · 01.01.2024</span>
        </p>
      </div>
    </div>
  </div>
);
