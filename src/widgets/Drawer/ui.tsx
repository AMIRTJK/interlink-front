import React, { useState } from 'react';
import { Drawer } from 'antd';
import { 
  CloseOutlined, 
} from '@ant-design/icons';

import { IActionsModal, TTab, TABS_LIST, actionsList } from './model';
import { DrawerQRCodeSection } from './ui/QRCodeSection';
import { DrawerActionRow } from './ui/DrawerActionRow';
import { SmartTabs } from '@shared/ui/SmartTabs/ui';
import './style.css'
export const DrawerActionsModal: React.FC<IActionsModal> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TTab>('actions');

  return (
    <Drawer
      title="Инспектор"
      placement="right"
      onClose={onClose}
      open={open}
      width={400}
      closeIcon={<CloseOutlined style={{ fontSize: '18px', color: '#9CA3AF' }} />}
      className="drawer-root"
      maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(2px)' }}
    >
      <div className="drawer__container h-full flex flex-col">
        
        <SmartTabs 
          items={TABS_LIST}            
          activeKey={activeTab}          
          onChange={(key) => setActiveTab(key as TTab)} 
        />

        <div className="drawer__content flex-1 mt-2">
          {activeTab === 'actions' ? (
            <div className="drawer__content--animate pb-6">
              {actionsList.map((item) => (
                <DrawerActionRow 
                  key={item.id} 
                  {...item} 
                />
              ))}
              <DrawerQRCodeSection />
            </div>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                Контент: {activeTab}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};