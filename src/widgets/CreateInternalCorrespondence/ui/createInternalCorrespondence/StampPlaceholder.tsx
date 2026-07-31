import type { MouseEvent, RefObject } from "react";

import { DSStamp } from "../DSStamp";

interface IProps {
  stampRef: RefObject<HTMLDivElement | null>;
  onMouseDown: (e: MouseEvent) => void;
  onResizeMouseDown: (e: MouseEvent) => void;
  marginLeft: number;
  pagePadV: number;
  stampPos: { x: number; y: number };
  stampSize: { width: number; height: number };
  signerName: string;
  signerInitials: string;
}

export const StampPlaceholder = ({
  stampRef,
  onMouseDown,
  onResizeMouseDown,
  marginLeft,
  pagePadV,
  stampPos,
  stampSize,
  signerName,
  signerInitials,
}: IProps) => (
  <div
    ref={stampRef}
    onMouseDown={onMouseDown}
    title="Перетащите, чтобы выбрать место для ЭЦП"
    style={{
      position: "absolute",
      // stampPos хранится в координатах редактора; placeholder —
      // потомок холста страницы, поэтому добавляем поля страницы,
      // чтобы он визуально совпал с местом будущей печати.
      left: marginLeft + stampPos.x,
      top: pagePadV + stampPos.y,
      width: stampSize.width,
      height: stampSize.height,
      zIndex: 50,
      cursor: "move",
      userSelect: "none",
      borderRadius: 8,
      boxShadow: "0 0 0 2px rgba(59,130,246,0.45)",
    }}
  >
    <DSStamp
      name={signerName}
      certSerial={`SN-2026-${signerInitials}-84201`}
      signedAt={new Date().toLocaleDateString("ru-RU")}
      validUntil="аз 20.03.2025 то 20.03.2026"
    />
    {/* Угловой маркер масштабирования (только при размещении,
        до подписания). На вшитый/печатный штамп не влияет —
        это лишь аффорданс редактора. */}
    <div
      onMouseDown={onResizeMouseDown}
      title="Потяните, чтобы изменить размер ЭЦП"
      style={{
        position: "absolute",
        right: -6,
        bottom: -6,
        width: 14,
        height: 14,
        borderRadius: 3,
        background: "#3b82f6",
        border: "2px solid #fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        cursor: "nwse-resize",
        zIndex: 51,
      }}
    />
  </div>
);
