/**
 * Основной компонент инспектора (Drawer).
 * Управляет логикой выбора писем, подписывающих и согласующих.
 */
import React, { useState } from 'react';
import { Drawer, Modal } from 'antd';
import { 
  CloseOutlined, 
  PaperClipOutlined, 
  UserOutlined, 
  TeamOutlined,
  MailOutlined,
  RightOutlined
} from '@ant-design/icons';

import { IActionsModal, TTab, TABS_LIST } from './model';
import { DrawerQRCodeSection } from './ui/QRCodeSection';
import { SelectedCard } from './ui/SelectedCard';
import { ActionSelector } from './ui/ActionSelector';
import { SmartTabs } from '@shared/ui/SmartTabs/ui';

import './style.css';
import { ISearchItem, SmartSearchUI, ISmartSearchModalProps } from '@shared/ui/SmartSearchModal';
import { ApiRoutes } from '@shared/api';
import { useModalState } from '@shared/lib/hooks'; 

type TModalType = 'attach' | 'signer' | 'approvers';

export const DrawerActionsModal: React.FC<IActionsModal> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TTab>('actions');

  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModalState();
  const [activeModalType, setActiveModalType] = useState<TModalType | null>(null);

  const [selectedItems, setSelectedItems] = useState<ISearchItem[]>([]);
  const [selectedSigner, setSelectedSigner] = useState<ISearchItem | null>(null);
  const [selectedApprovers, setSelectedApprovers] = useState<ISearchItem[]>([]);


  const handleOpenModal = (type: TModalType) => {
    setActiveModalType(type);
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
  };

  const handleConfirm = (ids: string[], items: ISearchItem[]) => {
    if (activeModalType === 'attach') {
        setSelectedItems(prev => {
            const newItems = items.filter(newItem => !prev.some(existing => existing.id === newItem.id));
            return [...prev, ...newItems];
        });
    } else if (activeModalType === 'signer') {
        if (items.length > 0) setSelectedSigner(items[0]);
    } else if (activeModalType === 'approvers') {
        setSelectedApprovers(prev => {
             const newItems = items.filter(newItem => !prev.some(existing => existing.id === newItem.id));
             return [...prev, ...newItems];
        });
    }
    closeModal();
  };

  const handleRemoveItem = (id: string, type: TModalType) => {
    if (type === 'attach') setSelectedItems(prev => prev.filter(i => i.id !== id));
    if (type === 'signer') setSelectedSigner(null);
    if (type === 'approvers') setSelectedApprovers(prev => prev.filter(i => i.id !== id));
  };



  const getModalConfig = (): Omit<ISmartSearchModalProps, 'onConfirm'> & { mode: 'attach' | 'select' } => {
    switch (activeModalType) {
        case 'attach':
            return {
                title: 'Прикрепить письмо',
                mode: 'attach' as const,
                querySettings: { url: ApiRoutes.GET_CORRESPONDENCES },
                transformResponse: (items: any[]) => items.map(item => ({
                    id: item.id,
                    title: item.subject || 'Без темы',
                    subtitle: item.sender_name || 'Неизвестный отправитель',
                    date: item.doc_date || item.created_at,
                    tag: 'Входящее'
                })),
                multiple: true
            };
        case 'signer':
            return {
                title: 'Выбрать подписывающего',
                mode: 'select' as const,
                querySettings: { url: ApiRoutes.GET_USERS },
                transformResponse: (items: any[]) => items.map(item => ({
                    id: item.id,
                    title: item.full_name || `${item.last_name} ${item.first_name}`,
                    subtitle: item.position || 'Сотрудник',
                    tag: 'Сотрудник'
                })),
                multiple: false
            };
        case 'approvers':
            return {
                title: 'Выбрать согласующих',
                mode: 'select' as const,
                querySettings: { url: ApiRoutes.GET_USERS },
                transformResponse: (items: any[]) => items.map(item => ({
                    id: item.id,
                    title: item.full_name || `${item.last_name} ${item.first_name}`,
                    subtitle: item.position || 'Сотрудник',
                    tag: 'Сотрудник'
                })),
                multiple: true
            };
        default:
            return { title: '', mode: 'select' as const, querySettings: { url: '' }, multiple: false };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <>
        <Drawer
        title={
          <div className="flex items-center justify-between w-full">
            <span className="text-lg font-semibold text-gray-800">Инспектор</span>
            <CloseOutlined 
              onClick={onClose}
              style={{ fontSize: '18px', color: '#1F2937', cursor: 'pointer' }} 
            />
          </div>
        }
        placement="right"
        onClose={onClose}
        open={open}
        closable={false}
        styles={{
            wrapper: { width: 440,minHeight: '330px',maxHeight: '770px' },
            mask: {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(4px)'
            }
        }}
        rootClassName="drawer-floating-root"
        >
        <div className="drawer__container h-full flex flex-col">
            <div className="mb-4">
            <SmartTabs
                items={TABS_LIST}
                activeKey={activeTab}
                onChange={(key) => {
                  console.log('Tab changed to:', key);
                  setActiveTab(key as TTab);
                }}
            />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'actions' && (
                    <div className="flex flex-col gap-2">
                       {[
                         {
                           id: 'attach' as const,
                           title: 'Прикрепить письмо',
                           icon: <PaperClipOutlined />,
                           label: selectedItems.length > 0 ? `Выбрано писем: ${selectedItems.length}` : 'Выбрать письмо',
                           items: selectedItems
                         },
                         {
                           id: 'signer' as const,
                           title: 'Подписывающий',
                           icon: <UserOutlined />,
                           label: selectedSigner ? selectedSigner.title : 'Выбрать подписывающего',
                           items: selectedSigner ? [selectedSigner] : []
                         },
                         {
                           id: 'approvers' as const,
                           title: 'Согласующие',
                           icon: <TeamOutlined />,
                           label: selectedApprovers.length > 0 ? `Выбрано: ${selectedApprovers.length}` : 'Выбрать согласующих',
                           items: selectedApprovers
                         }
                       ].map(section => (
                         <div key={section.id}>
                           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{section.title}</h4>
                           
                           <ActionSelector 
                             icon={section.icon}
                             label={section.label}
                             onClick={() => handleOpenModal(section.id)}
                           />

                           {section.items.length > 0 && (
                             <div className="flex flex-col gap-2 mt-3">
                               {section.items.map(item => (
                                 <SelectedCard 
                                   key={item.id}
                                   title={item.title}
                                   subtitle={item.subtitle}
                                   onRemove={() => handleRemoveItem(item.id, section.id)}
                                 />
                               ))}
                             </div>
                           )}
                         </div>
                       ))}

                       <div>
                          <DrawerQRCodeSection />
                       </div>
                    </div>
                )}
            </div>
        </div>
        </Drawer>
        <Modal
            open={isModalOpen} 
            onCancel={handleCloseModal}
            footer={null}
            title={
                <div className="flex items-center gap-3 text-xl font-bold text-gray-800 py-3 px-1">
                    {activeModalType === 'attach' && <div className="text-2xl text-gray-700"><MailOutlined /></div>}
                    {activeModalType === 'signer' && <div className="text-2xl text-gray-700"><UserOutlined /></div>}
                    {activeModalType === 'approvers' && <div className="text-2xl text-gray-700"><TeamOutlined /></div>}
                    <span>{modalConfig.title}</span>
                </div>
            }
            width={modalConfig.mode === 'attach' ? 1000 : 500}
            centered
            key={activeModalType}
            className="smart-search-modal"
            styles={{
                header: { borderBottom: '1px solid #f0f0f0', padding: '16px 24px', marginBottom: 0 },
                body: { padding: 0, borderRadius: '0 0 24px 24px', overflow: 'hidden' }
            }}
            closeIcon={<CloseOutlined style={{ fontSize: '18px' }} />}
        >
            <div className="h-[600px]">
                <SmartSearchUI 
                    {...modalConfig} 
                    onConfirm={handleConfirm}
                />
            </div>
        </Modal>
    </>
  );
};