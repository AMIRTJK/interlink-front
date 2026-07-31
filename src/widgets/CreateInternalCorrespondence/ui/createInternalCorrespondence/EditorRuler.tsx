import React, { useEffect, useRef } from "react";
import {
  PX_PER_CM,
  RULER_DEFAULT_MARGIN,
  RULER_MIN_CONTENT,
  RULER_MIN_MARGIN,
} from "./docLayout";

export const EditorRuler = ({
  pageWidth,
  marginLeft,
  marginRight,
  onChange,
}: {
  pageWidth: number;
  marginLeft: number;
  marginRight: number;
  onChange: (side: "left" | "right", value: number) => void;
}) => {
  const H = 30;
  const baseY = H - 1;
  const contentStart = marginLeft;
  const contentEnd = pageWidth - marginRight;

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<null | "left" | "right">(null);

  // Перетаскивание маркеров полей: слушатели на window, чтобы тянуть можно было
  // и за пределами линейки. Значение зажимаем (минимальное поле и минимальная
  // ширина колонки набора) и прокидываем наверх — там пересчитается раскладка и
  // пагинация.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const side = dragRef.current;
      const box = containerRef.current;
      if (!side || !box) return;
      const x = e.clientX - box.getBoundingClientRect().left;
      if (side === "left") {
        const max = pageWidth - marginRight - RULER_MIN_CONTENT;
        onChange("left", Math.round(Math.min(Math.max(x, RULER_MIN_MARGIN), max)));
      } else {
        const max = pageWidth - marginLeft - RULER_MIN_CONTENT;
        onChange(
          "right",
          Math.round(Math.min(Math.max(pageWidth - x, RULER_MIN_MARGIN), max)),
        );
      }
    };
    const onUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        document.body.style.cursor = "";
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [pageWidth, marginLeft, marginRight, onChange]);

  const startDrag = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = side;
    document.body.style.cursor = "ew-resize";
  };

  const majors: { x: number; label: number }[] = [];
  const minors: number[] = [];
  const stepsLeft = Math.floor(contentStart / PX_PER_CM);
  const stepsRight = Math.ceil((pageWidth - contentStart) / PX_PER_CM);
  for (let cm = -stepsLeft; cm <= stepsRight; cm++) {
    const x = Math.round(contentStart + cm * PX_PER_CM) + 0.5;
    if (x >= 0.5 && x <= pageWidth - 0.5) majors.push({ x, label: cm });
    const half = Math.round(contentStart + (cm + 0.5) * PX_PER_CM) + 0.5;
    if (half >= 0.5 && half <= pageWidth - 0.5) minors.push(half);
  }

  const handleStyle = (x: number): React.CSSProperties => ({
    position: "absolute",
    top: 0,
    left: x - 6,
    width: 12,
    height: H,
    cursor: "ew-resize",
    zIndex: 3,
  });
  const gripStyle: React.CSSProperties = {
    position: "absolute",
    left: 4,
    top: 0,
    width: 4,
    height: H,
    background: "#3b82f6",
    borderRadius: 2,
    boxShadow: "0 1px 2px rgba(15,23,42,0.35)",
  };

  return (
    <div
      ref={containerRef}
      className="select-none"
      style={{
        position: "sticky",
        top: 8,
        zIndex: 20,
        width: pageWidth,
        height: H,
        marginBottom: 12,
        background: "#fff",
        border: "1px solid rgba(148,163,184,0.35)",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <svg width={pageWidth} height={H} style={{ display: "block" }}>
        {/* Поля страницы — затенённые зоны слева/справа */}
        <rect x={0} y={0} width={contentStart} height={H} fill="rgba(148,163,184,0.16)" />
        <rect
          x={contentEnd}
          y={0}
          width={Math.max(0, pageWidth - contentEnd)}
          height={H}
          fill="rgba(148,163,184,0.16)"
        />
        {/* Мелкие деления (полсантиметра) */}
        {minors.map((x, i) => (
          <line key={`mn${i}`} x1={x} y1={baseY} x2={x} y2={baseY - 4} stroke="rgba(100,116,139,0.55)" />
        ))}
        {/* Крупные деления и подписи (см) */}
        {majors.map(({ x, label }, i) => (
          <g key={`mj${i}`}>
            <line x1={x} y1={baseY} x2={x} y2={baseY - 8} stroke="rgba(71,85,105,0.9)" />
            {label > 0 && (
              <text x={x + 2} y={11} fontSize={8} fill="#64748b" fontFamily="system-ui, sans-serif">
                {label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Перетаскиваемые маркеры полей (двойной клик — сброс к 80px) */}
      <div
        onMouseDown={startDrag("left")}
        onDoubleClick={() => onChange("left", RULER_DEFAULT_MARGIN)}
        title="Левое поле — потяните, чтобы сузить/расширить область текста (двойной клик — сброс)"
        style={handleStyle(contentStart)}
      >
        <div style={gripStyle} />
      </div>
      <div
        onMouseDown={startDrag("right")}
        onDoubleClick={() => onChange("right", RULER_DEFAULT_MARGIN)}
        title="Правое поле — потяните, чтобы сузить/расширить область текста (двойной клик — сброс)"
        style={handleStyle(contentEnd)}
      >
        <div style={gripStyle} />
      </div>
    </div>
  );
};
