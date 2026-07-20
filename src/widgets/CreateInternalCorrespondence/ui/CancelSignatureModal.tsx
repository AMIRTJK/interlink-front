import React, { useState } from "react";
import { Modal, Input, Button } from "antd";
import { Undo } from "lucide-react";

interface ICancelSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
  isLoading?: boolean;
}

export const CancelSignatureModal: React.FC<ICancelSignatureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  const handleOk = async () => {
    await onConfirm(reason.trim());
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
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
        <div className="flex items-center gap-2 text-rose-600 font-semibold text-base">
          <Undo size={18} />
          <span>Отмена подписи документа</span>
        </div>
      }
    >
      <div className="py-2 space-y-4">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Вы действительно хотите отозвать свою подпись? Для внесения исправлений будет создана новая версия документа, а подпись на текущей версии будет отменена.
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Причина отмены (необязательно)
          </label>
          <Input.TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Укажите причину для истории действий (например, «Нужно внести исправления»)..."
            rows={3}
            maxLength={300}
            showCount
            className="w-full text-xs rounded-xl"
          />
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
            className="rounded-xl text-xs bg-rose-600 hover:bg-rose-700"
          >
            Отозвать подпись
          </Button>
        </div>
      </div>
    </Modal>
  );
};
