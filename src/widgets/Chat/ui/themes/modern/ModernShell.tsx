import { AnimatePresence } from "framer-motion";
import type { IChatShellProps } from "../types";
import { ContactInfoDrawer } from "../../components/ContactInfoDrawer";
import { ThreadPanel } from "../../components/ThreadPanel";
import { ModernConversation } from "./ModernConversation";
import { ModernPanelControls } from "./ModernPanelControls";
import { ModernChatList } from "./ModernChatList";
import { ModernAvatarRail } from "./ModernAvatarRail";

// ─── Современное оформление чата ──────────────────────────────────────────────
// Вместо единого окна — плитки на общем фоне: беседа и панель бесед лежат
// рядом, а край панели задаёт направление, в котором их кладут. Данные,
// обработчики и состояние приходят готовыми из useChatAppState.

/** Ширина панели бесед в вертикальных макетах: карточка со списком, px. */
const PANEL_WIDTH = 340;

export const ModernShell = ({
  state,
  variant,
  isExpanded,
  onToggleExpand,
  onRequestClose,
}: IChatShellProps) => {
  const {
    t,
    isDark,
    lang,
    layout,
    setLayout,
    labels,
    contacts,
    activeContact,
    activeConversationId,
    activeMembers,
    currentUserId,
    threadMessages,
    isLoadingChats,
    isLoadingThread,
    searchQuery,
    setSearchQuery,
    setShowComposeModal,
    setShowGroupModal,
    showContactDrawer,
    setShowContactDrawer,
    openThreadMsgId,
    setOpenThreadMsgId,
    openThreadMsg,
    setShowDeleteConversation,
    handleContactSwitch,
    handleSendThread,
    handleToggleStar,
    handleToggleMute,
    addMembers,
    removeMember,
    changeMemberRole,
    totalUnread,
  } = state;

  const isPage = variant === "page";
  // Чат занимает всю доступную площадь: как страница модуля либо как развёрнутое окно.
  const isFullBleed = isPage || isExpanded;
  const isHorizontal = layout === "top" || layout === "bottom";
  const isPanelFirst = layout === "left" || layout === "top";

  const controls = (
    <ModernPanelControls
      t={t}
      layout={layout}
      onLayoutChange={setLayout}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onComposeOpen={() => setShowComposeModal(true)}
      onGroupOpen={() => setShowGroupModal(true)}
    />
  );

  // Панель бесед: в вертикальных макетах управление стоит над списком, в
  // горизонтальных — слева от полосы аватарок. Содержимое одно, меняется ось.
  const panelGroup = (
    <div
      className={`flex gap-3 min-h-0 min-w-0 flex-shrink-0 ${
        isHorizontal ? "flex-row w-full" : "flex-col"
      }`}
      style={isHorizontal ? undefined : { width: PANEL_WIDTH }}
    >
      {isHorizontal ? (
        <>
          <div className="w-[340px] flex-shrink-0">{controls}</div>
          <ModernAvatarRail
            contacts={contacts}
            activeContactId={activeContact?.id ?? ""}
            unreadTotal={totalUnread}
            isLoading={isLoadingChats}
            t={t}
            onContactSwitch={handleContactSwitch}
          />
        </>
      ) : (
        <>
          {controls}
          <ModernChatList
            contacts={contacts}
            activeContactId={activeContact?.id ?? ""}
            unreadTotal={totalUnread}
            isLoading={isLoadingChats}
            lang={lang}
            t={t}
            onContactSwitch={handleContactSwitch}
          />
        </>
      )}
    </div>
  );

  return (
    <div
      className={`w-full flex items-center justify-end font-sans relative overflow-hidden ${
        isPage ? "flex-1 min-h-0" : "h-screen"
      } ${isFullBleed ? "" : "py-4 pl-4"}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onRequestClose?.();
      }}
    >
      <div
        className={`w-full h-full flex gap-3 p-3 min-h-0 overflow-hidden transition-all duration-300 ease-in-out ${
          isHorizontal ? "flex-col" : "flex-row"
        } ${
          isFullBleed
            ? "max-w-none max-h-none rounded-none"
            : "max-w-7xl max-h-[900px] rounded-l-2xl shadow-2xl"
        }`}
        style={{ background: "var(--th-chat-shell-bg)" }}
      >
        {isPanelFirst && panelGroup}

        <div className="flex flex-1 min-h-0 min-w-0 gap-3">
          <ModernConversation
            state={state}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            onRequestClose={onRequestClose}
          />

          <AnimatePresence>
            {showContactDrawer && !openThreadMsgId && activeContact && (
              <ContactInfoDrawer
                contact={activeContact}
                conversationId={activeConversationId}
                members={activeMembers}
                currentUserId={currentUserId}
                onClose={() => setShowContactDrawer(false)}
                onDeleteConversation={() => {
                  setShowDeleteConversation(true);
                  setShowContactDrawer(false);
                }}
                onToggleStar={handleToggleStar}
                onToggleMute={handleToggleMute}
                onAddMembers={(userIds) =>
                  activeConversationId &&
                  addMembers({
                    conversationId: activeConversationId,
                    user_ids: userIds,
                  })
                }
                onRemoveMember={(userId) =>
                  activeConversationId &&
                  removeMember({ conversationId: activeConversationId, userId })
                }
                onChangeMemberRole={(userId, role) =>
                  activeConversationId &&
                  changeMemberRole({
                    conversationId: activeConversationId,
                    userId,
                    role,
                  })
                }
                isDark={isDark}
                labels={labels}
                t={t}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {openThreadMsg && activeContact && (
              <ThreadPanel
                parentMsg={openThreadMsg}
                threadMessages={threadMessages}
                isLoading={isLoadingThread}
                activeContact={activeContact}
                onClose={() => setOpenThreadMsgId(null)}
                onSendThread={handleSendThread}
                isDark={isDark}
                threadLabel={t.thread}
                originalLabel={t.originalMessage}
                replyPlaceholder={t.replyInThread}
                lang={lang}
                t={t}
              />
            )}
          </AnimatePresence>
        </div>

        {!isPanelFirst && panelGroup}
      </div>
    </div>
  );
};
