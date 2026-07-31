import type { ChangeEvent, ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "../../../lib/utils";
import type { RecipientOption } from "../../../types";

interface IProps {
  wrapperClassName: string;
  label: string;
  placeholder: string;
  onPickFromRegistry: () => void;
  recipients: RecipientOption[];
  onRemove: (recipient: RecipientOption) => void;
  search: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSearchFocus: () => void;
  onSearchBlur: () => void;
  dropdown: ReactNode;
  children?: ReactNode;
}

export const RecipientField = ({
  wrapperClassName,
  label,
  placeholder,
  onPickFromRegistry,
  recipients,
  onRemove,
  search,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  dropdown,
  children,
}: IProps) => (
  <div className={wrapperClassName}>
    <div className="flex items-start gap-3">
      <div className="w-20 flex-shrink-0 flex flex-col gap-1">
        <label className="text-sm font-semibold text-slate-500 pt-2">
          {label}
        </label>
        <button
          type="button"
          onClick={onPickFromRegistry}
          className="flex items-center justify-center px-1.5 py-1 rounded-lg text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors w-16 cursor-pointer"
          title="Выбрать получателей из реестра"
        >
          Выбрать
        </button>
      </div>
      <div className="flex-1 relative overflow-visible">
        <div className="flex flex-wrap gap-2 mb-2">
          {recipients.map((r) => (
            <span
              key={r.id}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                r.color,
              )}
            >
              <span>{r.initials}</span>
              <span>{r.name}</span>
              <button
                onClick={() => onRemove(r)}
                className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <input
          className="w-full text-sm text-slate-700 bg-transparent border-0 outline-none"
          placeholder={placeholder}
          value={search}
          onChange={onSearchChange}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
        />
        {dropdown}
      </div>
      {children}
    </div>
  </div>
);
