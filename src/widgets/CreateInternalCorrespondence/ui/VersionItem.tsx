import React from "react";
import { Check, Shield, Undo } from "lucide-react";
import { cn } from "@shared/lib";
import { If } from "@shared/ui";

interface IProps {
  version: any;
  activeVersionId: number | string | null;
  signedVersionId: number | string | null;
  isSelectingVersion: boolean;
  isSigned: boolean;
  onSelectVersion: (content: string, id: number) => void;
  onSetVersionForSign: (id: number) => void;
}

export const VersionItem = ({
  version,
  activeVersionId,
  signedVersionId,
  isSelectingVersion,
  isSigned,
  onSelectVersion,
  onSetVersionForSign,
}: IProps) => {
  const isRevoked = version.signature_state === "revoked";
  const isCurrentActive = version.id === activeVersionId;
  const isSignedVersion = !isRevoked && version.id === signedVersionId;

  return (
    <div
      onClick={() => onSelectVersion(version.content, version.id)}
      className={cn(
        "flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer group text-xs gap-3",
        isSignedVersion
          ? "bg-emerald-50/60 border-emerald-400 shadow-sm ring-1 ring-emerald-200"
          : isRevoked
            ? "bg-rose-50/40 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
            : isCurrentActive
              ? "bg-blue-50/50 border-blue-500 shadow-sm"
              : "bg-slate-50/40 border-slate-100 hover:bg-slate-50 hover:border-slate-200"
      )}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 border border-white shadow-sm",
          isSignedVersion
            ? "bg-emerald-500 text-white"
            : isRevoked
              ? "bg-rose-100 text-rose-600 border-rose-200"
              : "bg-slate-200 text-slate-600"
        )}
      >
        <If is={isSignedVersion}>
          <Check size={14} />
        </If>
        <If is={isRevoked}>
          <Undo size={12} />
        </If>
        <If is={!isSignedVersion && !isRevoked}>
          {version.author.initials}
        </If>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "font-bold",
              isSignedVersion
                ? "text-emerald-700"
                : isRevoked
                  ? "text-rose-700"
                  : isCurrentActive
                    ? "text-blue-600"
                    : "text-slate-700"
            )}
          >
            Версия {version.versionNumber}
          </span>
          <If is={isSignedVersion}>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500 text-white font-semibold rounded text-[9px] whitespace-nowrap shrink-0">
              <Shield size={9} />
              Подписано
            </span>
          </If>
          <If is={isRevoked}>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-rose-600 font-semibold rounded text-[9px] border border-rose-200 whitespace-nowrap shrink-0">
              <Undo size={9} />
              Подпись отменена
            </span>
          </If>
          <If is={!isSignedVersion && !isRevoked && version.is_selected}>
            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 font-medium rounded text-[9px] border border-emerald-100 whitespace-nowrap shrink-0">
              Для подписи
            </span>
          </If>
        </div>

        <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">
          {version.author.name}
        </p>
        <p className="text-[10px] text-slate-400 truncate">
          {version.author.position} • {new Date(version.date).toLocaleString("ru-RU")}
        </p>
      </div>

      <div
        className="flex items-center gap-1.5 flex-shrink-0 mt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <If is={!isSignedVersion && !isRevoked}>
          <input
            type="checkbox"
            id={`version-sign-${version.id}`}
            className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
            checked={version.is_selected}
            disabled={isSelectingVersion || isSigned}
            onChange={() => onSetVersionForSign(version.id)}
          />
          <label
            htmlFor={`version-sign-${version.id}`}
            className="text-[10px] text-slate-400 select-none cursor-pointer group-hover:text-slate-500"
          >
            Выбрать
          </label>
        </If>
      </div>
    </div>
  );
};
