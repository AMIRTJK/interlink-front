import { ArrowLeft, Clock, Eye, Printer, Save, Send, Undo, X } from "lucide-react";

import { If } from "@shared/ui";

import { cn } from "../../lib/utils";
import type { RecipientOption } from "../../types";

interface IProps {
  onBack: () => void;
  onPreview: () => void;
  onPrint: () => void;
  onSaveClick: () => void;
  onDecline: () => void;
  onCancelSign: () => void;
  onSend: () => void;
  to: RecipientOption[];
  subject: string;
  isSaving: boolean;
  isOldVersionSelected: boolean;
  isSigned?: boolean;
  isAlreadySent: boolean;
  isSending: boolean;
  canDecline: boolean;
  /** Действия, разрешённые динамической ролью пользователя в этом документе */
  canSave: boolean;
  canSend: boolean;
  canCancelSign: boolean;
  allSignaturesSigned: boolean;
  hasDocId: boolean;
}

export const ScreenActionsBar = ({
  onBack,
  onPreview,
  onPrint,
  onSaveClick,
  onDecline,
  onCancelSign,
  onSend,
  to,
  subject,
  isSaving,
  isOldVersionSelected,
  isSigned,
  isAlreadySent,
  isSending,
  canDecline,
  canSave,
  canSend,
  canCancelSign,
  allSignaturesSigned,
  hasDocId,
}: IProps) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 cursor-pointer text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group"
      >
        <ArrowLeft
          size={16}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        <span>Назад</span>
      </button>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onPreview}
        className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-colors"
      >
        <Eye size={15} className="text-slate-500" />
        <span className="hidden sm:inline">Предварительный просмотр</span>
      </button>

      <button
        onClick={onPrint}
        className="flex items-center cursor-pointer gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-colors"
      >
        <Printer size={15} className="text-slate-500" />
        <span className="hidden sm:inline">Печать</span>
      </button>

      <If is={canSave}>
        <button
          onClick={onSaveClick}
          disabled={
            !to.length ||
            !subject.trim() ||
            isSaving ||
            isOldVersionSelected ||
            isSigned ||
            isAlreadySent
          }
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
            to.length &&
              subject.trim() &&
              !isSaving &&
              !isOldVersionSelected &&
              !isSigned &&
              !isAlreadySent
              ? "bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
              : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed",
          )}
        >
          {isSaving ? (
            <Clock size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          <span>Сохранить</span>
        </button>
      </If>

      <If is={canDecline}>
        <button
          type="button"
          onClick={onDecline}
          className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-semibold transition-all border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-xl"
        >
          <X size={15} className="text-red-500" />
          <span>Отклонить</span>
        </button>
      </If>

      <If is={isSigned && !isAlreadySent && canCancelSign}>
        <button
          type="button"
          onClick={onCancelSign}
          className="flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-semibold transition-all border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-xl"
        >
          <Undo size={15} />
          <span>Отменить подпись</span>
        </button>
      </If>

      {hasDocId && canSend && (
        <button
          onClick={onSend}
          disabled={
            !to.length ||
            !subject.trim() ||
            !allSignaturesSigned ||
            isSending ||
            isAlreadySent
          }
          className={cn(
            "flex items-center gap-2 cursor-pointer px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md",
            to.length &&
              subject.trim() &&
              allSignaturesSigned &&
              !isSending &&
              !isAlreadySent
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100 active:scale-95"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none",
          )}
        >
          {isSending ? (
            <Clock size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          <span>
            {isSending
              ? "Отправка..."
              : isAlreadySent
                ? "Отправлено"
                : "Отправить"}
          </span>
        </button>
      )}
    </div>
  </div>
);
