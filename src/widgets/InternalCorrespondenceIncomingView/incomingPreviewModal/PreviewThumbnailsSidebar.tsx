import React from "react";

interface IProps {
  sheets: string[];
  currentPage: number;
  onScrollToPage: (idx: number) => void;
}

export const PreviewThumbnailsSidebar: React.FC<IProps> = ({
  sheets,
  currentPage,
  onScrollToPage,
}) => {
  return (
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
          onClick={() => onScrollToPage(idx)}
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
  );
};
