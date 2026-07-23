import React from "react";
import { MenuProps } from "antd";
import { IFilterItem } from "@shared/ui";

// Определение одного поля
export interface FieldDefinition {
  label: string;
  icon: React.ReactNode;
  render: (data: any) => React.ReactNode;
}

// Определение бейджа
export interface BadgeDefinition {
  label: string;
  icon: React.ReactNode;
  color: string;
  render: (data: any) => React.ReactNode;
}

// Колонка со списком пользователей (ответили / переслали / ознакомились).
// Рендерится как ячейка «Получатели»: превью + окно со всем списком по клику.
export interface PeopleColumn {
  key: string;
  label: string;
  icon: React.ReactNode;
  // Tailwind-класс фона аватара (bg-blue-600 и т.п.)
  avatarBg: string;
  getUsers: (data: any) => any[];
}

// Итоговый конфиг, который возвращает хук
export interface RegistryConfig {
  // Реестр входящих (для условной отрисовки колонок в RegistryLayout).
  isIncoming?: boolean;
  primary: FieldDefinition;
  secondary: FieldDefinition;
  badges: BadgeDefinition[];
  // Необязательные колонки-списки пользователей (только у входящих).
  people?: PeopleColumn[];
  // Функция, возвращающая пункты меню для конкретной записи
  getActions: (record: any, onMove?: (id: number) => void) => MenuProps["items"];
  filters: IFilterItem[];
}
