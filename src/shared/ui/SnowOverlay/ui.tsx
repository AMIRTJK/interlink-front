import React, { useMemo } from "react";
import "./style.css";
import { SnowOverlayProps } from "./model";
import { getRandomStyle } from "./lib";
import { createPortal } from "react-dom";

export const SnowOverlay: React.FC<SnowOverlayProps> = ({
  enabled,
  snowflakeCount = 50,
}) => {
  const snowflakes = useMemo(() => {
    return Array.from({ length: snowflakeCount }).map((_, index) => ({
      id: index,
      style: getRandomStyle(),
    }));
  }, [snowflakeCount]);

  if (!enabled) return null;

  return createPortal(
    <div className="snow-overlay">
      {snowflakes.map((flake) => (
        <div key={flake.id} className="snowflake" style={flake.style}>
          ❅
        </div>
      ))}
    </div>,
    document.body
  );
};
