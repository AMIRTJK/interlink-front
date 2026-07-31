import React from "react";
import { If } from "@shared/ui";
import { PreviewApprover } from "./incomingPreviewModalModel";

interface IProps {
  previewSigners: PreviewApprover[];
  previewApprovers: PreviewApprover[];
  activeApprover: PreviewApprover | null;
  signedCount: number;
  totalCount: number;
  onToggleApprover: (a: PreviewApprover) => void;
  onOpenFullPanel: () => void;
}

export const PreviewApproversQuickBar: React.FC<IProps> = ({
  previewSigners,
  previewApprovers,
  activeApprover,
  signedCount,
  totalCount,
  onToggleApprover,
  onOpenFullPanel,
}) => {
  return (
    <div
      style={{
        background: "white",
        borderBottom: "1px solid #f1f5f9",
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
        flexWrap: "wrap",
      }}
    >
      <If is={previewSigners.length > 0}>
        <>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Подписывающий:
          </span>
          {previewSigners.map((a, i) => (
            <button
              key={`sig-${i}`}
              type="button"
              onClick={() => onToggleApprover(a)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "3px 10px 3px 4px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: a.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 8,
                  fontWeight: 700,
                }}
              >
                {a.initials}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#334155" }}>
                {a.shortName}
              </span>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: a.signed ? "#4ade80" : "#fbbf24",
                }}
              />
            </button>
          ))}

          <If is={previewApprovers.length > 0}>
            <div
              style={{
                width: 1,
                height: 18,
                background: "#e2e8f0",
                margin: "0 6px",
              }}
            />
          </If>
        </>
      </If>

      <If is={previewApprovers.length > 0}>
        <>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Согласующие:
          </span>
          {previewApprovers.slice(0, 10).map((a, i) => (
            <button
              key={`app-${i}`}
              type="button"
              onClick={() => onToggleApprover(a)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: "3px 10px 3px 4px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: a.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 8,
                  fontWeight: 700,
                }}
              >
                {a.initials}
              </div>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#334155" }}>
                {a.shortName}
              </span>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: a.signed ? "#4ade80" : "#fbbf24",
                }}
              />
            </button>
          ))}

          <If is={previewApprovers.length > 10}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#64748b",
                background: "#f1f5f9",
                padding: "2px 8px",
                borderRadius: 12,
              }}
            >
              +{previewApprovers.length - 10}
            </span>
          </If>
        </>
      </If>

      <span
        style={{
          marginLeft: "auto",
          fontSize: 11,
          background: "#f0fdf4",
          color: "#16a34a",
          border: "1px solid #bbf7d0",
          borderRadius: 20,
          padding: "2px 10px",
          flexShrink: 0,
        }}
      >
        Подписали {signedCount} из {totalCount}
      </span>
      <button
        type="button"
        onClick={onOpenFullPanel}
        style={{
          fontSize: 11,
          color: "#6366f1",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          textDecoration: "underline",
          flexShrink: 0,
        }}
      >
        Смотреть всех →
      </button>
    </div>
  );
};
