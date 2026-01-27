import React, { useState } from 'react';
import { Drawer } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import { IActionsModal, TTab, TABS_LIST, actionsList } from './model';
import { DrawerQRCodeSection } from './ui/QRCodeSection';
import { DrawerActionRow } from './ui/DrawerActionRow';
import { SmartTabs } from '@shared/ui/SmartTabs/ui';

import './style.css';

export const DrawerActionsModal: React.FC<IActionsModal> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TTab>('actions');

  return (
    <Drawer
      title="Инспектор"
      placement="right"
      onClose={onClose}
      open={open}
      width={410} // Ширина как на макете
      closeIcon={<CloseOutlined style={{ fontSize: '18px', color: '#1F2937' }} />}
      rootClassName="drawer-floating-root" 
      maskStyle={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.2)', 
        backdropFilter: 'blur(4px)' 
      }}
    >
      <div className="drawer__container h-full flex flex-col">
        <div className="mb-4">
          <SmartTabs 
            items={TABS_LIST}            
            activeKey={activeTab}          
            onChange={(key) => setActiveTab(key as TTab)} 
          />
        </div>

        <div className="drawer__content flex-1">
          {activeTab === 'actions' ? (
            <div className="drawer__content--animate pb-6 flex flex-col gap-1">
              {actionsList.map((item) => (
                <DrawerActionRow 
                  key={item.id} 
                  {...item} 
                />
              ))}
              <DrawerQRCodeSection />
            </div>
          ) : (
            <div className="flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl animate-pulse">
                Контент: {activeTab}+
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};