import React from "react";
import { ConfigProvider, theme } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { Icons, Ui } from "../lib";
import { SmartSearchUI, ISearchItem } from "@shared/ui/SmartSearchModal";
import { TModalType, TModalConfig } from "./drawerActionsModalModel";

interface SmartSearchModalContainerProps {
  isModalOpen: boolean;
  activeModalType: TModalType | null;
  modalConfig: TModalConfig;
  isDarkMode?: boolean;
  onClose: () => void;
  onConfirm: (ids: string[], items: ISearchItem[]) => void;
}

export const SmartSearchModalContainer: React.FC<SmartSearchModalContainerProps> = ({
  isModalOpen,
  activeModalType,
  modalConfig,
  isDarkMode,
  onClose,
  onConfirm,
}) => {
  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Ui.Modal
        open={isModalOpen}
        onCancel={onClose}
        footer={null}
        title={
          <div
            className={`flex items-center gap-3 text-xl font-bold py-3 px-1 ${
              isDarkMode ? "text-gray-100" : "text-gray-800"
            }`}
          >
            {activeModalType === "attach" && (
              <div
                className={`text-2xl ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Icons.MailOutlined />
              </div>
            )}
            {activeModalType === "signer" && (
              <div
                className={`text-2xl ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Icons.UserOutlined />
              </div>
            )}
            {activeModalType === "approvers" && (
              <div
                className={`text-2xl ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <Icons.TeamOutlined />
              </div>
            )}
            <span>{modalConfig.title}</span>
          </div>
        }
        width={modalConfig.mode === "attach" ? 1000 : 500}
        centered
        key={activeModalType}
        zIndex={1100}
        className="smart-search-modal"
        transitionName=""
        maskTransitionName="ant-fade"
        modalRender={(modal) => (
          <AnimatePresence mode="wait">
            {isModalOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                {modal}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        styles={{
          header: {
            borderBottom: isDarkMode
              ? "1px solid #374151"
              : "1px solid #f0f0f0",
            padding: "16px 24px",
            marginBottom: 0,
          },
          body: {
            padding: 0,
            borderRadius: "0 0 24px 24px",
            overflow: "hidden",
          },
        }}
        closeIcon={
          <Icons.CloseOutlined
            style={{
              fontSize: "18px",
              color: isDarkMode ? "#9CA3AF" : undefined,
            }}
          />
        }
      >
        <div className="h-[600px]">
          <SmartSearchUI
            {...modalConfig}
            onConfirm={onConfirm}
            isDarkMode={isDarkMode}
          />
        </div>
      </Ui.Modal>
    </ConfigProvider>
  );
};
