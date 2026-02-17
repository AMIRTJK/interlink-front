import React from "react";
import { motion } from "framer-motion";
import { Button } from "antd";
import {
  SaveOutlined,
  EyeOutlined,
  MessageOutlined,
  SendOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { If } from "@shared/ui";
import { ActionButton } from "./ui/ActionButton";

interface IProps {
  onSave?: () => void;
  setShowPreview: (val: boolean) => void;
  setIsInspectorOpen: (val: boolean) => void;
  handleSend: () => void;
  handleInsertQR: () => void;
  onSaveLoading: boolean;
  onSendLoading: boolean;
  isActionsEnabled: boolean;
  isIncoming: boolean;
  isReadOnly: boolean;
  isSentStatusEnabled: boolean;
}

export const ActionToolbar: React.FC<IProps> = ({
  onSave,
  setShowPreview,
  setIsInspectorOpen,
  handleSend,
  onSaveLoading,
  onSendLoading,
  isActionsEnabled,
  isIncoming,
  isReadOnly,
  isSentStatusEnabled = false,
  handleInsertQR,
}) => {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex flex-col"
    >
      <div className="flex flex-col flex-1 items-center justify-start gap-3 px-2 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl bg-white/90 border border-gray-200">
        <If is={!isIncoming}>
          <ActionButton
            icon={<SaveOutlined style={{ fontSize: "18px" }} />}
            label=""
            onClick={onSave}
            tooltip="Сохранить"
            loading={onSaveLoading}
            disabled={isReadOnly}
          />
        </If>

        <ActionButton
          icon={<EyeOutlined style={{ fontSize: "18px" }} />}
          label=""
          onClick={() => setShowPreview(true)}
          tooltip="Предварительный просмотр"
        />

        <ActionButton
          icon={<MessageOutlined style={{ fontSize: "18px" }} />}
          label=""
          onClick={() => setIsInspectorOpen(true)}
          disabled={!isActionsEnabled}
          tooltip="Инспектор"
        />

        <If is={!isIncoming}>
          <ActionButton
            icon={<SendOutlined style={{ fontSize: "18px" }} />}
            label=""
            disabled={!isActionsEnabled || isSentStatusEnabled || !isReadOnly}
            loading={onSendLoading}
            onClick={handleSend}
            tooltip="Отправить"
          />
          {/* <Button
            type="primary"
            loading={onSendLoading}
            disabled={!isActionsEnabled || isSentStatusEnabled || !isReadOnly}
            onClick={handleSend}
            icon={<SendOutlined style={{ transform: "rotate(-30deg)" }} />}
            className="flex items-center justify-center rounded-xl! transition-all! duration-300! hover:brightness-110! shadow-md!"
            style={{
              background:
                isSentStatusEnabled || !isReadOnly
                  ? "none"
                  : "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
              width: "42px",
              height: "42px",
              padding: 0,
            }}
          /> */}
        </If>
        <ActionButton
          icon={<QrcodeOutlined style={{ fontSize: "18px" }} />}
          label=""
          onClick={handleInsertQR}
          disabled={isReadOnly}
          tooltip="Вставить QR-код"
        />
      </div>
    </motion.div>
  );
};
