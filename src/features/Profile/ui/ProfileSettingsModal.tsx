import { Modal, Switch } from "antd";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  navbarVariant: "default" | "ios";
  setNavbarVariant: (v: "default" | "ios") => void;
}

export const ProfileSettingsModal = ({
  isOpen,
  onClose,
  navbarVariant,
  setNavbarVariant,
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
        <div className="hidden! sm:flex justify-between items-center pt-4 border-t border-gray-100">
          <span>Стиль iOS 📱</span>
          <Switch
            checked={navbarVariant === "ios"}
            onChange={(checked) => setNavbarVariant(checked ? "ios" : "default")}
          />
        </div>
      </div>
    </Modal>
  );
};
