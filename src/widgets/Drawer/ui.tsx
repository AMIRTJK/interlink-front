import React, { useState } from 'react';
import { Drawer } from 'antd';
import { 
  CloseOutlined, 
  FileTextOutlined, 
  SearchOutlined, 
  UserOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { IActionItem, IActionsModal, TTab } from './model';
import { DrawerTabs } from './ui/DrawerTabs';
import { DrawerQRCodeSection } from './ui/QRCodeSection';
import { DrawerActionRow } from './ui/DrawerActionRow';

export const DrawerActionsModal: React.FC<IActionsModal> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TTab>('actions');

  const actionsList: IActionItem[] = [
    {
      id: 'blank',
      label: 'Бланк организации',
      placeholder: 'Выберите бланк',
      icon: <FileTextOutlined />,
      onClick: () => console.log('Click Blank'),
    },
    {
      id: 'attach',
      label: 'Прикрепить письмо',
      placeholder: 'Поиск писем для прикрепления',
      icon: <SearchOutlined />,
      onClick: () => console.log('Click Attach'),
    },
    {
      id: 'signer',
      label: 'Подписывающий',
      placeholder: 'Выберите подписывающего',
      icon: <UserOutlined />,
      onClick: () => console.log('Click Signer'),
    },
    {
      id: 'approvers',
      label: 'Согласующие',
      placeholder: 'Выберите согласующих',
      icon: <TeamOutlined />,
      onClick: () => console.log('Click Approvers'),
    },
  ];

  return (
    <Drawer
      title={<span className="text-xl font-bold text-gray-800">Инспектор</span>}
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
      closeIcon={<CloseOutlined className="text-gray-400 hover:text-gray-600 text-lg" />}
      styles={{
        header: { borderBottom: 'none', padding: '28px 28px 0 28px' },
        body: { padding: '28px', backgroundColor: '#F9FAFB' }, // Серый фон
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.2)' }
      }}
      className="font-sans"
    >
      <DrawerTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'actions' ? (
        <div className="flex flex-col animate-fade-in">
          
          {actionsList.map((item) => (
            <DrawerActionRow 
              key={item.id} 
              {...item} 
            />
          ))}

          <DrawerQRCodeSection />
          
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-400 border-2 border-dashed rounded-xl">
            Контент для {activeTab}
        </div>
      )}
    </Drawer>
  );
};