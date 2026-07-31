import React from "react";
import { pageWord } from "./incomingPreviewModalModel";

interface IProps {
  sheetCount: number;
  lastModified: string;
}

export const PreviewStatusBar: React.FC<IProps> = ({
  sheetCount,
  lastModified,
}) => {
  return (
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
        Формат: PDF • {sheetCount} {pageWord(sheetCount)} • ЭЦП подписано
      </span>
      <span style={{ fontSize: 11, color: "#94a3b8" }}>
        Последнее изменение: {lastModified}
      </span>
    </div>
  );
};
