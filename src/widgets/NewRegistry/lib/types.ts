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

// Итоговый конфиг, который возвращает хук
export interface RegistryConfig {
  primary: FieldDefinition;
  secondary: FieldDefinition;
  badges: BadgeDefinition[];
  // Функция, возвращающая пункты меню для конкретной записи
  getActions: (record: any, onMove?: (id: number) => void) => MenuProps["items"];
  filters: IFilterItem[];
}
