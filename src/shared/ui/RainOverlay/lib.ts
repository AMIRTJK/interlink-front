import React from "react";

export const getRandomStyle = (): React.CSSProperties => {
  const left = Math.random() * 100 + "vw";
  const animationDuration = Math.random() * 0.5 + 0.5 + "s";
  const animationDelay = Math.random() * 2 + "s";
  const opacity = Math.random() * 0.4 + 0.2;
  const height = Math.random() * 20 + 20 + "px";

  return {
    "--rain-left": left,
    "--rain-duration": animationDuration,
    "--rain-delay": animationDelay,
    "--rain-opacity": opacity,
    "--rain-height": height,
  } as React.CSSProperties;
};
