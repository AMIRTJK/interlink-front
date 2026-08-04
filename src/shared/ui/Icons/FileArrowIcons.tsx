import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

/** Иконка: лист бумаги со стрелкой вправо (для поля "Отправитель") */
export const FileArrowRight: React.FC<IconProps> = ({ size = 12, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13h7" />
    <path d="m12 10 3 3-3 3" />
  </svg>
);

/** Иконка: лист бумаги со стрелкой влево (для поля "Получатель" / "Получатели") */
export const FileArrowLeft: React.FC<IconProps> = ({ size = 12, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M16 13H9" />
    <path d="m12 10-3 3 3 3" />
  </svg>
);
