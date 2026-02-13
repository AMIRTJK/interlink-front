import React, { useEffect, useState } from "react";
import { IActionsModal, TTab, TABS_LIST } from "./model";
import { DrawerQRCodeSection } from "./ui/QRCodeSection";
import { SelectedCard } from "./ui/SelectedCard";
import { ActionSelector } from "./ui/ActionSelector";
import { SmartTabs } from "@shared/ui/SmartTabs/ui";
import { CommentCard, If } from "@shared/ui";
import { ChatView } from "../../features/chat";
import { motion, AnimatePresence } from "framer-motion";
import { Icons, Ui } from "./lib";
import "./style.css";
import {
  ISearchItem,
  SmartSearchUI,
  ISmartSearchModalProps,
} from "@shared/ui/SmartSearchModal";
import { ApiRoutes } from "@shared/api";
import { useModalState } from "@shared/lib/hooks";

type TModalType = "attach" | "signer" | "approvers";

const VISIBLE_ITEMS_LIMIT = 3;

import { useGetQuery, useMutationQuery } from "@shared/lib/hooks";

export const DrawerActionsModal: React.FC<IActionsModal> = ({
  open,
  onClose,
  docId,
  onReply,
  onRefresh,
  isIncoming,
  isReadOnly,
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

  const [viewAllSection, setViewAllSection] = useState<string | null>(null);

  const [selectedItems, setSelectedItems] = useState<ISearchItem[]>([]);
  const [selectedSigners, setSelectedSigners] = useState<ISearchItem[]>([]);
  const [selectedApprovers, setSelectedApprovers] = useState<ISearchItem[]>([]);

  const { data: usersData } = useGetQuery({
    url: ApiRoutes.GET_USERS,
    useToken: true,
  });

  // 2. Мутации для приглашения
  const { mutate: inviteSigner } = useMutationQuery({
    url: docId ? ApiRoutes.INTERNAL_INVITE_SIGNER.replace(":id", docId) : "",
    method: "POST",
  });

  const { mutate: attachIncoming } = useMutationQuery({
    url: docId ? ApiRoutes.ATTACH_INTERNAL_INCOMING.replace(":id", docId) : "",
    method: "POST",
  });

  const { mutate: inviteApprover } = useMutationQuery({
    url: docId ? ApiRoutes.INTERNAL_INVITE_APPROVER.replace(":id", docId) : "",
    method: "POST",
  });

  const handleOpenModal = (type: TModalType) => {
    setActiveModalType(type);
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
  };

  const handleConfirm = (ids: string[], items: ISearchItem[]) => {
    const addUniqueItems = (prev: ISearchItem[], newItems: ISearchItem[]) => {
      const uniqueNew = newItems.filter(
        (newItem) => !prev.some((existing) => existing.id === newItem.id),
      );
      return [...prev, ...uniqueNew];
    };

    if (activeModalType === "attach") {
      setSelectedItems((prev) => addUniqueItems(prev, items));
    } else if (activeModalType === "signer") {
      // Теперь добавляем в массив, а не перезаписываем первым элементом
      setSelectedSigners((prev) => addUniqueItems(prev, items));
    } else if (activeModalType === "approvers") {
      setSelectedApprovers((prev) => addUniqueItems(prev, items));
    }
    closeModal();
  };

  const handleSave = () => {
    console.log("handleSave called. docId:", docId);
    console.log("Selected Signer:", selectedSigners);
    console.log("Selected Approvers:", selectedApprovers);

    if (docId) {
      if (selectedSigners) {
        const payload = {
          users: selectedSigners.map((s) => s.id),
        };
        inviteSigner(payload);
      }

      if (selectedApprovers.length > 0) {
        const approverIds = selectedApprovers.map((item) => item.id);

        inviteApprover({ users: approverIds });
      }

      const incomingId = selectedItems[0]?.id;

      if (incomingId) {
        attachIncoming({ incoming_id: incomingId });
      }

      if (onRefresh) {
        setTimeout(() => {
          onRefresh();
        }, 500);
      }

      // ОЧИЩАЕМ СТЕЙТ ПОСЛЕ ОТПРАВКИ
      setSelectedSigners([]);
      setSelectedApprovers([]);
    } else {
      alert("Ошибка: ID документа не найден. Сначала сохраните черновик.");
    }
    onClose();
  };

  const handleRemoveItem = (id: string, type: string) => {
    if (type === "attach")
      setSelectedItems((prev) => prev.filter((i) => i.id !== id));
    if (type === "signer")
      setSelectedSigners((prev) => prev.filter((i) => i.id !== id));
    if (type === "approvers")
      setSelectedApprovers((prev) => prev.filter((i) => i.id !== id));
  };

  const getViewAllItems = () => {
    if (viewAllSection === "attach") return selectedItems;
    if (viewAllSection === "signer") return selectedSigners;
    if (viewAllSection === "approvers") return selectedApprovers;
    return [];
  };

  const viewAllItems = getViewAllItems();

  const getModalConfig = (): Omit<ISmartSearchModalProps, "onConfirm"> & {
    mode: "attach" | "select";
  } => {
    // Общая функция трансформации для пользователей
    const transformUser = (items: any[]) =>
      items.map((item) => ({
        id: item.id,
        title: item.full_name || `${item.last_name} ${item.first_name}`,
        subtitle: item.position || "Сотрудник",
        tag: item.position || "Сотрудник",
      }));

    switch (activeModalType) {
      case "attach":
        return {
          title: "Прикрепить письмо",
          mode: "attach" as const,
          querySettings: {
            url: ApiRoutes.GET_INTERNAL_INCOMING_PICKER as string,
          },
          transformResponse: (items: any[]) =>
            items.map((item) => {
              const creator = usersData?.data?.data.find(
                (user: any) => user.id === item.creator_id,
              );
              return {
                id: item.id,
                title: item.subject || "Без темы",
                subtitle: creator?.full_name || "Не указано",
                reg_number: item.reg_number || "Не указано",
                date: item.sent_at,
                tag: "Входящее",
              };
            }),
          multiple: true,
        };
      case "signer":
        return {
          title: "Выбрать подписывающих",
          mode: "select" as const,
          querySettings: {
            url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS as string,
          },
          transformResponse: transformUser,
          multiple: true,
        };
      case "approvers":
        return {
          title: "Выбрать согласующих",
          mode: "select" as const,
          querySettings: {
            url: ApiRoutes.GET_INTERNAL_RECIPIENTS_USERS as string,
          },
          transformResponse: transformUser,
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
              className="fixed right-5 top-5 bottom-5 rounded-2xl! min-h-[920px]! overflow-y-auto z-1001 w-[440px] bg-white shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className=" flex flex-col border-gray-50 bg-white">
                <div className="flex justify-between px-6 py-4">
                  <span className="text-lg font-semibold text-gray-800">
                    Инспектор
                  </span>
                  <Icons.CloseOutlined
                    onClick={onClose}
                    style={{
                      fontSize: "18px",
                      color: "#1F2937",
                      cursor: "pointer",
                    }}
                  />
                </div>

                <div className="drawer-body">
                  <div>
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
                      {isIncoming === true ? (
                        <div className="flex flex-col gap-3 mt-5">
                          <Ui.Button
                            onClick={onReply}
                            size="large"
                            className="w-full! h-14! px-4! py-3! bg-white! border-[#A78BFA]! text-gray-700! hover:bg-gray-50! hover:border-[#8B5CF6]! rounded-xl! transition-all duration-200 flex items-center justify-start! gap-3! shadow-sm!"
                            icon={
                              <Icons.MailOutlined
                                style={{ fontSize: "18px", color: "#6B7280" }}
                              />
                            }
                          >
                            <span className="font-medium">Ответить</span>
                          </Ui.Button>
                          <Ui.Button
                            onClick={() => console.log("Переслать")}
                            size="large"
                            className="w-full! h-14! px-4! py-3! bg-white! border-[#A78BFA]! text-gray-700! hover:bg-gray-50! hover:border-[#8B5CF6]! rounded-xl! transition-all duration-200 flex items-center justify-start! gap-3! shadow-sm!"
                            icon={
                              <Icons.SendOutlined
                                style={{
                                  fontSize: "18px",
                                  color: "#6B7280",
                                  transform: "rotate(0deg)",
                                }}
                              />
                            }
                          >
                            <span className="text-base font-medium">
                              Переслать
                            </span>
                          </Ui.Button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {[
                            {
                              id: "attach" as const,
                              title: "Прикрепить письмо",
                              icon: <Icons.MailOutlined />,
                              label:
                                selectedItems.length > 0
                                  ? `Выбрано писем: ${selectedItems.length}`
                                  : "Выбрать письмо",
                              items: selectedItems,
                            },
                            {
                              id: "signer" as const,
                              title: "Подписывающий",
                              icon: <Icons.UserOutlined />,
                              label:
                                selectedSigners.length > 0
                                  ? `Выбрано: ${selectedSigners.length}`
                                  : "Выбрать подписывающего",
                              items: selectedSigners,
                            },
                            {
                              id: "approvers" as const,
                              title: "Согласующие",
                              icon: <Icons.TeamOutlined />,
                              label:
                                selectedApprovers.length > 0
                                  ? `Выбрано: ${selectedApprovers.length}`
                                  : "Выбрать согласующих",
                              items: selectedApprovers,
                            },
                          ].map((section) => {
                            const visibleItems = section.items.slice(
                              0,
                              VISIBLE_ITEMS_LIMIT,
                            );
                            const hiddenCount =
                              section.items.length - VISIBLE_ITEMS_LIMIT;
                            return (
                              <div
                                key={section.id}
                                className="flex flex-col gap-2"
                              >
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
                                    {visibleItems.map((item) => (
                                      <SelectedCard
                                        key={item.id}
                                        title={item.title}
                                        subtitle={item.subtitle}
                                        onRemove={() =>
                                          handleRemoveItem(item.id, section.id)
                                        }
                                      />
                                    ))}
                                    <If is={hiddenCount > 0}>
                                      <div
                                        onClick={() =>
                                          setViewAllSection(section.id)
                                        }
                                        className="py-2 px-3 text-center text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-lg cursor-pointer transition-all border border-dashed border-gray-200"
                                      >
                                        Показать еще (+{hiddenCount})
                                      </div>
                                    </If>
                                  </div>
                                </If>
                              </div>
                            );
                          })}

                          {/* <div>
                            <DrawerQRCodeSection />
                          </div> */}
                          <div>
                            <Ui.Button
                              onClick={handleSave}
                              type="primary"
                              className=" w-full! p-5! font-bold! bg-[#FF6B6B]! hover:bg-[#ff5252]! text-white rounded-xl! transition-colors duration-200 flex items-center justify-center gap-2"
                              disabled={isReadOnly}
                            >
                              Сохранить
                            </Ui.Button>
                          </div>
                        </div>
                      )}
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

      <Ui.Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        title={
          <div className="flex items-center gap-3 text-xl font-bold text-gray-800 py-3 px-1">
            {activeModalType === "attach" && (
              <div className="text-2xl text-gray-700">
                <Icons.MailOutlined />
              </div>
            )}
            {activeModalType === "signer" && (
              <div className="text-2xl text-gray-700">
                <Icons.UserOutlined />
              </div>
            )}
            {activeModalType === "approvers" && (
              <div className="text-2xl text-gray-700">
                <Icons.TeamOutlined />
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
        closeIcon={<Icons.CloseOutlined style={{ fontSize: "18px" }} />}
      >
        <div className="h-[600px]">
          <SmartSearchUI {...modalConfig} onConfirm={handleConfirm} />
        </div>
      </Ui.Modal>
      <Ui.Modal
        open={!!viewAllSection}
        onCancel={() => setViewAllSection(null)}
        footer={null}
        title="Выбранные элементы"
        width={500}
        centered
        zIndex={1200}
      >
        <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
          {viewAllItems.map((item) => (
            <SelectedCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              onRemove={() => {
                if (viewAllSection) {
                  handleRemoveItem(item.id, viewAllSection);
                }
              }}
            />
          ))}
          {viewAllItems.length === 0 && (
            <div className="text-center text-gray-400 py-5">Список пуст</div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <Ui.Button onClick={() => setViewAllSection(null)}>Закрыть</Ui.Button>
        </div>
      </Ui.Modal>
    </>
  );
};
