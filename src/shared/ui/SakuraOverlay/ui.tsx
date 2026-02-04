import React, { useMemo } from "react";
import "./style.css";
import { WeatherOverlayProps } from "./model";
import { getRandomStyle, getRandomPetal } from "./lib";
import { createPortal } from "react-dom";

export const SakuraOverlay: React.FC<WeatherOverlayProps> = ({
  enabled,
  count = 70,
}) => {
  const petals = useMemo(() => {
    return Array.from({ length: count }).map((_, index) => ({
      id: index,
      style: getRandomStyle(),
      icon: getRandomPetal(),
    }));
  }, [count]);


  if (!enabled) return null;

  return createPortal(
    <div className="sakura-overlay">
      {petals.map((petal) => (
        <div key={petal.id} className="petal" style={petal.style}>
          {petal.icon}
        </div>
      ))}
    </div>,
    document.body
  );
};
