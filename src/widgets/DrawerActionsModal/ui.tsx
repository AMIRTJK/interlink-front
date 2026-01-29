import React, { useState } from "react";
import { Modal } from "antd";
import {
  CloseOutlined,
  UserOutlined,
  TeamOutlined,
  MailOutlined,
} from "@ant-design/icons";

import { IActionsModal, TTab, TABS_LIST } from "./model";
import { DrawerQRCodeSection } from "./ui/QRCodeSection";
import { SelectedCard } from "./ui/SelectedCard";
import { ActionSelector } from "./ui/ActionSelector";
import { SmartTabs } from "@shared/ui/SmartTabs/ui";
import { CommentCard, If } from "@shared/ui";
import { ChatView } from "../../features/chat";
import { motion, AnimatePresence } from "framer-motion";

import "./style.css";
import {
  ISearchItem,
  SmartSearchUI,
  ISmartSearchModalProps,
} from "@shared/ui/SmartSearchModal";
import { ApiRoutes } from "@shared/api";
import { useModalState } from "@shared/lib/hooks";

type TModalType = "attach" | "signer" | "approvers";

export const DrawerActionsModal: React.FC<IActionsModal> = ({
  open,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TTab>("actions");

  const {
    isOpen: isModalOpen,
    open: openModal,
    close: closeModal,
  } = useModalState();
  const [activeModalType, setActiveModalType] = useState<TModalType | null>(
    null,
  );

  const [selectedItems, setSelectedItems] = useState<ISearchItem[]>([]);
  const [selectedSigner, setSelectedSigner] = useState<ISearchItem | null>(
    null,
  );
  const [selectedApprovers, setSelectedApprovers] = useState<ISearchItem[]>([]);

  const handleOpenModal = (type: TModalType) => {
    setActiveModalType(type);
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
  };

  const handleConfirm = (ids: string[], items: ISearchItem[]) => {
    if (activeModalType === "attach") {
      setSelectedItems((prev) => {
        const newItems = items.filter(
          (newItem) => !prev.some((existing) => existing.id === newItem.id),
        );
        return [...prev, ...newItems];
      });
    } else if (activeModalType === "signer") {
      if (items.length > 0) setSelectedSigner(items[0]);
    } else if (activeModalType === "approvers") {
      setSelectedApprovers((prev) => {
        const newItems = items.filter(
          (newItem) => !prev.some((existing) => existing.id === newItem.id),
        );
        return [...prev, ...newItems];
      });
    }
    closeModal();
  };

  const handleRemoveItem = (id: string, type: TModalType) => {
    if (type === "attach")
      setSelectedItems((prev) => prev.filter((i) => i.id !== id));
    if (type === "signer") setSelectedSigner(null);
    if (type === "approvers")
      setSelectedApprovers((prev) => prev.filter((i) => i.id !== id));
  };

  const getModalConfig = (): Omit<ISmartSearchModalProps, "onConfirm"> & {
    mode: "attach" | "select";
  } => {
    switch (activeModalType) {
      case "attach":
        return {
          title: "Прикрепить письмо",
          mode: "attach" as const,
          querySettings: { url: ApiRoutes.GET_CORRESPONDENCES },
          transformResponse: (
            items: Array<{
              id: string;
              subject?: string;
              sender_name?: string;
              doc_date?: string;
              created_at?: string;
              kind?: string;
            }>,
          ) =>
            items.map((item) => ({
              id: item.id,
              title: item.subject || "Без темы",
              subtitle: item.sender_name || "Неизвестный отправитель",
              date: item.doc_date || item.created_at,
              tag: item.kind === "incoming" ? "Входящее" : "Исходящее",
            })),
          multiple: true,
        };
      case "signer":
        return {
          title: "Выбрать подписывающего",
          mode: "select" as const,
          querySettings: { url: ApiRoutes.GET_USERS },
          transformResponse: (
            items: Array<{
              id: string;
              full_name?: string;
              last_name?: string;
              first_name?: string;
              position?: string;
            }>,
          ) =>
            items.map((item) => ({
              id: item.id,
              title: item.full_name || `${item.last_name} ${item.first_name}`,
              subtitle: item.position || "Сотрудник",
              tag: item.position || "Сотрудник",
            })),
          multiple: false,
        };
      case "approvers":
        return {
          title: "Выбрать согласующих",
          mode: "select" as const,
          querySettings: { url: ApiRoutes.GET_USERS },
          transformResponse: (
            items: Array<{
              id: string;
              full_name?: string;
              last_name?: string;
              first_name?: string;
              position?: string;
            }>,
          ) =>
            items.map((item) => ({
              id: item.id,
              title: item.full_name || `${item.last_name} ${item.first_name}`,
              subtitle: item.position || "Сотрудник",
              tag: item.position || "Сотрудник",
            })),
          multiple: true,
        };
      default:
        return {
          title: "",
          mode: "select" as const,
          querySettings: { url: "" },
          multiple: false,
        };
    }
  };

  const modalConfig = getModalConfig();

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-1000 bg-black/20 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: 500, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 500, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 h-full top-0 z-1001 w-[440px] bg-white shadow-2xl flex flex-col "
            >
              {/* Header */}
              <div className=" flex  flex-col border-b border-gray-50 bg-white overflow-auto">
                <div className="flex justify-between px-6 py-4">
                  <span className="text-lg font-semibold text-gray-800">
                    Инспектор
                  </span>
                  <CloseOutlined
                    onClick={onClose}
                    style={{
                      fontSize: "18px",
                      color: "#1F2937",
                      cursor: "pointer",
                    }}
                  />
                </div>

                {/* Content */}
                <div className="drawer-body">
                  <div className="mb-4">
                    <SmartTabs
                      items={TABS_LIST}
                      activeKey={activeTab}
                      onChange={(key) => {
                        setActiveTab(key as TTab);
                      }}
                    />
                  </div>

                  <div className="drawer-content-scroll custom-scrollbar">
                    <If is={activeTab === "actions"}>
                      <div className="flex flex-col gap-2">
                        {[
                          {
                            id: "attach" as const,
                            title: "Прикрепить письмо",
                            icon: <MailOutlined />,
                            label:
                              selectedItems.length > 0
                                ? `Выбрано писем: ${selectedItems.length}`
                                : "Выбрать письмо",
                            items: selectedItems,
                          },
                          {
                            id: "signer" as const,
                            title: "Подписывающий",
                            icon: <UserOutlined />,
                            label: selectedSigner
                              ? selectedSigner.title
                              : "Выбрать подписывающего",
                            items: selectedSigner ? [selectedSigner] : [],
                          },
                          {
                            id: "approvers" as const,
                            title: "Согласующие",
                            icon: <TeamOutlined />,
                            label:
                              selectedApprovers.length > 0
                                ? `Выбрано: ${selectedApprovers.length}`
                                : "Выбрать согласующих",
                            items: selectedApprovers,
                          },
                        ].map((section) => (
                          <div key={section.id}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              {section.title}
                            </h4>

                            <ActionSelector
                              icon={section.icon}
                              label={section.label}
                              onClick={() => handleOpenModal(section.id)}
                            />

                            <If is={section.items.length > 0}>
                              <div className="flex flex-col gap-2">
                                {section.items.map((item) => (
                                  <SelectedCard
                                    key={item.id}
                                    title={item.title}
                                    subtitle={item.subtitle}
                                    onRemove={() =>
                                      handleRemoveItem(item.id, section.id)
                                    }
                                  />
                                ))}
                              </div>
                            </If>
                          </div>
                        ))}

                        <div>
                          <DrawerQRCodeSection />
                        </div>
                      </div>
                    </If>

                    <If is={activeTab === "comments"}>
                      <div className="flex flex-col gap-3">
                        {/* Пример использования useGetQuery для получения комментариев */}
                        {/* 
                              const { data: comments } = useGetQuery({ 
                                url: `${ApiRoutes.GET_CORRESPONDENCES}/:id/comments`, 
                                useToken: true 
                              });
                            */}
                        {[
                          {
                            id: 1,
                            author: "Иванов И.И.",
                            date: "15.04.2024 14:30",
                            content: "Необходимо уточнить пункт 2",
                            color: "#8C52FF",
                          },
                          {
                            id: 2,
                            author: "Петрова М.А.",
                            date: "15.04.2024 15:15",
                            content: "Согласовано с моей стороны",
                            color: "#8C52FF",
                          },
                        ].map((comment) => (
                          <CommentCard
                            key={comment.id}
                            author={comment.author}
                            date={comment.date}
                            content={comment.content}
                            indicatorColor={comment.color}
                          />
                        ))}
                      </div>
                    </If>

                    <If is={activeTab === "chat"}>
                      <div className="h-full">
                        <ChatView />
                      </div>
                    </If>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        title={
          <div className="flex items-center gap-3 text-xl font-bold text-gray-800 py-3 px-1">
            {activeModalType === "attach" && (
              <div className="text-2xl text-gray-700">
                <MailOutlined />
              </div>
            )}
            {activeModalType === "signer" && (
              <div className="text-2xl text-gray-700">
                <UserOutlined />
              </div>
            )}
            {activeModalType === "approvers" && (
              <div className="text-2xl text-gray-700">
                <TeamOutlined />
              </div>
            )}
            <span>{modalConfig.title}</span>
          </div>
        }
        width={modalConfig.mode === "attach" ? 1000 : 500}
        centered
        key={activeModalType}
        zIndex={1100}
        className="smart-search-modal"
        transitionName=""
        maskTransitionName="ant-fade"
        modalRender={(modal) => (
          <AnimatePresence mode="wait">
            {isModalOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
              >
                {modal}
              </motion.div>
            )}
          </AnimatePresence>
        )}
        styles={{
          header: {
            borderBottom: "1px solid #f0f0f0",
            padding: "16px 24px",
            marginBottom: 0,
          },
          body: {
            padding: 0,
            borderRadius: "0 0 24px 24px",
            overflow: "hidden",
          },
        }}
        closeIcon={<CloseOutlined style={{ fontSize: "18px" }} />}
      >
        <div className="h-[600px]">
          <SmartSearchUI {...modalConfig} onConfirm={handleConfirm} />
        </div>
      </Modal>
    </>
  );
};
