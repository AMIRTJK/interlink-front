/**
 * Типы данных и списки табов для компонента DrawerActionsModal.
 */
import { ISearchItem } from "@shared/ui";
import React from "react";

export interface IActionsModal {
  open: boolean;
  onClose: () => void;
  docId?: string;
  mode?: "create" | "show";
  onReply?: () => void;
  onRefresh?: () => void;
}

export interface IActionItem {
  id: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  onClick?: () => void;
  render?: () => React.ReactNode;
}

export type TTab = "actions" | "comments" | "chat";

export const TABS_LIST: { key: TTab; label: string }[] = [
  { key: "actions", label: "Действия" },
  { key: "comments", label: "Комментарии" },
  { key: "chat", label: "Чат" },
];

// Мок-данные
