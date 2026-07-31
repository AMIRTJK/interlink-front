import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Calendar, FileType } from "lucide-react";
import { cn } from "@shared/lib";
import { DetailField } from "./DetailField";
import {
  RegistryItem,
  inboxStatusStyle,
  statusTranslations,
  priorityConfig,
} from "./incomingViewModel";

interface IProps {
  item: RegistryItem;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  senderName: string;
  senderInitials: string;
  inboundNumber: string;
  formattedSentDate: string;
  ccRecipientsList: string;
}

export const IncomingDetailsAccordion: React.FC<IProps> = ({
  item,
  detailsOpen,
  onToggleDetails,
  senderName,
  senderInitials,
  inboundNumber,
  formattedSentDate,
  ccRecipientsList,
}) => {
  return (
    <div className="flex-shrink-0 flex flex-col bg-white border-b border-slate-200">
      <button
        onClick={onToggleDetails}
        className="flex items-center gap-3 px-6 h-12 w-full text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <motion.div
          animate={{ rotate: detailsOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={15} className="text-slate-400 flex-shrink-0" />
        </motion.div>
        <span className="text-sm font-semibold text-slate-700">
          Детали письма
        </span>
        <div className="flex items-center gap-2 ml-2 flex-1 overflow-hidden">
          {/* Отправитель */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
            <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
              {senderInitials[0]}
            </span>
            <span className="truncate max-w-[160px]">{senderName}</span>
          </span>
          {/* Дата */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs font-medium flex-shrink-0">
            <Calendar size={10} />
            <span>{formattedSentDate}</span>
          </span>
          {/* Статус */}
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize flex-shrink-0",
              inboxStatusStyle[item.status] ||
                "bg-slate-100 text-slate-600 border-slate-200"
            )}
          >
            {statusTranslations[item.status] || item.status}
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {detailsOpen && (
          <motion.div
            key="details-expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-100"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 px-6 py-5">
              {/* Отправитель */}
              <DetailField label="Отправитель">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold flex-shrink-0 border border-blue-200">
                    {senderInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {senderName}
                    </p>
                    <p className="text-[10px] text-slate-400">Отправитель</p>
                  </div>
                </div>
              </DetailField>

              {/* Копия */}
              <DetailField label="Копия">
                <p
                  className={cn(
                    "text-xs font-medium leading-snug",
                    ccRecipientsList
                      ? "text-slate-800"
                      : "text-slate-400 italic"
                  )}
                >
                  {ccRecipientsList || "Не указано"}
                </p>
              </DetailField>

              {/* Тема */}
              <DetailField label="Тема">
                <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2">
                  {item.subject || "Без темы"}
                </p>
              </DetailField>

              {/* Дата */}
              <DetailField label="Дата">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Calendar size={13} className="text-blue-500 shrink-0" />
                  <span className="text-xs font-semibold">
                    {formattedSentDate}
                  </span>
                </div>
              </DetailField>

              {/* Номер (вх.) */}
              <DetailField label="Номер (вх.)">
                <span className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-flex w-fit text-slate-800">
                  {inboundNumber}
                </span>
              </DetailField>

              {/* Тип документа */}
              <DetailField label="Тип документа">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full border border-indigo-100 w-fit">
                  <FileType size={12} />
                  <span>Внутренний</span>
                </span>
              </DetailField>

              {/* Статус */}
              <DetailField label="Статус">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize w-fit",
                    inboxStatusStyle[item.status] ||
                      "bg-slate-100 text-slate-600 border-slate-200"
                  )}
                >
                  {statusTranslations[item.status] || item.status}
                </span>
              </DetailField>

              {/* Приоритет */}
              <DetailField label="Приоритет">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize w-fit",
                    priorityConfig[item.priority || "low"]?.className ||
                      "bg-slate-50! text-slate-600! border-slate-200!"
                  )}
                >
                  {priorityConfig[item.priority || "low"]?.label ||
                    "Низкая важность"}
                </span>
              </DetailField>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
