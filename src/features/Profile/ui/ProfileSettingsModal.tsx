import { Modal } from "antd";
import { MfaSecurity } from "./MfaSecurity";
import { ChangePassword } from "./ChangePassword";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSettingsModal = ({
  isOpen,
  onClose,
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
        <MfaSecurity />
        <ChangePassword />
      </div>
    </Modal>
  );
};
