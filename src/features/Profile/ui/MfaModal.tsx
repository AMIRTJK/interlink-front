import { Modal, Button, Input, Spin, Tooltip } from "antd";
import { Copy } from "lucide-react";

interface IMfaModalProps {
  isOpen: boolean;
  mode: "idle" | "enable" | "disable";
  onClose: () => void;
  isSettingUp: boolean;
  isConfirming: boolean;
  isDisabling: boolean;
  setupData: { secret: string } | null;
  qrDataUrl: string;
  code: string;
  setCode: (c: string) => void;
  handleCopySecret: () => void;
  handleSubmit: () => void;
}

export const MfaModal = ({
  isOpen,
  mode,
  onClose,
  isSettingUp,
  isConfirming,
  isDisabling,
  setupData,
  qrDataUrl,
  code,
  setCode,
  handleCopySecret,
  handleSubmit,
}: IMfaModalProps) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
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
  );
};
