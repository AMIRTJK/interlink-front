import { FileTextOutlined, SearchOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { ApiRoutes } from '@shared/api';
import { SmartDropDown } from '@shared/ui/SmartDropDown';
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
  render?: () => React.ReactNode; 
}

export type TTab = 'actions' | 'metadata' | 'comments' | 'chat';

export const TABS_LIST: { key: TTab; label: string }[] = [
  { key: 'actions', label: 'Действия' },
  { key: 'metadata', label: 'Метаданные' },
  { key: 'comments', label: 'Комментарии' },
  { key: 'chat', label: 'Чат' },
];


// Мок-данные
export const actionsList: IActionItem[] = [
   {
  id: 'blank',
  label: 'Бланк организации',
  placeholder: 'Выберите бланк',
  icon: <FileTextOutlined />,
  render: () => (
    <SmartDropDown 
      url={`${ApiRoutes.GET_FOLDERS}`} 
      placeholder="Выберите бланк"
      icon={<FileTextOutlined />}
      onSelect={(val) => console.log('Выбран ID:', val)}
      transformResponse={(data: any) => {
        // Если структура сложная, правим тут
        const list = data?.items || [];
        return list.map((i: any) => ({ value: i.id, label: i.name }));
      }}
    />
  ),
},
    {
      id: 'attach',
      label: 'Прикрепить письмо',
      placeholder: 'Поиск писем для прикрепления',
      icon: <SearchOutlined />,
    },
    {
      id: 'signer',
      label: 'Подписывающий',
      placeholder: 'Выберите подписывающего',
      icon: <UserOutlined />,
    },
    {
      id: 'approvers',
      label: 'Согласующие',
      placeholder: 'Выберите согласующих',
      icon: <TeamOutlined />,
    },
  ];