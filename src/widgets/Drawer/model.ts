import React from 'react';

export interface IActionsModal {
  open: boolean;
  onClose: () => void;
}

export interface IActionItem {
  id: string;
  label: string;      
  placeholder: string; 
  icon: React.ReactNode;
  onClick?: () => void;
}

export type TTab = 'actions' | 'metadata' | 'comments' | 'chat';

export const TABS_LIST: { key: TTab; label: string }[] = [
  { key: 'actions', label: 'Действия' },
  { key: 'metadata', label: 'Метаданные' },
  { key: 'comments', label: 'Комментарии' },
  { key: 'chat', label: 'Чат' },
];