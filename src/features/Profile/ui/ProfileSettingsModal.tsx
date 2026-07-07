import { Modal } from "antd";
import { MfaSecurity } from "./MfaSecurity";
import { ChangePassword } from "./ChangePassword";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  mfaEnabled: boolean;
  isStatusLoading: boolean;
  onRefresh: () => void;
}

export const ProfileSettingsModal = ({
  isOpen,
  onClose,
  mfaEnabled,
  isStatusLoading,
  onRefresh,
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
        <MfaSecurity mfaEnabled={mfaEnabled} isStatusLoading={isStatusLoading} onRefresh={onRefresh} />
        <ChangePassword />
      </div>
    </Modal>
  );
};
