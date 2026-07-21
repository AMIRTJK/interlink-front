import React, { useState } from "react";
import { Modal, Form, Input, ConfigProvider, theme } from "antd";
import { useMutationQuery, requiredRule } from "@shared/lib";
import { ApiRoutes } from "@shared/api";
import type { ISubmitResultPayload, IReviewPayload } from "./types";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number | null;
  mode: "submit" | "review";
  isDarkMode?: boolean;
  onSuccess: () => void;
}

export const AssignmentResultModal: React.FC<IProps> = ({
  isOpen,
  onClose,
  assignmentId,
  mode,
  isDarkMode,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [reviewDecision, setReviewDecision] = useState<"done" | "returned">("done");

  const { mutate: submitResult, isPending: isSubmitting } = useMutationQuery<ISubmitResultPayload>({
    url: assignmentId
      ? ApiRoutes.INTERNAL_ASSIGNMENT_RESULT.replace(":id", String(assignmentId))
      : "",
    method: "PATCH",
    messages: {
      success: "Результат отправлен на проверку",
    },
    queryOptions: {
      onSuccess: () => {
        form.resetFields();
        onSuccess();
        onClose();
      },
    },
  });

  const { mutate: reviewResult, isPending: isReviewing } = useMutationQuery<IReviewPayload>({
    url: assignmentId
      ? ApiRoutes.INTERNAL_ASSIGNMENT_REVIEW.replace(":id", String(assignmentId))
      : "",
    method: "PATCH",
    messages: {
      success: "Решение сохранено",
    },
    queryOptions: {
      onSuccess: () => {
        form.resetFields();
        onSuccess();
        onClose();
      },
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === "submit") {
        submitResult({
          result_text: values.result_text.trim(),
          result_note: values.result_note ? values.result_note.trim() : undefined,
        });
      } else {
        reviewResult({
          decision: reviewDecision,
          review_note: values.review_note ? values.review_note.trim() : undefined,
        });
      }
    } catch (err) {
      console.error("Ошибка формы:", err);
    }
  };

  const isSubmitMode = mode === "submit";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Modal
        open={isOpen}
        onCancel={onClose}
        onOk={handleSubmit}
        confirmLoading={isSubmitting || isReviewing}
        title={isSubmitMode ? "Отправка результата поручения" : "Проверка результата поручения"}
        okText={isSubmitMode ? "Отправить результат" : "Подтвердить решение"}
        cancelText="Отмена"
        centered
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-3">
          {isSubmitMode ? (
            <>
              <Form.Item
                name="result_text"
                label="Результат выполнения"
                rules={[requiredRule]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="Опишите результат выполнения поручения..."
                />
              </Form.Item>
              <Form.Item name="result_note" label="Дополнительное примечание">
                <Input.TextArea
                  rows={2}
                  placeholder="Дополнительные детали при необходимости..."
                />
              </Form.Item>
            </>
          ) : (
            <>
              <div className="mb-4">
                <label className={`block text-xs font-semibold mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Решение:
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision("done")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      reviewDecision === "done"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    ✓ Принять (Исполнено)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewDecision("returned")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      reviewDecision === "returned"
                        ? "bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    ↩ Вернуть на доработку
                  </button>
                </div>
              </div>
              <Form.Item name="review_note" label="Замечания / Комментарий">
                <Input.TextArea
                  rows={3}
                  placeholder="Укажите комментарий или замечания к работе..."
                />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </ConfigProvider>
  );
};
