import { useEffect, useState } from "react";
import { Button, Spin } from "antd";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "@shared/lib/toast";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib/hooks";
import { IMfaCodeRequest, IMfaSetupResponse, IMfaStatusResponse } from "@entities/login";
import { MfaModal } from "./MfaModal";

type MfaMode = "idle" | "enable" | "disable";

interface IProps {
  mfaEnabled: boolean;
  isStatusLoading: boolean;
  onRefresh: () => void;
}

export const MfaSecurity = ({
  mfaEnabled,
  isStatusLoading,
  onRefresh,
}: IProps) => {
  const [mode, setMode] = useState<MfaMode>("idle");
  const [code, setCode] = useState("");
  const [setupData, setSetupData] = useState<IMfaSetupResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  const closeModal = () => {
    setMode("idle");
    setCode("");
    setSetupData(null);
    setQrDataUrl("");
  };

  const { mutate: runSetup, isPending: isSettingUp } = useMutationQuery<
    void,
    IMfaSetupResponse
  >({
    url: ApiRoutes.MFA_SETUP,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      onSuccessCb: (data) => setSetupData(data),
      onErrorCb: closeModal,
    },
  });

  const { mutate: runConfirm, isPending: isConfirming } = useMutationQuery<
    IMfaCodeRequest,
    IMfaStatusResponse
  >({
    url: ApiRoutes.MFA_CONFIRM,
    method: "POST",
    messages: {
      success: "Двухфакторная аутентификация включена",
      onSuccessCb: () => {
        closeModal();
        onRefresh();
      },
      onErrorCb: () => setCode(""),
    },
  });

  const { mutate: runDisable, isPending: isDisabling } = useMutationQuery<
    IMfaCodeRequest,
    IMfaStatusResponse
  >({
    url: ApiRoutes.MFA_DISABLE,
    method: "POST",
    messages: {
      success: "Двухфакторная аутентификация отключена",
      onSuccessCb: () => {
        closeModal();
        onRefresh();
      },
      onErrorCb: () => setCode(""),
    },
  });

  useEffect(() => {
    const otpauthUrl = setupData?.otpauth_url;
    if (!otpauthUrl) return;

    let active = true;
    QRCode.toDataURL(otpauthUrl, { width: 200, margin: 1 })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl("");
      });

    return () => {
      active = false;
    };
  }, [setupData?.otpauth_url]);

  const handleEnableClick = () => {
    setMode("enable");
    setCode("");
    setSetupData(null);
    setQrDataUrl("");
    runSetup();
  };

  const handleDisableClick = () => {
    setMode("disable");
    setCode("");
  };

  const handleCopySecret = () => {
    if (!setupData?.secret) return;
    navigator.clipboard
      .writeText(setupData.secret)
      .then(() => toast.success("Ключ скопирован"))
      .catch(() => toast.error("Не удалось скопировать ключ"));
  };

  const handleSubmit = () => {
    if (code.length !== 6) return;
    if (mode === "enable") runConfirm({ code });
    if (mode === "disable") runDisable({ code });
  };

  return (
    <div className="sm:flex justify-between items-center gap-3 pt-4 border-t border-gray-100">
      <span className="flex items-center gap-2">
        {mfaEnabled ? (
          <ShieldCheck className="w-4 h-4 text-green-500" />
        ) : (
          <ShieldAlert className="w-4 h-4 text-amber-500" />
        )}
        Двухфакторная защита
      </span>

      {isStatusLoading ? (
        <Spin size="small" />
      ) : mfaEnabled ? (
        <Button danger size="small" onClick={handleDisableClick}>
          Отключить
        </Button>
      ) : (
        <Button
          type="primary"
          size="small"
          loading={isSettingUp}
          onClick={handleEnableClick}
        >
          Подключить
        </Button>
      )}

      <MfaModal
        isOpen={mode !== "idle"}
        mode={mode}
        onClose={closeModal}
        isSettingUp={isSettingUp}
        isConfirming={isConfirming}
        isDisabling={isDisabling}
        setupData={setupData}
        qrDataUrl={qrDataUrl}
        code={code}
        setCode={setCode}
        handleCopySecret={handleCopySecret}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};
