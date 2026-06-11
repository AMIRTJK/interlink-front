import type { ReactNode } from "react";

// Описание вкладки HR-модуля
export interface IHrTab {
  key: string;
  label: string;
  path: string; // абсолютный путь роута
  icon: ReactNode;
}

// Пропсы шапки HR (заголовок + счётчик). Без title — только таб-бар.
export interface IHrHeaderProps {
  title?: string;
  subtitle?: ReactNode;
}
