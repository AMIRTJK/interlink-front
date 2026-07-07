import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "@shared/lib/toast";
import { ApiRoutes } from "@shared/api";
import { useMutationQuery } from "@shared/lib/hooks";
import { IMfaCodeRequest, IMfaSetupResponse, IMfaStatusResponse } from "@entities/login";
import { MfaModal } from "./MfaModal";
import { PlainButton, PrimaryButton, useSettingsTheme } from "./settings/settingsUi";

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
  const { gradient } = useSettingsTheme();
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
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            mfaEnabled
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
              : "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400"
          }`}
        >
          {mfaEnabled ? (
            <ShieldCheck className="h-5 w-5" />
          ) : (
            <ShieldAlert className="h-5 w-5" />
          )}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Двухфакторная защита
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mfaEnabled ? "Включена" : "Отключена"}
          </p>
        </div>
      </div>

      {isStatusLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      ) : mfaEnabled ? (
        <PlainButton danger onClick={handleDisableClick}>
          Отключить
        </PlainButton>
      ) : (
        <PrimaryButton
          gradient={gradient}
          loading={isSettingUp}
          onClick={handleEnableClick}
        >
          Подключить
        </PrimaryButton>
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
