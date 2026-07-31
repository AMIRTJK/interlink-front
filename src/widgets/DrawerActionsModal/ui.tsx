import React from "react";
import { IActionsModal, TABS_LIST, TTab } from "./model";
import { SmartTabs } from "@shared/ui/SmartTabs/ui";
import { CommentCard, If, VisorInviteNoticeModal } from "@shared/ui";
import { ChatView } from "../../features/chat";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "./lib";
import "./style.css";
import { useDrawerActionsModalState } from "./ui/useDrawerActionsModalState";
import { IncomingActionsSection } from "./ui/IncomingActionsSection";
import { OutgoingActionsSection } from "./ui/OutgoingActionsSection";
import { SmartSearchModalContainer } from "./ui/SmartSearchModalContainer";
import { ViewAllModal } from "./ui/ViewAllModal";

export const DrawerActionsModal: React.FC<IActionsModal> = ({
  open,
  onClose,
  docId,
  onReply,
  onRefresh,
  isIncoming,
  isReadOnly,
  isDarkMode,
  onAcknowledge,
  isAcknowledged,
  onForward,
  onOpenAssignment,
}) => {
  const {
    activeTab,
    setActiveTab,
    isModalOpen,
    activeModalType,
    viewAllSection,
    setViewAllSection,
    selectedItems,
    selectedSigners,
    selectedApprovers,
    showVisorNotice,
    setShowVisorNotice,
    handleAssignmentClick,
    handleOpenModal,
    handleCloseModal,
    handleConfirm,
    handleSave,
    handleRemoveItem,
    getViewAllItems,
    getModalConfig,
  } = useDrawerActionsModalState({
    docId,
    onRefresh,
    onClose,
    onOpenAssignment,
  });

  const viewAllItems = getViewAllItems();
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
              className={`fixed right-5 top-5 bottom-5 rounded-2xl! min-h-[920px]! overflow-y-auto z-1001 w-[440px] shadow-2xl flex flex-col overflow-hidden ${
                isDarkMode ? "bg-gray-900" : "bg-white"
              }`}
            >
              {/* Header */}
              <div
                className={`flex flex-col ${
                  isDarkMode ? "border-gray-800 bg-gray-900" : "border-gray-50 bg-white"
                }`}
              >
                <div className="flex justify-between px-6 py-4">
                  <span
                    className={`text-lg font-semibold ${
                      isDarkMode ? "text-gray-100" : "text-gray-800"
                    }`}
                  >
                    Действия
                  </span>
                  <Icons.CloseOutlined
                    onClick={onClose}
                    style={{
                      fontSize: "18px",
                      color: isDarkMode ? "#e5e7eb" : "#1F2937",
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
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <div
                    className={`drawer-content-scroll custom-scrollbar ${
                      isDarkMode ? "is-dark" : ""
                    }`}
                  >
                    <If is={activeTab === "actions"}>
                      {isIncoming === true ? (
                        <IncomingActionsSection
                          isDarkMode={isDarkMode}
                          isAcknowledged={isAcknowledged}
                          onAcknowledge={onAcknowledge}
                          onReply={onReply}
                          onForward={onForward}
                          handleAssignmentClick={handleAssignmentClick}
                        />
                      ) : (
                        <OutgoingActionsSection
                          isDarkMode={isDarkMode}
                          isReadOnly={isReadOnly}
                          selectedItems={selectedItems}
                          selectedSigners={selectedSigners}
                          selectedApprovers={selectedApprovers}
                          handleOpenModal={handleOpenModal}
                          handleRemoveItem={handleRemoveItem}
                          setViewAllSection={setViewAllSection}
                          handleSave={handleSave}
                        />
                      )}
                    </If>

                    <If is={activeTab === "comments"}>
                      <div className="flex flex-col gap-3">
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
                            isDarkMode={isDarkMode}
                          />
                        ))}
                      </div>
                    </If>

                    <If is={activeTab === "chat"}>
                      <div className="h-full">
                        <ChatView isDarkMode={isDarkMode} />
                      </div>
                    </If>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SmartSearchModalContainer
        isModalOpen={isModalOpen}
        activeModalType={activeModalType}
        modalConfig={modalConfig}
        isDarkMode={isDarkMode}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
      />

      <ViewAllModal
        viewAllSection={viewAllSection}
        viewAllItems={viewAllItems}
        isDarkMode={isDarkMode}
        onClose={() => setViewAllSection(null)}
        onRemoveItem={handleRemoveItem}
      />

      <VisorInviteNoticeModal
        open={showVisorNotice}
        onClose={() => setShowVisorNotice(false)}
      />
    </>
  );
};
