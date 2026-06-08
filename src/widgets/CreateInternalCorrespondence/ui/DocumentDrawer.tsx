import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Download,
  Trash,
  X,
  Calendar,
  User,
  ChevronRight,
  MessageSquare,
  FileType,
  ChevronDown,
  Clock,
  Shield,
  Check,
} from "lucide-react";
import type { RegistryItem, RecipientOption, Status } from "../types";
import {
  INBOX_DOC_TYPES,
  INBOX_DOC_TYPE_STYLE,
  OUTBOX_STATUS_LABEL,
  OUTBOX_STATUS_STYLE,
  MOCK_CONTENT_LINES,
  RECIPIENT_OPTIONS,
} from "../lib/constants";
import { cn } from "../lib/utils";
import { CollapsibleBlock } from "./CollapsibleBlock";
import { DSStamp } from "./DSStamp";
import { OrgStructureModal } from "./OrgStructureModal";
import { DSStampAppendix } from "./DSStampAppendix";

export const DocumentDrawer = ({
  item,
  isOutbox,
  onClose,
}: {
  item: RegistryItem;
  isOutbox: boolean;
  onClose: () => void;
}) => {
  const docType = INBOX_DOC_TYPES[item.id] ?? "Дархост";
  const docTypeStyle =
    INBOX_DOC_TYPE_STYLE[docType] ??
    "bg-slate-50 text-slate-700 border-slate-200";
  const inboxStatusStyle: Record<Status, string> = {
    "на резолюции": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "на исполнении": "bg-amber-50 text-amber-700 border-amber-200",
    "на согласовании": "bg-blue-50 text-blue-700 border-blue-200",
    "на подпись": "bg-purple-50 text-purple-700 border-purple-200",
    завершено: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const statusStyle = isOutbox
    ? OUTBOX_STATUS_STYLE[item.status]
    : inboxStatusStyle[item.status];
  const statusLabel = isOutbox ? OUTBOX_STATUS_LABEL[item.status] : item.status;
  const [selectedExecutor, setSelectedExecutor] =
    useState<RecipientOption | null>(
      item.executor ? RECIPIENT_OPTIONS[0] : null,
    );
  const [taskTemplate, setTaskTemplate] = useState(
    "Ознакомиться и утвердить документ",
  );
  const [customTask, setCustomTask] = useState("");
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [dueDate, setDueDate] = useState("15.02.2026");
  const [visaStatus, setVisaStatus] = useState("на рассмотрении");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [ecpApplied, setEcpApplied] = useState(false);
  const [ecpLoading, setEcpLoading] = useState(false);
  const [showOrgStructure, setShowOrgStructure] = useState(false);
  const [showDSStampAppendix, setShowDSStampAppendix] = useState(false);
  const TASK_TEMPLATES = [
    "Ознакомиться и утвердить документ",
    "Согласовать содержание",
    "Проверить и подписать",
    "Рассмотреть предложения",
  ];
  const VISA_STATUSES = ["на рассмотрении", "согласовано", "требует доработки"];

  return (
    <AnimatePresence>
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        key="drawer-panel"
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.26, ease: [0.32, 0.72, 0, 1] }}
        className="fixed inset-4 z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Eye size={17} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900 leading-tight">
                Просмотр документа
              </p>
              <p className="text-xs text-slate-400 font-medium">
                {item.inboundNumber} · {item.outboundNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold">
              <Download size={14} />
              <span>Скачать</span>
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-colors text-sm font-semibold">
              <Trash size={14} />
              <span>Удалить</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold"
            >
              <X size={14} />
              <span>Закрыть</span>
            </button>
          </div>
        </div>
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <aside className="w-72 flex-shrink-0 border-r border-slate-100 overflow-y-auto bg-slate-50/60 flex flex-col">
            <div className="p-5 space-y-3">
              <CollapsibleBlock title="Детали письма" defaultOpen={true}>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    От кого
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
                      {item.sender
                        .split(" ")
                        .map((w: string) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">
                        {item.sender}
                      </p>
                      <p className="text-[10px] text-slate-400">Отправитель</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Копия
                  </p>
                  <p className="text-sm text-slate-400 italic">Не указано</p>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Тема
                  </p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {item.subject}
                  </p>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Дата
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="text-blue-500 flex-shrink-0"
                    />
                    <p className="text-sm font-semibold text-slate-800">
                      {item.date}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Номер письма
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">
                        Входящий
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {item.inboundNumber}
                      </span>
                    </div>
                    <div className="w-px h-8 bg-slate-100 mx-1" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-400 font-medium">
                        Исходящий
                      </span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {item.outboundNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3.5 border-b border-slate-50">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Тип документа
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                      docTypeStyle,
                    )}
                  >
                    <FileType size={12} />
                    <span>{docType}</span>
                  </span>
                </div>
                <div className="px-4 py-3.5">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                    Статус документа
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border capitalize",
                      statusStyle,
                    )}
                  >
                    {statusLabel}
                  </span>
                  {item.executor && (
                    <div className="mt-3 flex items-center gap-2 pt-3 border-t border-slate-200">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 border border-slate-200 flex-shrink-0">
                        {item.executor.split(" ")[0][0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {item.executor}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Исполнитель
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleBlock>

              <CollapsibleBlock title="Виза" defaultOpen={true}>
                <div className="px-4 py-3.5 space-y-3">
                  <div className="border-b border-slate-50 pb-3">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Исполнитель
                    </p>
                    <button
                      onClick={() => setShowOrgStructure(true)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <User size={13} className="text-slate-400" />
                        {selectedExecutor
                          ? selectedExecutor.name
                          : "Выбрать исполнителя"}
                      </span>
                      <ChevronRight size={13} className="text-slate-400" />
                    </button>
                  </div>
                  <div className="border-b border-slate-50 pb-3">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Поручение
                    </p>
                    {!showTaskEditor ? (
                      <button
                        onClick={() => setShowTaskEditor(true)}
                        className="w-full flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors text-left"
                      >
                        <MessageSquare
                          size={13}
                          className="text-blue-500 mt-0.5 flex-shrink-0"
                        />
                        <p className="text-[11px] font-medium text-blue-700">
                          {customTask || taskTemplate}
                        </p>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          {TASK_TEMPLATES.map((template) => (
                            <button
                              key={template}
                              onClick={() => {
                                setTaskTemplate(template);
                                setCustomTask("");
                                setShowTaskEditor(false);
                              }}
                              className="text-[10px] px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition-colors font-medium"
                            >
                              {template}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className="text-[9px] font-semibold text-slate-400 mb-1 block">
                            Свой текст
                          </label>
                          <textarea
                            value={customTask}
                            onChange={(e) => setCustomTask(e.target.value)}
                            placeholder="Введите поручение..."
                            className="w-full text-[11px] text-slate-700 placeholder-slate-400 bg-amber-50/60 border border-amber-100 rounded-lg px-2.5 py-2 resize-none outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all"
                            rows={2}
                          />
                        </div>
                        <button
                          onClick={() => setShowTaskEditor(false)}
                          className="w-full text-[10px] px-2 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors font-semibold"
                        >
                          Готово
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="border-b border-slate-50 pb-3">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Срок
                    </p>
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <Calendar
                        size={13}
                        className="text-blue-500 flex-shrink-0"
                      />
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-medium text-slate-700 outline-none"
                      />
                    </div>
                  </div>
                  <div className="border-b border-slate-50 pb-3">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Статус
                    </p>
                    <div className="relative">
                      <button
                        onClick={() =>
                          setShowStatusDropdown(!showStatusDropdown)
                        }
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium border",
                          visaStatus === "на рассмотрении"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : visaStatus === "согласовано"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-amber-50 border-amber-200 text-amber-700",
                        )}
                      >
                        <span>{visaStatus}</span>
                        <ChevronDown
                          size={13}
                          className={cn(
                            "transition-transform",
                            showStatusDropdown && "rotate-180",
                          )}
                        />
                      </button>
                      <AnimatePresence>
                        {showStatusDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden py-1"
                          >
                            {VISA_STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  setVisaStatus(s);
                                  setShowStatusDropdown(false);
                                }}
                                className="w-full px-3 py-1.5 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-b-0 text-sm font-medium text-slate-700"
                              >
                                {s}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-2">
                      Электронная подпись
                    </p>
                    {!ecpApplied ? (
                      <button
                        onClick={() => {
                          setEcpLoading(true);
                          setTimeout(() => {
                            setEcpLoading(false);
                            setEcpApplied(true);
                          }, 1500);
                        }}
                        disabled={ecpLoading}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all border",
                          ecpLoading
                            ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                            : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
                        )}
                      >
                        {ecpLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Clock size={12} />
                          </motion.div>
                        ) : (
                          <Shield size={12} />
                        )}
                        <span>
                          {ecpLoading ? "Применяю подпись..." : "Применить ЭЦП"}
                        </span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <Check
                            size={12}
                            className="text-emerald-600 flex-shrink-0"
                          />
                          <span className="text-[11px] font-semibold text-emerald-700">
                            ЭЦП применена
                          </span>
                        </div>
                        <button
                          onClick={() => setShowDSStampAppendix(true)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          <FileType size={12} />
                          <span>Показать Приложение №1</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleBlock>
            </div>
          </aside>

          <div className="flex-1 overflow-auto bg-[#E8EAED] flex items-start justify-center py-8 px-8">
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="bg-white shadow-xl border border-slate-300/30 w-full max-w-[794px] min-h-[1000px]"
              style={{
                padding: "64px 72px 80px",
                fontFamily: "Times New Roman, serif",
                fontSize: 14,
                lineHeight: 2,
                color: "#1e293b",
                position: "relative",
              }}
            >
              <div className="mb-8">
                <div
                  className="text-right mb-6"
                  style={{ fontFamily: "Times New Roman, serif", fontSize: 13 }}
                >
                  <p style={{ marginBottom: 2 }}>
                    <strong>{item.sender}</strong>
                  </p>
                  <p style={{ color: "#64748b" }}>{item.date}</p>
                  <p style={{ color: "#64748b" }}>№ {item.inboundNumber}</p>
                </div>
                <div className="text-center mb-8">
                  <p
                    className="font-bold text-lg"
                    style={{
                      fontFamily: "Times New Roman, serif",
                      textDecoration: "underline",
                      textUnderlineOffset: 4,
                    }}
                  >
                    {item.subject}
                  </p>
                </div>
              </div>
              <div
                style={{
                  fontFamily: "Times New Roman, serif",
                  fontSize: 14,
                  lineHeight: 2,
                }}
              >
                {MOCK_CONTENT_LINES.map((line, i) =>
                  line === "" ? (
                    <div key={`line-${i}`} style={{ height: "0.5em" }} />
                  ) : (
                    <p
                      key={`line-${i}`}
                      style={{
                        textIndent:
                          line.startsWith("Ҳурматли") ||
                          line.startsWith("Мо") ||
                          line.startsWith("Дар") ||
                          line.startsWith("Бо") ||
                          line.startsWith("Вазорати")
                            ? "2em"
                            : 0,
                        marginBottom: 0,
                      }}
                    >
                      {line}
                    </p>
                  ),
                )}
              </div>
              <div
                className="mt-12"
                style={{ fontFamily: "Times New Roman, serif", fontSize: 14 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">Вазири молия</p>
                    <p style={{ color: "#64748b", marginTop: 32 }}>
                      _____________________
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8" }}>
                      подпись / мӯҳр
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.sender}</p>
                    <p style={{ color: "#64748b", marginTop: 4 }}>
                      {item.date}
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 48 }}>
                <DSStamp
                  name={item.sender}
                  certSerial={`SN-2026-${item.inboundNumber.replace(/[^A-Za-z0-9]/g, "")}-84201`}
                  signedAt={item.date}
                  validUntil="с 20.03.2025 до 20.03.2026"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {showOrgStructure && (
        <OrgStructureModal
          onSelect={(node) => {
            setSelectedExecutor({
              id: node.id,
              name: node.name,
              org: node.position,
              initials: node.initials,
              color: node.color,
            });
            setShowOrgStructure(false);
          }}
          onClose={() => setShowOrgStructure(false)}
        />
      )}
      {showDSStampAppendix && (
        <DSStampAppendix
          signerName={selectedExecutor?.name ?? "Неизвестно"}
          signerInitials={selectedExecutor?.initials ?? "?"}
          signerColor={selectedExecutor?.color ?? "bg-slate-100 text-slate-700"}
          certSerial={`SN-2026-${selectedExecutor?.initials ?? "??"}-84201`}
          signedAt="03.02.2026"
          validUntil="с 20.03.2025 до 20.03.2026"
          onClose={() => setShowDSStampAppendix(false)}
        />
      )}
    </AnimatePresence>
  );
};
