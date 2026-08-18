import { useState } from "react";
import { Modal, Avatar } from "antd";
import { XCircle } from "lucide-react";
import { If } from "@shared/ui";
import {
  REJECTION_TYPE_LABELS,
  type IRejection,
  type TRejectionType,
} from "../model";

const initialsOf = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)
  ).toUpperCase();
};

const typeLabelOf = (type?: TRejectionType) =>
  type ? REJECTION_TYPE_LABELS[type] : "Отклонение";

const dateOf = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("ru-RU") : "";

// Бэкенд может прислать пустую историю при заполненном последнем отклонении.
const historyOf = (
  rejection?: IRejection | null,
  rejections?: IRejection[],
): IRejection[] => {
  if (Array.isArray(rejections) && rejections.length > 0) return rejections;
  return rejection ? [rejection] : [];
};

interface IProps {
  /** Последнее отклонение письма. */
  rejection?: IRejection | null;
  /** Полная история отклонений письма. */
  rejections?: IRejection[];
}

/**
 * Ячейка «Причина отклонения» для реестра «Отменено»: показывает причину
 * последнего отклонения, по клику открывает окно со всей историей.
 */
export const RejectionViewer = ({ rejection, rejections }: IProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const history = historyOf(rejection, rejections);

  const reason = rejection?.reason || history[0]?.reason;
  const othersCount = history.length - 1;

  if (!reason && history.length === 0) {
    return <span className="text-gray-400 dark:text-slate-500">—</span>;
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="group flex items-center gap-1.5 cursor-pointer hover:text-rose-600 transition-colors"
      >
        <span
          className="truncate text-gray-700 dark:text-slate-200"
          title={reason || undefined}
        >
          {reason || "Без причины"}
        </span>
        <If is={othersCount > 0}>
          <span className="flex-shrink-0 text-xs font-medium bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-md group-hover:bg-rose-100 transition-colors dark:bg-rose-950/40 dark:text-rose-300">
            +{othersCount}
          </span>
        </If>
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <XCircle size={18} className="text-rose-600!" />
            <span>История отклонений ({history.length})</span>
          </div>
        }
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width={560}
        centered
        maskClosable
        wrapProps={{
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            if (e.target === e.currentTarget) {
              handleClose(e);
            }
          },
        }}
      >
        <div
          className="flex flex-col gap-2 py-2 max-h-[60vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {history.map((item, idx) => (
            <div
              key={item.approval_id || item.signature_id || idx}
              className="flex gap-3 p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-all"
            >
              <Avatar className="bg-rose-500! text-xs! flex-shrink-0">
                {initialsOf(item.user?.full_name)}
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-800 dark:text-slate-100 font-medium truncate">
                    {item.user?.full_name || "Без имени"}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {dateOf(item.rejected_at)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 dark:text-slate-500 truncate">
                  {item.user?.position || "Сотрудник"}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
                    {typeLabelOf(item.type)}
                  </span>
                  <If is={!!item.version}>
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                      Версия {item.version}
                    </span>
                  </If>
                </div>
                <p className="mt-2 text-sm text-gray-700 dark:text-slate-200 whitespace-pre-line">
                  {item.reason || "Причина не указана"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};
