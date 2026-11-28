import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, LockKeyholeOpen } from "lucide-react";
import { Tooltip } from "@shared/ui";
import { LOCK_TEXTS, UNLOCK_ERROR_TEXTS, type TUnlockResult } from "../lockModel";
import { LOCK_TOOLTIP_Z_INDEX } from "../model";

interface IProps {
  isDark: boolean;
  onUnlock: (password: string) => Promise<TUnlockResult>;
}

const PASSWORD_INPUT_ID = "session-lock-password";

export const UnlockForm = ({ isDark, onUnlock }: IProps) => {
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    const result = await onUnlock(password);
    // Пароль не держим в состоянии дольше одной проверки — ни при успехе, ни при ошибке.
    setPassword("");
    if (result !== "ok") {
      setError(UNLOCK_ERROR_TEXTS[result]);
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(null);
  };

  const toggleLabel = isPasswordVisible ? LOCK_TEXTS.hidePassword : LOCK_TEXTS.showPassword;
  const fieldTone = isDark
    ? "bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-within:border-white/50"
    : "bg-white/70 border-black/10 text-slate-800 placeholder:text-slate-400 focus-within:border-th-accent-400";
  const errorTone = error ? "border-rose-400!" : "";

  return (
    <form onSubmit={handleSubmit} className="w-full mt-5 flex flex-col gap-2" noValidate>
      <label htmlFor={PASSWORD_INPUT_ID} className="sr-only">
        {LOCK_TEXTS.passwordLabel}
      </label>
      <div className={`flex items-center gap-1 rounded-full border pl-4 pr-1 py-1 transition-colors ${fieldTone} ${errorTone}`}>
        <input
          id={PASSWORD_INPUT_ID}
          type={isPasswordVisible ? "text" : "password"}
          value={password}
          onChange={(event) => handlePasswordChange(event.target.value)}
          placeholder={LOCK_TEXTS.passwordPlaceholder}
          autoComplete="current-password"
          autoFocus
          readOnly={isSubmitting}
          aria-busy={isSubmitting}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${PASSWORD_INPUT_ID}-error` : undefined}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm py-1.5"
        />
        <Tooltip title={toggleLabel} zIndex={LOCK_TOOLTIP_Z_INDEX}>
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            aria-label={toggleLabel}
            aria-pressed={isPasswordVisible}
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-th-accent-400 ${isDark ? "text-white/60 hover:bg-white/10" : "text-slate-500 hover:bg-black/5"}`}
          >
            {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </Tooltip>
        <Tooltip title={LOCK_TEXTS.submit} zIndex={LOCK_TOOLTIP_Z_INDEX}>
          <button
            type="submit"
            disabled={!password || isSubmitting}
            aria-label={LOCK_TEXTS.submit}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-r from-violet-600 to-th-accent-600 text-white shadow-md cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-th-accent-400"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LockKeyholeOpen size={16} />}
          </button>
        </Tooltip>
      </div>
      <p
        id={`${PASSWORD_INPUT_ID}-error`}
        role="alert"
        className="min-h-4 text-xs font-medium text-rose-500"
      >
        {error}
      </p>
    </form>
  );
};
