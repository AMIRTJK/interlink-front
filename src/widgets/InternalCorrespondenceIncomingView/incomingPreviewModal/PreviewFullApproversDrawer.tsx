import React from "react";
import { Users, X, Clock } from "lucide-react";
import { If } from "@shared/ui";
import { PreviewApprover } from "./incomingPreviewModalModel";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  signedCount: number;
  totalCount: number;
  progressPct: number;
  roleFilter: "all" | "signer" | "approver";
  onRoleFilterChange: (tab: "all" | "signer" | "approver") => void;
  panelSearch: string;
  onPanelSearchChange: (value: string) => void;
  filteredSigners: PreviewApprover[];
  filteredApprovers: PreviewApprover[];
}

export const PreviewFullApproversDrawer: React.FC<IProps> = ({
  isOpen,
  onClose,
  signedCount,
  totalCount,
  progressPct,
  roleFilter,
  onRoleFilterChange,
  panelSearch,
  onPanelSearchChange,
  filteredSigners,
  filteredApprovers,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        height: "100%",
        width: 300,
        background: "white",
        borderLeft: "1px solid #e2e8f0",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 5,
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: "#1e293b",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Users size={16} style={{ color: "#6366f1" }} />
          Этапы обработки документа
        </span>
        <button
          type="button"
          onClick={onClose}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            color: "#64748b",
            display: "flex",
          }}
        >
          <X size={18} />
        </button>
      </div>
      <div
        style={{
          padding: "12px 20px 4px",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            background: "#e2e8f0",
            borderRadius: 8,
            height: 6,
            overflow: "hidden",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "#4ade80",
              borderRadius: 8,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
            Подписали {signedCount} из {totalCount}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 12,
            background: "#f1f5f9",
            padding: 2,
            borderRadius: 8,
          }}
        >
          {(["all", "signer", "approver"] as const).map((tab) => {
            const isActive = roleFilter === tab;
            const labels = {
              all: "Все",
              signer: "Подписывающие",
              approver: "Согласующие",
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onRoleFilterChange(tab)}
                style={{
                  flex: 1,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 8px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "white" : "transparent",
                  color: isActive ? "#1e293b" : "#64748b",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Поиск согласующего..."
            value={panelSearch}
            onChange={(e) => onPanelSearchChange(e.target.value)}
            style={{
              width: "100%",
              fontSize: 12,
              padding: "6px 10px 6px 10px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <If is={Boolean(panelSearch)}>
            <button
              onClick={() => onPanelSearchChange("")}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#94a3b8",
                padding: 0,
                display: "flex",
              }}
            >
              <X size={12} />
            </button>
          </If>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <If is={filteredSigners.length > 0}>
          <div>
            <h4
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 8px 4px",
              }}
            >
              Подписывающий
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredSigners.map((a, i) => (
                <div
                  key={`sig-card-${i}`}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: a.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {a.initials}
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: "#1e293b",
                          margin: 0,
                        }}
                      >
                        {a.name}
                      </p>
                      <p style={{ fontSize: 10, color: "#64748b", margin: 0 }}>
                        {a.role}
                      </p>
                    </div>
                  </div>
                  <If is={a.signed}>
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontSize: 10,
                      }}
                    >
                      <p
                        style={{
                          color: "#15803d",
                          fontWeight: 700,
                          margin: "0 0 2px",
                          textTransform: "uppercase",
                          fontSize: 9,
                          letterSpacing: "0.08em",
                        }}
                      >
                        ЭЦП действительна
                      </p>
                      <p
                        style={{
                          color: "#1e293b",
                          fontWeight: 600,
                          margin: "0 0 2px",
                        }}
                      >
                        {a.name}
                      </p>
                      <p style={{ color: "#64748b", margin: "0 0 2px" }}>
                        {a.date}
                      </p>
                      <p
                        style={{
                          fontFamily: "monospace",
                          color: "#94a3b8",
                          fontSize: 8,
                          margin: 0,
                        }}
                      >
                        {a.cert}
                      </p>
                    </div>
                  </If>
                  <If is={!a.signed}>
                    <div
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: 8,
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Clock size={13} style={{ color: "#d97706" }} />
                      <span
                        style={{
                          fontSize: 11,
                          color: "#92400e",
                          fontWeight: 500,
                        }}
                      >
                        Ожидает подписи
                      </span>
                    </div>
                  </If>
                </div>
              ))}
            </div>
          </div>
        </If>

        <If is={filteredSigners.length > 0 && filteredApprovers.length > 0}>
          <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
        </If>

        <If is={filteredApprovers.length > 0}>
          <div>
            <h4
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                margin: "0 0 8px 4px",
              }}
            >
              Согласующие
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredApprovers.map((a, i) => (
                <div
                  key={`app-card-${i}`}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: a.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {a.initials}
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: "#1e293b",
                          margin: 0,
                        }}
                      >
                        {a.name}
                      </p>
                      <p style={{ fontSize: 10, color: "#64748b", margin: 0 }}>
                        {a.role}
                      </p>
                    </div>
                  </div>
                  <If is={a.signed}>
                    <div
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: 8,
                        padding: "8px 10px",
                        fontSize: 10,
                      }}
                    >
                      <p
                        style={{
                          color: "#15803d",
                          fontWeight: 700,
                          margin: "0 0 2px",
                          textTransform: "uppercase",
                          fontSize: 9,
                          letterSpacing: "0.08em",
                        }}
                      >
                        ЭЦП действительна
                      </p>
                      <p
                        style={{
                          color: "#1e293b",
                          fontWeight: 600,
                          margin: "0 0 2px",
                        }}
                      >
                        {a.name}
                      </p>
                      <p style={{ color: "#64748b", margin: "0 0 2px" }}>
                        {a.date}
                      </p>
                      <p
                        style={{
                          fontFamily: "monospace",
                          color: "#94a3b8",
                          fontSize: 8,
                          margin: 0,
                        }}
                      >
                        {a.cert}
                      </p>
                    </div>
                  </If>
                  <If is={!a.signed}>
                    <div
                      style={{
                        background: "#fffbeb",
                        border: "1px solid #fde68a",
                        borderRadius: 8,
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Clock size={13} style={{ color: "#d97706" }} />
                      <span
                        style={{
                          fontSize: 11,
                          color: "#92400e",
                          fontWeight: 500,
                        }}
                      >
                        Ожидает подписи
                      </span>
                    </div>
                  </If>
                </div>
              ))}
            </div>
          </div>
        </If>

        <If
          is={
            filteredSigners.length === 0 &&
            filteredApprovers.length === 0 &&
            Boolean(panelSearch || roleFilter !== "all")
          }
        >
          <p
            style={{
              fontSize: 11,
              color: "#94a3b8",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            Ничего не найдено
          </p>
        </If>
      </div>
    </div>
  );
};
