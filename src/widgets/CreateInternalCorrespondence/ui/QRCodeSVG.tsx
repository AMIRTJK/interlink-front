import React from "react";
import { generateQRMatrix } from "../lib/utils";

export const QRCodeSVG = ({
  value,
  size = 48,
}: {
  value: string;
  size?: number;
}) => {
  const GRID = 21;
  const matrix = generateQRMatrix(value, GRID);
  const cellSize = size / GRID;
  const cells: { x: number; y: number }[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (matrix[row][col])
        cells.push({ x: col * cellSize, y: row * cellSize });
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", flexShrink: 0 }}
      aria-label="QR-код электронной подписи"
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((cell, i) => (
        <rect
          key={i}
          x={cell.x}
          y={cell.y}
          width={cellSize}
          height={cellSize}
          fill="#1e3a8a"
        />
      ))}
    </svg>
  );
};
