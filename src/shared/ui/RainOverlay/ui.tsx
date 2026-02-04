import React, { useMemo } from "react";
import "./style.css";
import { WeatherOverlayProps } from "./model";
import { getRandomStyle } from "./lib";
import { createPortal } from "react-dom";

export const RainOverlay: React.FC<WeatherOverlayProps> = ({
  enabled,
  count = 100,
}) => {
  const drops = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      id: index,
      style: getRandomStyle(),
    }));
  }, [count]);

  if (!enabled) return null;

  return createPortal(
    <div className="rain-overlay">
      {drops.map((drop) => (
        <div key={drop.id} className="raindrop" style={drop.style} />
      ))}
    </div>,
    document.body
  );
};
