import React from "react";
import { motion } from "framer-motion";
import { Button } from "antd";
import {
  SaveOutlined,
  EyeOutlined,
  MessageOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { ActionButton } from "./ui/ActionButton";

interface IProps {
  onSave?: () => void;
  setShowPreview: (val: boolean) => void;
  setIsInspectorOpen: (val: boolean) => void;
  handleSend: () => void;
  mode?: "create" | "show";
  onSaveLoading: boolean;
  isActionsEnabled: boolean;
}

export const ActionToolbar: React.FC<IProps> = ({
  onSave,
  setShowPreview,
  setIsInspectorOpen,
  handleSend,
  onSaveLoading,
  mode = "create",
  isActionsEnabled,
}) => {
  return (
    <motion.div
      initial={{ y: 80, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      className="fixed bottom-8 left-1/2 z-40"
    >
      <div className="flex items-center gap-1 px-3 py-2 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl bg-white/90 border border-white">
        <ActionButton
          icon={<SaveOutlined style={{ fontSize: "18px" }} />}
          label="Сохранить"
          onClick={onSave}
          loading={onSaveLoading}
        />
        <ActionButton
          icon={<EyeOutlined style={{ fontSize: "18px" }} />}
          label="Просмотр"
          onClick={() => setShowPreview(true)}
        />

        <ActionButton
          icon={<MessageOutlined style={{ fontSize: "18px" }} />}
          label="Инспектор"
          onClick={() => setIsInspectorOpen(true)}
          disabled={!isActionsEnabled}
        />
        {mode !== "show" && (
          <Button
            type="primary"
            size="large"
            disabled={!isActionsEnabled}
            onClick={handleSend}
            icon={<SendOutlined style={{ transform: "rotate(-30deg)" }} />}
            className="ml-2 rounded-full border-none flex items-center font-semibold shadow-lg shadow-purple-200/50 transition-all duration-300 hover:brightness-110 hover:shadow-purple-300 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
              height: "42px",
              paddingLeft: "24px",
              paddingRight: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Отправить
          </Button>
        )}
      </div>
    </motion.div>
  );
};
