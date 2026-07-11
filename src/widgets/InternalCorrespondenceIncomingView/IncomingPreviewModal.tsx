import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Plus, Minus, Users, Check, Clock } from "lucide-react";
import {
  paginateHtml,
  contentStyle,
  CONTENT_CLASS,
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_PAD_H,
  PAGE_PAD_V,
} from "./lib";

// Окно «Просмотр» для ВХОДЯЩЕГО письма. Визуально 1-в-1 с макетом
// (InboxPreviewModal): светлая тема, тулбар с зумом, миниатюры страниц, полоса
// «Согласующие» + всплывающая панель и статус-бар. В отличие от макета тело
// письма не мок, а реальное — раскладывается постранично той же логикой
// (paginateHtml), что и холст просмотра и предпросмотр исходящего.

interface PreviewApprover {
  name: string;
  shortName: string;
  initials: string;
  gradient: string;
  role: string;
  signed: boolean;
  date: string;
  cert: string;
}

const pageWord = (n: number) =>
  n === 1 ? "страница" : n < 5 ? "страницы" : "страниц";

export const IncomingPreviewModal = ({
  subject,
  inboundNumber,
  lastModified,
  html,
  fontSize = 14,
  onClose,
  signatures = [],
  approvals = [],
}: {
  subject: string;
  inboundNumber: string;
  lastModified: string;
  html?: string | null;
  fontSize?: number;
  onClose: () => void;
  signatures?: any[];
  approvals?: any[];
}) => {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeApprover, setActiveApprover] = useState<PreviewApprover | null>(
    null,
  );
  const [approversPanelOpen, setApproversPanelOpen] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName) return "??";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getShortName = (fullName: string) => {
    if (!fullName) return "";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[1][0]}. ${parts[0]}`;
    }
    return fullName;
  };

  const GRADIENTS = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #0ea5e9, #6366f1)",
    "linear-gradient(135deg, #10b981, #059669)",
    "linear-gradient(135deg, #f97316, #ef4444)",
    "linear-gradient(135deg, #64748b, #94a3b8)",
  ];

  const getCertSnippet = (initials: string) => {
    const hex = initials
      .split("")
      .map((c) => c.charCodeAt(0).toString(16).toUpperCase())
      .join("");
    return `SN: ${hex}A3F9...C12D`;
  };

  const previewApproversList = useMemo(() => {
    const list: PreviewApprover[] = [];

    (signatures || []).forEach((sig: any, idx: number) => {
      const user = sig.user || sig.approver || {};
      const name = user.full_name || "Неизвестно";
      const initials = getInitials(name);
      const isSigned = sig.status === "signed";
      let signedDateStr = "";
      if (isSigned) {
        const dateVal = sig.signed_at || sig.updated_at;
        if (dateVal) {
          const d = new Date(dateVal);
          const pad = (n: number) => String(n).padStart(2, "0");
          signedDateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      }

      list.push({
        name,
        shortName: getShortName(name),
        initials,
        gradient: GRADIENTS[idx % GRADIENTS.length],
        role: "Подписывающий",
        signed: isSigned,
        date: signedDateStr,
        cert: getCertSnippet(initials),
      });
    });

    (approvals || []).forEach((app: any, idx: number) => {
      const user = app.approver || app.user || {};
      const name = user.full_name || "Неизвестно";
      const initials = getInitials(name);
      const isSigned = app.status === "approved";
      let signedDateStr = "";
      if (isSigned) {
        const dateVal = app.signed_at || app.updated_at;
        if (dateVal) {
          const d = new Date(dateVal);
          const pad = (n: number) => String(n).padStart(2, "0");
          signedDateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      }

      list.push({
        name,
        shortName: getShortName(name),
        initials,
        gradient: GRADIENTS[(idx + (signatures?.length || 0)) % GRADIENTS.length],
        role: "Согласующий",
        signed: isSigned,
        date: signedDateStr,
        cert: getCertSnippet(initials),
      });
    });

    return list;
  }, [signatures, approvals]);

  const [panelSearch, setPanelSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "signer" | "approver">("all");

  const previewSigners = useMemo(() => {
    return previewApproversList.filter((a) => a.role === "Подписывающий");
  }, [previewApproversList]);

  const previewApprovers = useMemo(() => {
    return previewApproversList.filter((a) => a.role === "Согласующий");
  }, [previewApproversList]);

  const filteredSigners = useMemo(() => {
    if (roleFilter === "approver") return [];
    return previewSigners;
  }, [previewSigners, roleFilter]);

  const filteredApprovers = useMemo(() => {
    if (roleFilter === "signer") return [];
    if (!panelSearch.trim()) return previewApprovers;
    return previewApprovers.filter((a) =>
      a.name.toLowerCase().includes(panelSearch.toLowerCase())
    );
  }, [previewApprovers, panelSearch, roleFilter]);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Раскладку считаем синхронно при рендере — paginateHtml создаёт и удаляет
  // собственный временный измеритель в DOM, поэтому её безопасно звать из useMemo.
  const { pages, stamp } = useMemo(
    () => paginateHtml(html, fontSize),
    [html, fontSize],
  );

  // Страница со штампом должна существовать, даже если на ней нет текста.
  const sheets = [...pages];
  if (stamp) while (sheets.length <= stamp.pageIndex) sheets.push("");
  if (!sheets.length) sheets.push("");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const signedCount = previewApproversList.filter((a) => a.signed).length;
  const totalCount = previewApproversList.length;
  const progressPct = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;

  const zoomOut = () =>
    setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10));
  const zoomIn = () =>
    setZoom((z) => Math.min(2.5, Math.round((z + 0.1) * 10) / 10));

  const scrollToPage = (idx: number) => {
    setCurrentPage(idx);
    pageRefs.current[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999 }}>
      {/* Подложка */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      {/* Окно */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          bottom: 16,
          background: "#f1f5f9",
          borderRadius: 20,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Тулбар */}
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
              onClick={zoomOut}
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
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                color: "#475569",
                width: 44,
                textAlign: "center",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={zoomIn}
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

        {/* Полоса согласующих */}
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
          {/* Подписывающий */}
          {previewSigners.length > 0 && (
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
                  onClick={() =>
                    setActiveApprover(activeApprover?.name === a.name ? null : a)
                  }
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
                  <span
                    style={{ fontSize: 11, fontWeight: 500, color: "#334155" }}
                  >
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
              
              {/* Визуальный вертикальный разделитель */}
              {previewApprovers.length > 0 && (
                <div
                  style={{
                    width: 1,
                    height: 18,
                    background: "#e2e8f0",
                    margin: "0 6px",
                  }}
                />
              )}
            </>
          )}

          {/* Согласующие */}
          {previewApprovers.length > 0 && (
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
                  onClick={() =>
                    setActiveApprover(activeApprover?.name === a.name ? null : a)
                  }
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
                  <span
                    style={{ fontSize: 11, fontWeight: 500, color: "#334155" }}
                  >
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

              {/* Если согласующих больше 10 */}
              {previewApprovers.length > 10 && (
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
              )}
            </>
          )}

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
            onClick={() => setApproversPanelOpen(true)}
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

        {/* Поповер согласующего */}
        {activeApprover && (
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
              onClick={() => setActiveApprover(null)}
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
                <Check
                  size={18}
                  style={{ color: "#16a34a", flexShrink: 0 }}
                />
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
                  <p
                    style={{ fontSize: 9, color: "#64748b", margin: "0 0 2px" }}
                  >
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
        )}

        {/* Контент */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            position: "relative",
          }}
        >
          {/* Боковая лента миниатюр */}
          <div
            style={{
              width: 88,
              background: "white",
              borderRight: "1px solid #e2e8f0",
              padding: "16px 0",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "center",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            {sheets.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToPage(idx)}
                style={{
                  width: 60,
                  height: 80,
                  background: "white",
                  border:
                    currentPage === idx
                      ? "2px solid #6366f1"
                      : "2px solid #e2e8f0",
                  borderRadius: 4,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  transition: "border-color 0.15s",
                }}
              >
                <div
                  style={{
                    width: 38,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {[100, 70, 100, 55, 100, 80, 60].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: 1.5,
                        background: "#e2e8f0",
                        borderRadius: 1,
                        width: `${w}%`,
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#94a3b8",
                  }}
                >
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>

          {/* Область прокрутки страниц */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "32px 24px",
              gap: 24,
              background: "#e2e8f0",
            }}
          >
            {sheets.map((pageHtml, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  pageRefs.current[idx] = el;
                }}
                style={{
                  width: PAGE_WIDTH * zoom,
                  height: PAGE_HEIGHT * zoom,
                  flexShrink: 0,
                  transition: "width 0.15s ease, height 0.15s ease",
                }}
              >
                <div
                  style={{
                    width: PAGE_WIDTH,
                    height: PAGE_HEIGHT,
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: PAGE_WIDTH,
                      height: PAGE_HEIGHT,
                      background: "white",
                      boxShadow: "0 4px 32px rgba(0,0,0,0.12)",
                      padding: `${PAGE_PAD_V}px ${PAGE_PAD_H}px`,
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className={CONTENT_CLASS}
                      style={{ ...contentStyle(fontSize), height: "100%" }}
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />

                    {/* Рисунок ЭЦП на своей странице */}
                    {stamp && stamp.pageIndex === idx && stamp.html && (
                      <div
                        style={{
                          position: "absolute",
                          left: PAGE_PAD_H + stamp.x,
                          top: PAGE_PAD_V + stamp.y,
                          width: stamp.width,
                          height: "auto",
                          overflow: "hidden",
                          pointerEvents: "none",
                          zIndex: 50,
                        }}
                        dangerouslySetInnerHTML={{ __html: stamp.html }}
                      />
                    )}

                    <span
                      style={{
                        position: "absolute",
                        bottom: 24,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        fontSize: 11,
                        color: "#94a3b8",
                        fontFamily: "system-ui, sans-serif",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      Страница {idx + 1} из {sheets.length}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Выезжающая панель «Согласующие» */}
          {approversPanelOpen && (
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
                  onClick={() => setApproversPanelOpen(false)}
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontSize: 10, color: "#94a3b8", margin: 0 }}>
                    Подписали {signedCount} из {totalCount}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "#f1f5f9", padding: 2, borderRadius: 8 }}>
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
                        onClick={() => setRoleFilter(tab)}
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
                    onChange={(e) => setPanelSearch(e.target.value)}
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
                  {panelSearch && (
                    <button
                      onClick={() => setPanelSearch("")}
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
                  )}
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
                {/* Секция: Подписывающий */}
                {filteredSigners.length > 0 && (
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
                              <p
                                style={{ fontSize: 10, color: "#64748b", margin: 0 }}
                              >
                                {a.role}
                              </p>
                            </div>
                          </div>
                          {a.signed ? (
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
                          ) : (
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
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Разделитель между разделами */}
                {filteredSigners.length > 0 && filteredApprovers.length > 0 && (
                  <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
                )}

                {/* Секция: Согласующие */}
                {filteredApprovers.length > 0 && (
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
                              <p
                                style={{ fontSize: 10, color: "#64748b", margin: 0 }}
                              >
                                {a.role}
                              </p>
                            </div>
                          </div>
                          {a.signed ? (
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
                          ) : (
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
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ничего не найдено */}
                {filteredSigners.length === 0 && filteredApprovers.length === 0 && (panelSearch || roleFilter !== "all") && (
                  <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 20 }}>
                    Ничего не найдено
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Статус-бар */}
        <div
          style={{
            background: "white",
            borderTop: "1px solid #f1f5f9",
            padding: "7px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            Формат: PDF • {sheets.length} {pageWord(sheets.length)} • ЭЦП
            подписано
          </span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            Последнее изменение: {lastModified}
          </span>
        </div>
      </div>
    </div>
  );
};
