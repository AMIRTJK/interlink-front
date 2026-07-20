import React, { useState } from "react";
import { Modal, Input, Button } from "antd";
import { X, AlertCircle } from "lucide-react";
import { If } from "@shared/ui";

interface IDeclineReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const DeclineReasonModal: React.FC<IDeclineReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleOk = async () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Укажите причину отказа (обязательное поле)");
      return;
    }
    setError("");
    await onConfirm(trimmed);
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      centered
      width={480}
      title={
        <div className="flex items-center gap-2 text-red-600 font-semibold text-base">
          <X size={18} />
          <span>Отклонение документа</span>
        </div>
      }
    >
      <div className="py-2 space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Укажите причину отказа для автора документа. Данное поле является обязательным.
        </p>

        <div>
          <Input.TextArea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            placeholder="Введите причину отказа..."
            rows={4}
            maxLength={500}
            showCount
            className="w-full text-xs rounded-xl"
          />
          <If is={Boolean(error)}>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          </If>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            className="rounded-xl text-xs"
          >
            Отмена
          </Button>
          <Button
            danger
            type="primary"
            onClick={handleOk}
            loading={isLoading}
            className="rounded-xl text-xs bg-red-600 hover:bg-red-700"
          >
            Отклонить
          </Button>
        </div>
      </div>
    </Modal>
  );
};
