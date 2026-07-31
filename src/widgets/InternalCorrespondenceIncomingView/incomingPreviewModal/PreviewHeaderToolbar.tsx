import React from "react";
import { X, Plus, Minus } from "lucide-react";

interface IProps {
  subject: string;
  inboundNumber: string;
  scaleInput: string;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onScaleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScaleInputFocus: () => void;
  onScaleInputBlur: () => void;
  onScaleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClose: () => void;
}

export const PreviewHeaderToolbar: React.FC<IProps> = ({
  subject,
  inboundNumber,
  scaleInput,
  onZoomOut,
  onZoomIn,
  onScaleInputChange,
  onScaleInputFocus,
  onScaleInputBlur,
  onScaleInputKeyDown,
  onClose,
}) => {
  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid #e2e8f0",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
          minWidth: 0,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#1e293b",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {subject || "Без темы"}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            color: "#475569",
            padding: "2px 10px",
            borderRadius: 20,
            flexShrink: 0,
          }}
        >
          {inboundNumber}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          onClick={onZoomOut}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "white",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Minus size={15} />
        </button>
        <input
          type="text"
          value={scaleInput}
          onChange={onScaleInputChange}
          onFocus={onScaleInputFocus}
          onBlur={onScaleInputBlur}
          onKeyDown={onScaleInputKeyDown}
          style={{
            fontFamily: "monospace",
            fontSize: 12,
            color: "#475569",
            width: 44,
            textAlign: "center",
            background: "transparent",
            border: "none",
            outline: "none",
            borderRadius: 4,
            padding: "2px 0",
          }}
          className="focus:bg-slate-50 focus:ring-1 focus:ring-slate-200 transition-colors"
        />
        <button
          type="button"
          onClick={onZoomIn}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "white",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus size={15} />
        </button>
        <div
          style={{
            width: 1,
            height: 18,
            background: "#e2e8f0",
            margin: "0 4px",
          }}
        />
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            background: "#f1f5f9",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
