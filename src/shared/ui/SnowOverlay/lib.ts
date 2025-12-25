export const getRandomStyle = (): React.CSSProperties => {
  const size = Math.random() * 25 + 20 + "px";
  const left = Math.random() * 100 + "vw";
  const animationDuration = Math.random() * 3 + 2 + "s";
  const animationDelay = Math.random() * 5 + "s";
  const opacity = Math.random() * 0.5 + 0.3;

  return {
    "--snow-size": size,
    "--snow-left": left,
    "--snow-duration": animationDuration,
    "--snow-delay": animationDelay,
    "--snow-opacity": opacity,
  } as React.CSSProperties;
};
