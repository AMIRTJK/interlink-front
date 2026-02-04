import React from 'react';

export const getRandomStyle = (): React.CSSProperties => {
  const size = Math.random() * 15 + 10 + "px";
  const left = Math.random() * 100 + "vw";
  const animationDuration = Math.random() * 10 + 10 + "s"; // Slower, more gentle
  const animationDelay = Math.random() * 5 + "s";
  const rotation = Math.random() * 360 + "deg";
  const colors = ['#fbcfe8', '#f9a8d4', '#f472b6', '#fce7f3', '#ffc0cb'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    "--sakura-size": size,
    "--sakura-left": left,
    "--sakura-duration": animationDuration,
    "--sakura-delay": animationDelay,
    "--sakura-rotation": rotation,
    "--sakura-color": color,
  } as React.CSSProperties;
};

export const getRandomPetal = (): string => {
  // Using unicode characters for sakura
  const icons = ["🌸"]; // Removed 💮 as requested
  return icons[Math.floor(Math.random() * icons.length)];
};
