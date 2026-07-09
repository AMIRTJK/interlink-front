import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@shared/lib";

// Аккордеон с данными исходного входящего письма. Показывается на странице
// создания исходящего при «Ответить»/«Перенаправить» (см. дизайн —
// OriginalLetterPanel). Данные реальные, прокидываются через navigate state.

const STATUS_STYLE: Record<string, string> = {
  "на резолюции": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "на исполнении": "bg-amber-100 text-amber-700 border-amber-200",
  "на согласовании": "bg-blue-50 text-blue-700 border-blue-200",
  "на подпись": "bg-purple-50 text-purple-700 border-purple-200",
  завершено: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
  ).toUpperCase();
};

// Декодируем HTML-сущности (&nbsp;, &amp;, &lt; и т.д.) в обычный текст.
// Без этого после вырезания тегов в тексте письма остаётся сырой «&nbsp;».
const decodeHtmlEntities = (html: string): string => {
  if (typeof document === "undefined") return html;
  const el = document.createElement("textarea");
  el.innerHTML = html;
  return el.value;
};

const Lbl = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500">
    {children}
  </span>
);

export const OriginalLetterPanel = ({
  mode,
  sender,
  date,
  status,
  inboundNumber,
  subject,
  body,
  sourceId,
}: {
  mode: "reply" | "forward";
  sender: string;
  date: string;
  status: string;
  inboundNumber: string;
  subject: string;
  body?: string | null;
  sourceId?: string | number;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showFullText, setShowFullText] = useState(false);

  const label = mode === "reply" ? "Исходное письмо" : "Перенаправляемое письмо";
  const subjectSnippet =
    subject && subject.length > 40 ? subject.slice(0, 40) + "…" : subject;
  const bodyText = decodeHtmlEntities((body || "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  const statusBadge =
    STATUS_STYLE[status] || "bg-amber-100 text-amber-700 border-amber-200";

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sourceId != null) {
      window.open(
        `/modules/correspondence/internal/incoming/${sourceId}`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  };

  return (
    <div className="mb-5 rounded-2xl overflow-hidden border border-amber-200 bg-amber-50 shadow-sm">
      {/* Свёрнутая полоса */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex items-center gap-3 bg-amber-50 hover:bg-amber-100 transition-colors px-5 w-full text-left cursor-pointer"
        style={{ height: 48 }}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={15} className="text-amber-500 flex-shrink-0" />
        </motion.div>
        <span className="text-sm font-semibold text-amber-800 flex-shrink-0">
          {label}
        </span>
        <div className="flex items-center gap-2 ml-2 flex-1 overflow-hidden">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex-shrink-0">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center">
              {getInitials(sender)[0]}
            </span>
            <span className="truncate max-w-[140px]">{sender}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium flex-shrink-0">
            <Calendar size={10} />
            <span>{date}</span>
          </span>
          <span className="text-xs text-amber-700 truncate flex-1 hidden sm:block">
            {subjectSnippet}
          </span>
        </div>
        {sourceId != null && (
          <span
            onClick={handleOpen}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-colors flex-shrink-0 cursor-pointer"
          >
            <ExternalLink size={11} />
            <span>Открыть</span>
          </span>
        )}
      </button>

      {/* Развёрнутое содержимое */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-amber-200"
            style={{ background: "#fffbeb" }}
          >
            {/* Детали */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 px-5 pt-4">
              <div className="flex flex-col gap-1 min-w-0">
                <Lbl>Отправитель</Lbl>
                <span className="text-[11px] font-medium text-slate-700 truncate">
                  {sender}
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <Lbl>Дата</Lbl>
                <span className="text-[11px] font-medium text-slate-700">
                  {date}
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <Lbl>Статус</Lbl>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border w-fit capitalize",
                    statusBadge,
                  )}
                >
                  {status || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <Lbl>Вх. номер</Lbl>
                <span className="font-mono text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 inline-flex w-fit text-slate-700">
                  {inboundNumber}
                </span>
              </div>
            </div>

            {/* Тема */}
            <div className="px-5 pt-3">
              <Lbl>Тема</Lbl>
              <p className="text-[11px] font-medium text-slate-700 mt-0.5 leading-relaxed">
                {subject || "Без темы"}
              </p>
            </div>

            {/* Текст письма */}
            <div className="px-5 pt-3 pb-4">
              <Lbl>Текст письма</Lbl>
              {bodyText ? (
                <>
                  <div className="relative mt-1">
                    <p
                      className={cn(
                        "text-xs text-slate-600 leading-relaxed",
                        !showFullText && "line-clamp-4",
                      )}
                    >
                      {bodyText}
                    </p>
                    {!showFullText && (
                      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#fffbeb] to-transparent pointer-events-none" />
                    )}
                  </div>
                  {!showFullText && bodyText.length > 200 && (
                    <button
                      onClick={() => setShowFullText(true)}
                      className="mt-1 text-[11px] font-semibold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                    >
                      Показать полностью
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">
                  Текст недоступен
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
