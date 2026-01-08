import React, { useMemo } from "react";
import "./style.css";
import { WeatherOverlayProps } from "./model";
import { getRandomStyle, getRandomLeaf } from "./lib";
import { createPortal } from "react-dom";

export const AutumnOverlay: React.FC<WeatherOverlayProps> = ({
  enabled,
  count = 30,
}) => {
  const leaves = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      id: index,
      style: getRandomStyle(),
      icon: getRandomLeaf(),
    }));
  }, [count]);


  if (!enabled) return null;

  return createPortal(
    <div className="autumn-overlay">
      {leaves.map((leaf) => (
        <div key={leaf.id} className="leaf" style={leaf.style}>
          {leaf.icon}
        </div>
      ))}
    </div>,
    document.body
  );

};
