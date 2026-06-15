import { Modal, Switch } from "antd";
import { MfaSecurity } from "./MfaSecurity";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  navbarVariant: "default" | "ios";
  setNavbarVariant: (v: "default" | "ios") => void;
  tabMode: "on" | "off";
  setTabMode: (v: "on" | "off") => void;
}


export const ProfileSettingsModal = ({
  isOpen,
  onClose,
  navbarVariant,
  setNavbarVariant,
  tabMode,
  setTabMode,
}: IProps) => {
  return (
    <Modal
      title="Настройки"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={300}
      closable
      maskClosable
      centered
      className="ios-settings-modal"
      transitionName="ant-zoom"
    >
      <div className="space-y-2">
        {/* IOS навигация... */}
        <div className="sm:flex justify-between items-center pt-4 border-t border-gray-100">
          <span>Стиль iOS 📱</span>
          <Switch
            checked={navbarVariant === "ios"}
            onChange={(checked) => setNavbarVariant(checked ? "ios" : "default")}
          />
        </div>

        {/* Режим вкладок (независимый) */}
        <div className="sm:flex justify-between items-center pt-4 border-t border-gray-100 transition-opacity">
          <span>Режим вкладок 🧭</span>
          <Switch
            checked={tabMode === "on"}
            onChange={(checked) => setTabMode(checked ? "on" : "off")}
          />
        </div>

        {/* Безопасность: двухфакторная аутентификация (MFA) */}
        <MfaSecurity />
      </div>

    </Modal>
  );
};
