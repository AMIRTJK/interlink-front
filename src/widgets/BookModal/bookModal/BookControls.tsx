import React from "react";

interface BookControlsProps {
  isPdf: boolean;
  pageNum: number;
  totalPages: number;
  changePage: (delta: number) => void;
  zoomInput: string;
  adjustZoom: (delta: number) => void;
  handleZoomInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  commitZoom: () => void;
  handleZoomInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const BookControls: React.FC<BookControlsProps> = ({
  isPdf,
  pageNum,
  totalPages,
  changePage,
  zoomInput,
  adjustZoom,
  handleZoomInputChange,
  commitZoom,
  handleZoomInputKeyDown,
}) => {
  return (
    <div className="floating-controls">
      <div className="ctrl-group">
        <button
          className="ctrl-btn"
          disabled={!isPdf || pageNum <= 1}
          onClick={() => changePage(-1)}
        >
          <svg
            className="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span
          className="ctrl-val"
          style={{ opacity: isPdf ? 1 : 0.5 }}
        >
          {isPdf ? `${pageNum} / ${totalPages}` : "- / -"}
        </span>
        <button
          className="ctrl-btn"
          disabled={!isPdf || pageNum >= totalPages}
          onClick={() => changePage(1)}
        >
          <svg
            className="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      <div className="ctrl-sep"></div>

      <div className="ctrl-group">
        <button
          className="ctrl-btn"
          onClick={() => adjustZoom(-0.1)}
        >
          <svg
            className="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        <div className="zoom-input-wrapper">
          <input
            type="number"
            className="zoom-input"
            value={zoomInput}
            min="20"
            max="300"
            onChange={handleZoomInputChange}
            onBlur={commitZoom}
            onKeyDown={handleZoomInputKeyDown}
          />
          <span className="zoom-percent-sign">%</span>
        </div>
        <button
          className="ctrl-btn"
          onClick={() => adjustZoom(0.1)}
        >
          <svg
            className="icon-svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
