
import React, { useState } from 'react';
import { Drawer, Modal } from 'antd';
import { 
  CloseOutlined, 
  PaperClipOutlined, 
  UserOutlined, 
  TeamOutlined,
  MailOutlined
} from '@ant-design/icons';

import { IActionsModal, TTab, TABS_LIST, actionsList } from './model';
import { DrawerQRCodeSection } from './ui/QRCodeSection';
import { DrawerActionRow } from './ui/DrawerActionRow';
import { SmartTabs } from '@shared/ui/SmartTabs/ui';

import './style.css';
import { ISearchItem, SmartSearchUI, ISmartSearchModalProps } from '@shared/ui/SmartSearchModal';
import { ApiRoutes } from '@shared/api';
import { useModalState } from '@shared/lib/hooks'; // Added useModalState

type TModalType = 'attach' | 'signer' | 'approvers';

export const DrawerActionsModal: React.FC<IActionsModal> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState<TTab>('actions');

  // Refactored to use useModalState + local type state
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
    // Do not nullify type immediately to avoid flicker during close animation
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

  const renderSelectedItems = (items: ISearchItem[], type: TModalType) => {
    if (!items.length) return null;
    return (
      <div className="flex flex-col gap-2 mb-4 px-1">
        {items.map(item => (
            <div key={item.id} className="group relative flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full shrink-0
                        ${type === 'attach' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}
                    `}>
                        {type === 'attach' && <PaperClipOutlined />}
                        {type === 'signer' && <UserOutlined />}
                        {type === 'approvers' && <TeamOutlined />}
                    </div>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-bold text-gray-800 truncate">{item.title}</span>
                        {item.subtitle && <span className="text-xs text-gray-400 truncate">{item.subtitle}</span>}
                    </div>
                </div>
                <button
                    onClick={() => handleRemoveItem(item.id, type)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                >
                    <CloseOutlined />
                </button>
            </div>
        ))}
      </div>
    );
  };

  const getModalConfig = (): ISmartSearchModalProps & { mode: 'attach' | 'select' } => {
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
        title="Инспектор"
        placement="right"
        onClose={onClose}
        open={open}
        styles={{
            wrapper: { width: 410 },
            mask: {
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(4px)'
            }
        }}
        closeIcon={<CloseOutlined style={{ fontSize: '18px', color: '#1F2937' }} />}
        rootClassName="drawer-floating-root"
        >
        <div className="drawer__container h-full flex flex-col">
            <div className="mb-4">
            <SmartTabs
                items={TABS_LIST}
                activeKey={activeTab}
                onChange={setActiveTab as (key: string) => void}
            />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {activeTab === 'actions' && (
                    <div className="flex flex-col">

                       {/* Section 1: Attachment */}
                       <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Прикрепить письмо</h4>

                          {renderSelectedItems(selectedItems, 'attach')}

                          <DrawerActionRow
                            icon={<PaperClipOutlined />}
                            label="Выбрал письма:"
                            onClick={() => handleOpenModal('attach')}
                          />
                       </div>

                       {/* Section 2: Signer */}
                       <div className="mt-6">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Подписывающий</h4>

                          {selectedSigner && renderSelectedItems([selectedSigner], 'signer')}

                          {!selectedSigner && (
                            <DrawerActionRow
                                icon={<UserOutlined />}
                                label="Выбрать подписывающего"
                                onClick={() => handleOpenModal('signer')}
                            />
                          )}
                       </div>

                       {/* Section 3: Approvers */}
                       <div className="mt-6">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Согласующие</h4>

                          {renderSelectedItems(selectedApprovers, 'approvers')}

                          <DrawerActionRow
                            icon={<TeamOutlined />}
                            label="Выбрал: 1"
                            onClick={() => handleOpenModal('approvers')}
                          />
                       </div>

                    </div>
                )}
                {activeTab === 'qr' && <DrawerQRCodeSection />}
            </div>
        </div>
        </Drawer>

        <Modal
            open={isModalOpen} // Updated
            onCancel={handleCloseModal}
            footer={null}
            title={
                <div className="flex items-center gap-3 text-xl font-bold text-gray-800 py-3 px-1">
                    {/* Wait, user mock shows 'Mail' icon or 'Search' icon?
                        Image 1 Title: "Поиск писем" with Envelope icon (MailOutlined).
                        Image last Title: "Выбор согласующих" with Team icon.
                    */}
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