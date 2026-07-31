import React from "react";
import { ConfigProvider, theme, Modal } from "antd";
import { Editor } from "./Editor";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  initialContent: string;
  onChange: (data: string) => void;
  type: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  initialContent,
  onChange,
  type,
}) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Modal
        title="Предварительный просмотр"
        open={isOpen}
        onCancel={onClose}
        footer={null}
        centered
        width="100%"
        destroyOnClose
        bodyStyle={{ height: "90vh", padding: 0, overflow: "hidden" }}
      >
        <div className="flex justify-center">
          <Editor
            isDarkMode={isDarkMode}
            onChange={onChange}
            initialContent={initialContent}
            type={type}
            isPreviewOpen={isOpen}
          />
        </div>
      </Modal>
    </ConfigProvider>
  );
};
