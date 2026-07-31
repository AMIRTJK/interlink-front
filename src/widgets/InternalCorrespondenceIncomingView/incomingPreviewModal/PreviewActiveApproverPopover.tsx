import React from "react";
import { X, Check, Clock } from "lucide-react";
import { PreviewApprover } from "./incomingPreviewModalModel";

interface IProps {
  activeApprover: PreviewApprover | null;
  onClose: () => void;
}

export const PreviewActiveApproverPopover: React.FC<IProps> = ({
  activeApprover,
  onClose,
}) => {
  if (!activeApprover) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 110,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        background: "white",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        border: "1px solid #e2e8f0",
        padding: 16,
        width: 260,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "#94a3b8",
          display: "flex",
        }}
      >
        <X size={16} />
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: activeApprover.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {activeApprover.initials}
        </div>
        <div>
          <p
            style={{
              fontWeight: 600,
              fontSize: 13,
              color: "#1e293b",
              margin: 0,
            }}
          >
            {activeApprover.name}
          </p>
          <span
            style={{
              fontSize: 10,
              background: "#f1f5f9",
              color: "#475569",
              borderRadius: 20,
              padding: "2px 8px",
            }}
          >
            {activeApprover.role}
          </span>
        </div>
      </div>
      {activeApprover.signed ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            gap: 8,
          }}
        >
          <Check size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
          <div>
            <p
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: "#15803d",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                margin: "0 0 2px",
              }}
            >
              ЭЦП подпись • Действительна
            </p>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#1e293b",
                margin: "0 0 2px",
              }}
            >
              {activeApprover.name}
            </p>
            <p style={{ fontSize: 9, color: "#64748b", margin: "0 0 2px" }}>
              {activeApprover.date}
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 8,
                color: "#94a3b8",
                margin: 0,
              }}
            >
              {activeApprover.cert}
            </p>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 10,
            padding: "10px 12px",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Clock size={18} style={{ color: "#d97706" }} />
          <p
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#92400e",
              margin: 0,
            }}
          >
            Ожидает подписи
          </p>
        </div>
      )}
    </div>
  );
};
