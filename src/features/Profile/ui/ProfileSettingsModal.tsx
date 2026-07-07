import { Settings } from "lucide-react";
import { SettingsModalShell } from "./settings/SettingsModalShell";
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
    <SettingsModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Настройки"
      icon={<Settings className="h-5 w-5" />}
      width={420}
    >
      <div className="space-y-3">
        <MfaSecurity
          mfaEnabled={mfaEnabled}
          isStatusLoading={isStatusLoading}
          onRefresh={onRefresh}
        />
        <ChangePassword />
      </div>
    </SettingsModalShell>
  );
};
