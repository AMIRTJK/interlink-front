export const getRandomStyle = (): React.CSSProperties => {
  const size = Math.random() * 20 + 15 + "px";
  const left = Math.random() * 100 + "vw";
  const animationDuration = Math.random() * 5 + 5 + "s";
  const animationDelay = Math.random() * 5 + "s";
  const rotation = Math.random() * 360 + "deg";
  const colors = ['#f97316', '#ea580c', '#b45309', '#78350f', '#f59e0b'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    "--leaf-size": size,
    "--leaf-left": left,
    "--leaf-duration": animationDuration,
    "--leaf-delay": animationDelay,
    "--leaf-rotation": rotation,
    "--leaf-color": color,
  } as React.CSSProperties;
};

export const getRandomLeaf = (): string => {
  const icons = ["🍁", "🍂", "🍃"];
  return icons[Math.floor(Math.random() * icons.length)];
};

