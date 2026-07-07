import { Copy, Loader2, ShieldCheck } from "lucide-react";
import { SettingsModalShell } from "./settings/SettingsModalShell";
import {
  OtpInput,
  PlainButton,
  PrimaryButton,
  useSettingsTheme,
} from "./settings/settingsUi";

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
  const { gradient } = useSettingsTheme();
  const busy = isConfirming || isDisabling;

  return (
    <SettingsModalShell
      isOpen={isOpen}
      onClose={onClose}
      width={400}
      maskClosable={!busy}
      closable={!busy}
      icon={<ShieldCheck className="h-5 w-5" />}
      title={
        mode === "disable"
          ? "Отключение двухфакторной аутентификации"
          : "Подключение двухфакторной аутентификации"
      }
    >
      {mode === "enable" && (
        <div className="space-y-4">
          {isSettingUp || !setupData ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Отсканируйте QR-код в приложении-аутентификаторе (Google
                Authenticator, Microsoft Authenticator или совместимом).
              </p>

              {qrDataUrl && (
                <div className="flex justify-center">
                  <div className="rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700">
                    <img
                      src={qrDataUrl}
                      alt="QR-код для настройки MFA"
                      className="rounded-lg"
                      width={200}
                      height={200}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Или введите ключ вручную:
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                  <code className="flex-1 break-all font-mono text-sm text-slate-700 dark:text-slate-200">
                    {setupData.secret}
                  </code>
                  <button
                    type="button"
                    title="Скопировать"
                    onClick={handleCopySecret}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Введите 6-значный код из приложения:
                </p>
                <OtpInput value={code} onChange={setCode} autoFocus />
              </div>

              <PrimaryButton
                gradient={gradient}
                className="w-full"
                loading={isConfirming}
                disabled={code.length !== 6}
                onClick={handleSubmit}
              >
                Подтвердить
              </PrimaryButton>
            </>
          )}
        </div>
      )}

      {mode === "disable" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Для отключения введите текущий 6-значный код из
            приложения-аутентификатора.
          </p>
          <OtpInput value={code} onChange={setCode} autoFocus />
          <PlainButton
            danger
            className="w-full"
            loading={isDisabling}
            disabled={code.length !== 6}
            onClick={handleSubmit}
          >
            Отключить
          </PlainButton>
        </div>
      )}
    </SettingsModalShell>
  );
};
