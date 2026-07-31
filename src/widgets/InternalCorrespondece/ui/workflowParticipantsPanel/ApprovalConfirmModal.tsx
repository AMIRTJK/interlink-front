import { ConfigProvider, Input, Modal, theme } from "antd";

interface ApprovalConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSigning?: boolean;
  approvalNote: string;
  setApprovalNote: (val: string) => void;
  isDarkMode?: boolean;
}

export const ApprovalConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSigning,
  approvalNote,
  setApprovalNote,
  isDarkMode,
}: ApprovalConfirmModalProps) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Modal
        open={isOpen}
        onCancel={onClose}
        onOk={onConfirm}
        confirmLoading={isSigning}
        title="Согласование документа"
        okText="Согласовать"
        cancelText="Отмена"
        centered
        destroyOnClose
      >
        <div className="flex flex-col gap-3 py-2">
          <label
            className={`block text-xs font-semibold ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Комментарий к согласованию (необязательно, до 5000 символов):
          </label>
          <Input.TextArea
            rows={4}
            maxLength={5000}
            showCount
            value={approvalNote}
            onChange={(e) => setApprovalNote(e.target.value)}
            placeholder="Введите комментарий к согласованию..."
          />
        </div>
      </Modal>
    </ConfigProvider>
  );
};
