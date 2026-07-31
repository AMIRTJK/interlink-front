import React from "react";

export interface PreviewApprover {
  name: string;
  shortName: string;
  initials: string;
  gradient: string;
  role: string;
  signed: boolean;
  date: string;
  cert: string;
}

export interface ToolbarSection {
  key: string;
  label: string;
  dotClass?: string;
  dotStyle?: React.CSSProperties;
  badge?: number | string;
  isOpen: boolean;
  disabled?: boolean;
  hint?: string;
  onToggle: () => void;
}

export interface IncomingPreviewModalProps {
  subject: string;
  inboundNumber: string;
  lastModified: string;
  html?: string | null;
  fontSize?: number;
  onClose: () => void;
  signatures?: any[];
  approvals?: any[];
  versions?: any[];
  activeVersionId?: number | string | null;
  onSelectVersion?: (versionId: number | string) => void;
  panelsInToolbar?: boolean;
  onTogglePanelsInToolbar?: (value: boolean) => void;
  correspondenceId?: string | number;
  attachments?: any[];
  canCreateAssignment?: boolean;
}

export const GRADIENTS = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #0ea5e9, #6366f1)",
  "linear-gradient(135deg, #10b981, #059669)",
  "linear-gradient(135deg, #f97316, #ef4444)",
  "linear-gradient(135deg, #64748b, #94a3b8)",
];

export const pageWord = (n: number) =>
  n === 1 ? "страница" : n < 5 ? "страницы" : "страниц";
