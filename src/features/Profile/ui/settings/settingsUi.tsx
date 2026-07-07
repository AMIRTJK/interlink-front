import {
  ButtonHTMLAttributes,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useRef,
  useState,
} from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { THEMES } from "@widgets/layout/ui/designSettings";
import { useDesignSettings } from "@widgets/layout/ui/useDesignSettings";

/**
 * Оформление окон настроек: тема из «Выберите тему» + тёмный режим.
 * accent — акцентный цвет активной темы, gradient — её градиент для кнопок.
 */
export const useSettingsTheme = () => {
  const { currentTheme, isDarkMode } = useDesignSettings();
  const theme = THEMES[currentTheme] || THEMES.emerald;
  const accent = isDarkMode ? theme.dark : theme.light;
  return { accent, gradient: theme.gradient, isDarkMode };
};

/* ------------------------------- Кнопки ------------------------------- */

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  gradient: string;
  children: ReactNode;
}

export const PrimaryButton = ({
  loading,
  gradient,
  disabled,
  children,
  className = "",
  ...rest
}: PrimaryButtonProps) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={`relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${gradient} px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${className}`}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

interface PlainButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
  loading?: boolean;
  children: ReactNode;
}

export const PlainButton = ({
  danger,
  loading,
  disabled,
  children,
  className = "",
  ...rest
}: PlainButtonProps) => (
  <button
    {...rest}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
      danger
        ? "border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
        : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
    } ${className}`}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

/* ------------------------------ Текст. поле --------------------------- */

interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
}

export const PasswordField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, required, error, value, onChange, className = "", ...rest }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className={className}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="ml-0.5 text-rose-500">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            {...rest}
            ref={ref}
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 pr-10 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 ${
              error
                ? "border-rose-400 dark:border-rose-500/60"
                : "border-slate-200 dark:border-slate-700"
            }`}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);
PasswordField.displayName = "PasswordField";

/* --------------------------------- OTP -------------------------------- */

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const OtpInput = ({
  value,
  onChange,
  length = 6,
  disabled,
  autoFocus,
}: OtpInputProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const setChar = (index: number, char: string) => {
    const chars = value.split("");
    chars[index] = char;
    onChange(chars.join("").slice(0, length).replace(/\D/g, ""));
  };

  const handleChange = (index: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setChar(index, "");
      return;
    }
    // Ввод/вставка одной или нескольких цифр начиная с текущей ячейки.
    const chars = value.split("");
    let cursor = index;
    for (const d of digits) {
      if (cursor >= length) break;
      chars[cursor] = d;
      cursor += 1;
    }
    onChange(chars.join("").slice(0, length).replace(/\D/g, ""));
    const next = Math.min(cursor, length - 1);
    refs.current[next]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1)
      refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className="h-12 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 text-center text-lg font-semibold text-slate-900 outline-none transition-colors focus:border-[color:var(--accent)] focus:ring-2 focus:ring-[color:var(--accent)]/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      ))}
    </div>
  );
};
