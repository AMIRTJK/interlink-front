import { useEffect, useState } from "react";
import { Modal, Button, Input, Spin, Tooltip } from "antd";
import { ShieldCheck, ShieldAlert, Copy } from "lucide-react";
import QRCode from "qrcode";
import { toast } from "react-toastify";

import { ApiRoutes } from "@shared/api";
import { useGetQuery, useMutationQuery } from "@shared/lib/hooks";
import {
  IMfaCodeRequest,
  IMfaSetupResponse,
  IMfaStatusResponse,
} from "@entities/login";

type MfaMode = "idle" | "enable" | "disable";

/** Ответ /auth/me — флаг mfa_enabled читаем устойчиво к форме обертки. */
interface IMeResponse {
  data?: {
    user?: { mfa_enabled?: boolean };
    mfa_enabled?: boolean;
  };
}

/**
 * Управление двухфакторной аутентификацией в профиле.
 * Самодостаточный блок: читает статус из /auth/me, ведет flow
 * подключения (setup → QR/secret → confirm) и отключения (code → disable).
 */
export const MfaSecurity = () => {
  const {
    data: meResponse,
    isLoading: isStatusLoading,
    refetch: refetchStatus,
  } = useGetQuery<unknown, IMeResponse>({
    url: ApiRoutes.AUTH_ME,
    useToken: true,
  });

  const mfaEnabled = !!(
    meResponse?.data?.user?.mfa_enabled ?? meResponse?.data?.mfa_enabled
  );

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

  // Шаг 1 подключения: инициализация (secret + otpauth_url для QR)
  const { mutate: runSetup, isPending: isSettingUp } = useMutationQuery<
    void,
    IMfaSetupResponse
  >({
    url: ApiRoutes.MFA_SETUP,
    method: "POST",
    messages: {
      suppressSuccessToast: true,
      onSuccessCb: (data: IMfaSetupResponse) => setSetupData(data),
      onErrorCb: closeModal,
    },
  });

  // Шаг 2 подключения: подтверждение кодом из приложения
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
        refetchStatus();
      },
      onErrorCb: () => setCode(""),
    },
  });

  // Отключение: тоже нужен актуальный код из приложения
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
        refetchStatus();
      },
      onErrorCb: () => setCode(""),
    },
  });

  // Строим QR из otpauth_url, как только пришли данные setup
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

      <Modal
        open={mode !== "idle"}
        onCancel={closeModal}
        footer={null}
        width={400}
        centered
        maskClosable={!isConfirming && !isDisabling}
        title={
          mode === "disable"
            ? "Отключение двухфакторной аутентификации"
            : "Подключение двухфакторной аутентификации"
        }
      >
        {mode === "enable" && (
          <div className="space-y-4">
            {isSettingUp || !setupData ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500">
                  Отсканируйте QR-код в приложении-аутентификаторе (Google
                  Authenticator, Microsoft Authenticator или совместимом).
                </p>

                {qrDataUrl && (
                  <div className="flex justify-center">
                    <img
                      src={qrDataUrl}
                      alt="QR-код для настройки MFA"
                      className="rounded-lg border border-gray-200"
                      width={200}
                      height={200}
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm text-gray-500">
                    Или введите ключ вручную:
                  </p>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                    <code className="flex-1 break-all text-sm font-mono">
                      {setupData.secret}
                    </code>
                    <Tooltip title="Скопировать">
                      <Button
                        type="text"
                        size="small"
                        icon={<Copy className="w-4 h-4" />}
                        onClick={handleCopySecret}
                      />
                    </Tooltip>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Введите 6-значный код из приложения:
                  </p>
                  <Input.OTP
                    length={6}
                    value={code}
                    onChange={setCode}
                    formatter={(str) => str.replace(/\D/g, "")}
                  />
                </div>

                <Button
                  type="primary"
                  block
                  loading={isConfirming}
                  disabled={code.length !== 6}
                  onClick={handleSubmit}
                >
                  Подтвердить
                </Button>
              </>
            )}
          </div>
        )}

        {mode === "disable" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Для отключения введите текущий 6-значный код из
              приложения-аутентификатора.
            </p>
            <Input.OTP
              length={6}
              value={code}
              onChange={setCode}
              formatter={(str) => str.replace(/\D/g, "")}
            />
            <Button
              danger
              block
              loading={isDisabling}
              disabled={code.length !== 6}
              onClick={handleSubmit}
            >
              Отключить
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
