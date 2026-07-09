import React from "react";
import { ChevronDown } from "lucide-react";
import { If } from "@shared/ui";

interface IFormItemProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormItem = ({ label, error, required, className = "", children }: IFormItemProps) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 flex items-center gap-0.5">
        <If is={required}>
          <span className="text-red-500">*</span>
        </If>
        {label}
      </label>
      {children}
      <If is={error}>
        <span className="text-[11px] text-red-500 font-medium">
          {error}
        </span>
      </If>
    </div>
  );
};

export const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => {
  return (
    <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
      {icon}
      <span>{children}</span>
    </p>
  );
};

const inputShell = "w-full rounded-xl border text-sm outline-none transition-colors";

const getInputClasses = (hasError?: boolean, disabled?: boolean) => {
  if (disabled) return `${inputShell} border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-900 text-gray-400 dark:text-slate-600 cursor-not-allowed`;
  if (hasError) return `${inputShell} border-red-300 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10 text-gray-800 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20`;
  return `${inputShell} border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900/50 text-gray-800 dark:text-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20`;
};

interface IIconInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  hasError?: boolean;
}

export const IconInput = ({ value, onChange, icon, hasError, ...rest }: IIconInputProps) => {
  return (
    <div className="relative">
      <If is={icon}>
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-700 pointer-events-none flex">
          {icon}
        </span>
      </If>
      <input
        {...rest}
        value={value ?? ""}
        onChange={onChange}
        className={`${getInputClasses(hasError, rest.disabled)} h-11 ${icon ? "pl-9 pr-3" : "px-3"}`}
      />
    </div>
  );
};

interface IPhoneInputProps {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  id?: string;
  hasError?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export const PhoneInput = ({ value, onChange, placeholder, id, hasError, disabled, readOnly }: IPhoneInputProps) => {
  const onlyDigits9 = (v: string) => (v || "").replace(/\D/g, "").slice(0, 9);
  return (
    <div className="flex items-stretch">
      <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-900 text-sm text-gray-500 dark:text-slate-500 select-none">
        +992
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        value={value ?? ""}
        onChange={(e) => onChange?.(onlyDigits9(e.target.value))}
        className={`flex-1 min-w-0 h-11 px-3 rounded-r-xl border text-sm outline-none transition-colors ${
          disabled
            ? "border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-900 text-gray-400 dark:text-slate-600 cursor-not-allowed"
            : readOnly
              ? "border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-900 text-gray-500 dark:text-slate-400 cursor-default"
            : hasError
              ? "border-red-300 bg-red-50/30 dark:border-red-900/50 dark:bg-red-950/10 text-gray-800 dark:text-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-500/20"
              : "border-gray-200 bg-gray-50 dark:border-slate-800 dark:bg-slate-900/50 text-gray-800 dark:text-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
        }`}
      />
    </div>
  );
};

interface ISegOption {
  value: string;
  label: string;
  activeClass: string;
  showCheck?: boolean;
}

interface ISegmentControlProps {
  value?: string;
  onChange?: (v: string) => void;
  options: ISegOption[];
}

export const SegmentControl = ({ value, onChange, options }: ISegmentControlProps) => {
  return (
    <div className="flex gap-2">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            type="button"
            key={o.value}
            onClick={() => onChange?.(o.value)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 h-11 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              active
                ? o.activeClass
                : "bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-500 border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            <If is={active && o.showCheck}>
              <ChevronDown size={12} />
            </If>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
};

interface ITextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  hasError?: boolean;
}

export const TextArea = ({ value, onChange, hasError, ...rest }: ITextAreaProps) => {
  return (
    <textarea
      {...rest}
      value={value ?? ""}
      onChange={onChange}
      className={`${getInputClasses(hasError, rest.disabled)} py-2.5 px-3 min-h-20 resize-y`}
    />
  );
};
