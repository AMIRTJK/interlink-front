import React from "react";

import { cn } from "../../../lib/utils";

interface IProps {
  incomingOpen: boolean;
  setIncomingOpen: (open: boolean) => void;
  handleOpenIncoming: () => void;
  versionsOpen: boolean;
  setVersionsOpen: (open: boolean) => void;
  handleOpenVersions: () => void;
  attachmentsCount: number;
  attachmentsOpen: boolean;
  setAttachmentsOpen: (open: boolean) => void;
  handleOpenAttachments: () => void;
  signerOpen: boolean;
  setSignerOpen: (open: boolean) => void;
  handleOpenSigner: () => void;
  approversOpen: boolean;
  setApproversOpen: (open: boolean) => void;
  handleOpenApprovers: () => void;
}

export const SectionCylindersBar = ({
  incomingOpen,
  setIncomingOpen,
  handleOpenIncoming,
  versionsOpen,
  setVersionsOpen,
  handleOpenVersions,
  attachmentsCount,
  attachmentsOpen,
  setAttachmentsOpen,
  handleOpenAttachments,
  signerOpen,
  setSignerOpen,
  handleOpenSigner,
  approversOpen,
  setApproversOpen,
  handleOpenApprovers,
}: IProps) => (
  <div className="px-3 py-2 border-b border-slate-100 bg-white flex flex-wrap items-center gap-2 font-sans">
    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1 select-none">
      Разделы
    </span>
    {[
      {
        key: "incoming",
        label: "Входящие письма",
        dotClass: "bg-blue-500",
        dotStyle: undefined as React.CSSProperties | undefined,
        isOpen: incomingOpen,
        onToggle: () =>
          incomingOpen ? setIncomingOpen(false) : handleOpenIncoming(),
      },
      {
        key: "versions",
        label: "История версий",
        dotClass: "bg-amber-500",
        dotStyle: undefined,
        isOpen: versionsOpen,
        onToggle: () =>
          versionsOpen ? setVersionsOpen(false) : handleOpenVersions(),
      },
      {
        key: "attachments",
        label:
          attachmentsCount > 0
            ? `Вложения (${attachmentsCount})`
            : "Вложения",
        dotClass: "bg-indigo-500",
        dotStyle: undefined,
        isOpen: attachmentsOpen,
        onToggle: () =>
          attachmentsOpen
            ? setAttachmentsOpen(false)
            : handleOpenAttachments(),
      },
      {
        key: "signer",
        label: "Подписывающий",
        dotClass: "",
        dotStyle: { backgroundColor: "oklch(0.6 0.25 250)" },
        isOpen: signerOpen,
        onToggle: () =>
          signerOpen ? setSignerOpen(false) : handleOpenSigner(),
      },
      {
        key: "approvers",
        label: "Согласующие",
        dotClass: "",
        dotStyle: { backgroundColor: "oklch(0.828 0.189 84.429)" },
        isOpen: approversOpen,
        onToggle: () =>
          approversOpen ? setApproversOpen(false) : handleOpenApprovers(),
      },
    ].map((p) => (
      <button
        key={p.key}
        type="button"
        onClick={p.onToggle}
        className={cn(
          "flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer select-none",
          p.isOpen
            ? "bg-slate-800 border-slate-800 text-white shadow-sm"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300",
        )}
      >
        <span
          className={cn(
            "w-2.5 h-2.5 rounded-full flex-shrink-0",
            p.dotClass,
          )}
          style={p.dotStyle}
        />
        <span>{p.label}</span>
      </button>
    ))}
  </div>
);
