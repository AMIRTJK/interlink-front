import React, { useState, useEffect } from "react";
import { Modal, Input, Button, ConfigProvider, theme } from "antd";
import { Check } from "lucide-react";
import {
  ApprovalVersionNotice,
  IApprovalVersionWarning,
} from "@entities/correspondence";
import { useIsDarkMode } from "@shared/lib";
import { If } from "@shared/ui";

interface IApprovalConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => Promise<void> | void;
  isLoading?: boolean;
  versionNumber?: number | string | null;
  approvalVersionWarning?: IApprovalVersionWarning | null;
}

export const ApprovalConfirmModal: React.FC<IApprovalConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  versionNumber,
  approvalVersionWarning,
}) => {
  const [comment, setComment] = useState("");
  const isDarkMode = useIsDarkMode();

  useEffect(() => {
    if (isOpen) {
      setComment("");
    }
  }, [isOpen]);

  const handleOk = async () => {
    await onConfirm(comment);
  };

  const handleCancel = () => {
    if (!isLoading) {
      setComment("");
      onClose();
    }
  };

  const titleText = versionNumber
    ? `Согласование документа (Версия ${versionNumber})`
    : "Согласование документа";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Modal
        open={isOpen}
        onCancel={handleCancel}
        footer={null}
        centered
        width={480}
        destroyOnClose
        title={
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-base">
            <Check size={18} />
            <span>{titleText}</span>
          </div>
        }
      >
        <div className="py-2 space-y-4">
          <If is={Boolean(approvalVersionWarning?.hasMismatch)}>
            <ApprovalVersionNotice
              warning={approvalVersionWarning ?? null}
              isDarkMode={isDarkMode}
            />
          </If>

          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Комментарий к согласованию (опционально):
            </label>
            <Input.TextArea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Введите комментарий к согласованию..."
              rows={4}
              maxLength={5000}
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
              type="primary"
              onClick={handleOk}
              loading={isLoading}
              className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700! border-emerald-600!"
            >
              Согласовать
            </Button>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};
