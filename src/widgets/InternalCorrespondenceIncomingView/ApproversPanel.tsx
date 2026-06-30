import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Clock } from "lucide-react";
import { cn } from "@shared/lib";

// Всплывающая панель «Согласующие» для просмотра входящего письма. Компонент
// рендерится внутри обёртки по ширине листа A4 (см. ui.tsx): вертикальный таб
// крепится вплотную к ПРАВОМУ краю листа, строго по центру по вертикали, а
// панель по клику выезжает справа от листа на всю его высоту. Визуально и по
// поведению повторяет предоставленный дизайн (прогресс, карточки ЭЦП, история).
interface DocApproverItem {
  id: string;
  name: string;
  position: string;
  role: "Согласующий" | "Утверждающий" | "Ознакомлен";
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  signed: boolean;
  signedAt: string;
}

const PANEL_APPROVERS: DocApproverItem[] = [
  {
    id: "da1",
    name: "Алия Нурмагамбетова",
    position: "Главный юрист",
    role: "Согласующий",
    initials: "АН",
    gradientFrom: "#6366f1",
    gradientTo: "#8b5cf6",
    signed: true,
    signedAt: "11.06.2025 09:15",
  },
  {
    id: "da2",
    name: "Даурен Сейткали",
    position: "Зам. директора",
    role: "Утверждающий",
    initials: "ДС",
    gradientFrom: "#10b981",
    gradientTo: "#059669",
    signed: true,
    signedAt: "11.06.2025 11:48",
  },
  {
    id: "da3",
    name: "Айгерим Бекова",
    position: "Секретарь",
    role: "Ознакомлен",
    initials: "АБ",
    gradientFrom: "#94a3b8",
    gradientTo: "#64748b",
    signed: false,
    signedAt: "",
  },
];

const HISTORY_EVENTS: { label: string; date: string }[] = [
  { label: "Документ создан", date: "10.06.2025 08:30" },
  { label: "Отправлен на согласование", date: "10.06.2025 09:00" },
  { label: "Нурмагамбетова А. подписала", date: "11.06.2025 09:15" },
  { label: "Сейткали Д. утвердил", date: "11.06.2025 11:48" },
];

const ROLE_BADGE: Record<
  DocApproverItem["role"],
  { bg: string; text: string; border: string }
> = {
  Согласующий: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  Утверждающий: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  Ознакомлен: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

function getCertSnippet(initials: string): string {
  const hex = initials
    .split("")
    .map((c) => c.charCodeAt(0).toString(16).toUpperCase())
    .join("");
  return `SN: ${hex}A3F9...C12D`;
}

export const ApproversPanel = ({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const signedCount = PANEL_APPROVERS.filter((a) => a.signed).length;
  const totalCount = PANEL_APPROVERS.length;
  const dotColor =
    signedCount === totalCount
      ? "bg-green-400"
      : signedCount > 0
        ? "bg-amber-400"
        : "bg-slate-300";
  const progressPct = Math.round((signedCount / totalCount) * 100);

  return (
    <>
      {/* Вертикальный таб — вплотную к правому краю листа, по центру по вертикали */}
      <div
        className="absolute top-1/2 z-20 -translate-y-1/2"
        style={{ right: -36 }}
      >
        <motion.button
          onClick={isOpen ? onClose : onOpen}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className={cn(
            "bg-white border border-slate-200 border-l-0 rounded-r-xl shadow-md px-2 py-4 cursor-pointer flex flex-col items-center gap-1.5 select-none transition-all duration-200",
            isOpen ? "bg-slate-50" : "hover:bg-slate-50",
          )}
          aria-label="Согласующие"
        >
          <span
            className={cn("w-2.5 h-2.5 rounded-full flex-shrink-0", dotColor)}
          />
          <span
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              fontSize: 11,
              fontWeight: 600,
              color: "#475569",
              letterSpacing: "0.08em",
            }}
          >
            Согласующие
          </span>
        </motion.button>
      </div>

      {/* Всплывающая панель — выезжает справа от листа A4, на всю его высоту */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="absolute top-0 h-full w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 flex flex-col"
            style={{ left: "calc(100% + 12px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center">
                <span className="font-semibold text-sm text-slate-800">
                  Согласующие
                </span>
                <span className="bg-slate-100 text-slate-600 text-xs rounded-full px-2 py-0.5 ml-2 font-medium">
                  {totalCount}
                </span>
              </div>
              <button
                onClick={onClose}
                className="hover:bg-slate-100 rounded-lg p-1 transition-colors text-slate-400 hover:text-slate-700"
                aria-label="Закрыть панель согласующих"
              >
                <X size={15} />
              </button>
            </div>

            {/* Прогресс */}
            <div className="mx-5 mt-3 mb-1">
              <div className="bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-green-400 rounded-full h-1.5 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 px-5 mb-3">
              <span>Подписали </span>
              <span className="font-semibold text-slate-600">{signedCount}</span>
              <span> из </span>
              <span className="font-semibold text-slate-600">{totalCount}</span>
            </p>

            {/* Список согласующих */}
            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3 min-h-0">
              {PANEL_APPROVERS.map((approver, idx) => {
                const roleBadge = ROLE_BADGE[approver.role];
                return (
                  <motion.div
                    key={approver.id}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: idx * 0.06,
                      duration: 0.22,
                      ease: "easeOut",
                    }}
                    className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2 border border-slate-100"
                  >
                    {/* Аватар + имя + роль */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${approver.gradientFrom}, ${approver.gradientTo})`,
                        }}
                      >
                        {approver.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[13px] text-slate-800 leading-tight truncate">
                          {approver.name}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0",
                          roleBadge.bg,
                          roleBadge.text,
                          roleBadge.border,
                        )}
                      >
                        {approver.role}
                      </span>
                    </div>

                    {/* Должность */}
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {approver.position}
                    </p>

                    {/* Блок ЭЦП */}
                    {approver.signed && (
                      <div className="bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#16a34a"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ flexShrink: 0 }}
                          aria-hidden="true"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="9 12 11 14 15 10" />
                        </svg>
                        <div className="min-w-0">
                          <p className="text-[9px] font-bold text-green-700 uppercase tracking-wide leading-tight">
                            ЭЦП действительна
                          </p>
                          <p className="text-[9px] text-green-600 leading-tight">
                            <span>{approver.signedAt}</span>
                            <span className="font-mono text-slate-400 ml-1">
                              {getCertSnippet(approver.initials)}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Статус */}
                    {approver.signed ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check size={9} className="text-green-600" />
                        </span>
                        <span className="text-[11px] font-semibold text-green-700">
                          Подписано
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
                          <Clock size={9} className="text-amber-500" />
                        </span>
                        <span className="text-[11px] font-semibold text-amber-600">
                          Ожидает подписи
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Футер: история согласования */}
            <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="w-full text-left flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
              >
                <span>История согласования</span>
                <motion.span
                  animate={{ rotate: showHistory ? 180 : 0 }}
                  transition={{ duration: 0.18 }}
                  className="inline-block"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 flex flex-col gap-2">
                      {HISTORY_EVENTS.map((event, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-600 leading-tight">
                              {event.label}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {event.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
