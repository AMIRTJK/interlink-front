import React from "react";
import { Tag, Button } from "antd";
import { ClockCircleOutlined, UserOutlined, CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
import { If } from "@shared/ui";
import type { IAssignmentItem } from "./types";

interface IProps {
  item: IAssignmentItem;
  currentUserId: string | number | null;
  isDarkMode?: boolean;
  onSubmitResult: (assignmentId: number) => void;
  onReviewResult: (assignmentId: number) => void;
}

export const AssignmentItem: React.FC<IProps> = ({
  item,
  currentUserId,
  isDarkMode,
  onSubmitResult,
  onReviewResult,
}) => {
  const isAssignee = String(item.assignee_user_id) === String(currentUserId);
  const isAssigner = String(item.assigner_id) === String(currentUserId);

  const renderStatus = () => {
    switch (item.status) {
      case "done":
        return <Tag color="success">Исполнено</Tag>;
      case "submitted":
        return <Tag color="processing" icon={<SyncOutlined spin />}>На проверке</Tag>;
      case "returned":
        return <Tag color="warning">Доработка</Tag>;
      default:
        return <Tag color="default" icon={<ClockCircleOutlined />}>В работе</Tag>;
    }
  };

  return (
    <div
      className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all text-xs ${
        isDarkMode
          ? "bg-gray-800/60 border-gray-700/80 text-gray-200"
          : "bg-white border-gray-200/80 text-gray-800 shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b pb-2 border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-gray-200">
          <UserOutlined className="text-indigo-500" />
          <span>{item.assignee?.full_name || `Исполнитель #${item.assignee_user_id}`}</span>
        </div>
        {renderStatus()}
      </div>

      <div className="space-y-1">
        <p className="font-semibold text-sm leading-snug">{item.note || "Поручение по документу"}</p>
        <If is={Boolean(item.due_at)}>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <ClockCircleOutlined />
            <span>Срок: {new Date(item.due_at!).toLocaleString("ru-RU")}</span>
          </div>
        </If>
      </div>

      <If is={Boolean(item.task)}>
        <div className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[11px]">
          <span className="font-semibold text-indigo-700 dark:text-indigo-300 block mb-0.5">
            📋 Задача #{item.task?.id}: {item.task?.title}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Статус: {item.task?.status} ({item.task?.progress || 0}%)
          </span>
        </div>
      </If>

      <If is={Boolean(item.result_text)}>
        <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-[11px]">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-0.5">
            <CheckCircleOutlined /> Результат:
          </span>
          <p className="text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">{item.result_text}</p>
          <If is={Boolean(item.result_note)}>
            <span className="text-emerald-700/80 dark:text-emerald-400 block mt-1 italic">
              Примечание: {item.result_note}
            </span>
          </If>
        </div>
      </If>

      <If is={Boolean(item.review_note)}>
        <div className="p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-[11px]">
          <span className="font-semibold text-amber-800 dark:text-amber-300 block mb-0.5">
            💬 Замечания автора:
          </span>
          <p className="text-amber-900 dark:text-amber-200 whitespace-pre-wrap">{item.review_note}</p>
        </div>
      </If>

      <div className="flex items-center justify-end gap-2 pt-1">
        <If is={isAssignee && (item.status === "pending" || item.status === "returned")}>
          <Button
            type="primary"
            size="small"
            onClick={() => onSubmitResult(item.id)}
            className="bg-indigo-600! hover:bg-indigo-500!"
          >
            Отправить результат
          </Button>
        </If>

        <If is={isAssigner && item.status === "submitted"}>
          <Button
            type="primary"
            size="small"
            onClick={() => onReviewResult(item.id)}
            className="bg-emerald-600! hover:bg-emerald-500!"
          >
            Проверить результат
          </Button>
        </If>
      </div>
    </div>
  );
};
