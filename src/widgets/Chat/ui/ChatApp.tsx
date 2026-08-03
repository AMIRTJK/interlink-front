import React, { useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Can, If } from "@shared/ui";
import { type TChatVariant } from "../model";
import { Lang } from "../lib/translations";
import { useChatAppState } from "../lib/useChatAppState";
import { CHAT_PERMISSIONS } from "../model/constants";

// Components
import { ChatHeader } from "./components/ChatHeader";
import { ChatListPanel } from "./components/ChatListPanel";
import { ChatSubHeader } from "./components/ChatSubHeader";
import { MessageList } from "./components/MessageList";
import { MessageComposer } from "./components/MessageComposer";
import { StoryViewer } from "./components/StoryViewer";
import { PendingFilesBar } from "./components/PendingFilesBar";
import { AIPanel } from "./components/AIPanel";
import { ReplyBar } from "./components/ReplyBar";
import { MessageSearchBar } from "./components/MessageSearchBar";
import { PinnedBanner } from "./components/PinnedBanner";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { DeleteConversationModal } from "./components/DeleteConversationModal";
import { IncomingCallScreen } from "./components/IncomingCallScreen";
import { ContactInfoDrawer } from "./components/ContactInfoDrawer";
import { ComposeModal } from "./components/ComposeModal";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { ThreadPanel } from "./components/ThreadPanel";
import { CallOverlayModal } from "./components/CallOverlayModal";
import { ForwardModal } from "./components/ForwardModal";

const formatRepliesCount = (count: number, currentLang: Lang) => {
  if (currentLang === "ru") {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} ответ`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20))
      return `${count} ответа`;
    return `${count} ответов`;
  }
  if (currentLang === "tg") return `${count} ҷавоб`;
  return `${count} ${count === 1 ? "reply" : "replies"}`;
};

interface IProps {
  onComposeStateChange?: (isOpen: boolean) => void;
  onRequestClose?: () => void;
  /** Режим отображения: полноценная страница модуля или всплывающее окно. */
  variant?: TChatVariant;
  /** Развёрнут ли всплывающий чат на весь экран (только для variant="overlay"). */
  isExpanded?: boolean;
  /** Переключение «компактное окно ↔ весь экран». Кнопка появляется, только если передан. */
  onToggleExpand?: () => void;
}

export const ChatApp: React.FC<IProps> = ({
  onComposeStateChange,
  onRequestClose,
  variant = "overlay",
  isExpanded = false,
  onToggleExpand,
}) => {
  const state = useChatAppState(onComposeStateChange);
  const isPage = variant === "page";
  // Чат занимает всю доступную площадь: как страница модуля либо как развёрнутое окно.
  const isFullBleed = isPage || isExpanded;

  const {
    isDark,
    lang,
    layout,
    setLayout,
    t,
    cycleLang,
    LANG_LABELS,
    EMOJI_CATEGORIES_LOCALIZED,
    SCHEDULE_OPTIONS_LOCALIZED,
    contacts,
    activeContact,
    activeConversationId,
    activeMembers,
    currentUserId,
    messages,
    threadMessages,
    isLoadingChats,
    isLoadingMessages,
    isMessagesError,
    isLoadingThread,
    hasOlder,
    isLoadingOlder,
    typingNames,
    isSending,
    input,
    setInput,
    searchQuery,
    setSearchQuery,
    callState,
    setCallState,
    isMuted,
    setIsMuted,
    isVideoOff,
    setIsVideoOff,
    callDuration,
    showEmojiPicker,
    setShowEmojiPicker,
    pendingFiles,
    incomingCall,
    setIncomingCall,
    hoveredMessageId,
    setHoveredMessageId,
    showContactDrawer,
    setShowContactDrawer,
    showMsgSearch,
    setShowMsgSearch,
    msgSearchQuery,
    handleMsgSearchChange,
    searchMatchIndex,
    showPinnedBanner,
    setShowPinnedBanner,
    showComposeModal,
    setShowComposeModal,
    showGroupModal,
    setShowGroupModal,
    isRecording,
    setIsRecording,
    replyingTo,
    setReplyingTo,
    forwardingMsg,
    setForwardingMsg,
    activeActionMsgId,
    setActiveActionMsgId,
    showAIPanel,
    setShowAIPanel,
    openThreadMsgId,
    setOpenThreadMsgId,
    showSchedulePicker,
    setShowSchedulePicker,
    viewingStory,
    setViewingStory,
    setDeletingMsgId,
    showDeleteConversation,
    setShowDeleteConversation,
    fileInputRef,
    scrollRef,
    setMessageRef,
    handleFileChange,
    removePendingFile,
    handleEmojiSelect,
    pinnedMessage,
    searchMatches,
    openThreadMsg,
    lastReceivedMessage,
    deletingMsg,
    totalUnread,
    createDirect,
    isCreatingDirect,
    createGroupAsync,
    isCreatingGroup,
    addMembers,
    removeMember,
    changeMemberRole,
    setActiveConversationId,
    handleContactSwitch,
    handleSearchPrev,
    handleSearchNext,
    handleSend,
    handleSchedule,
    handleSendVoice,
    handleForwardSend,
    handleDeleteForMe,
    handleDeleteForEveryone,
    handleDeleteConversation,
    handleToggleStar,
    handleToggleMute,
    handleSendThread,
    handlePinMessage,
    handleReaction,
    handleJumpToPinned,
    handleMessagesScroll,
    handleJumpToMessage,
    handleReturnToMessage,
    targetHighlightedMessageId,
    returnToMessageId,
    handleAcceptCall,
    handleDeclineCall,
    handleEndCall,
    isHighlighted,
    isCurrentMatch,
  } = state;

  const isHorizontalLayout = layout === "top" || layout === "bottom";
  const mainAreaFlexDir = isHorizontalLayout ? "flex-col" : "flex-row";
  const chatListFirst = layout === "left" || layout === "top";

  const labels = useMemo(
    () => ({
      deleted: t.messageDeleted,
      deletedForMe: t.youDeletedThis,
      attachment: t.attachmentLabel,
      voiceMessage: t.voiceMessage,
      you: t.you,
    }),
    [t],
  );

  const chatListPanel = (
    <ChatListPanel
      layout={layout}
      contacts={contacts}
      activeContactId={activeContact?.id ?? ""}
      searchQuery={searchQuery}
      isLoading={isLoadingChats}
      emptyLabel={t.noChats}
      loadingLabel={t.loadingChats}
      searchPlaceholder={t.search}
      onContactSwitch={handleContactSwitch}
      onComposeOpen={() => setShowComposeModal(true)}
      onSearchChange={setSearchQuery}
      isDark={isDark}
    />
  );

  const chatWindow = (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
      <If is={!activeContact}>
        <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center px-6">
          <p
            className={`text-sm font-medium ${isDark ? "text-white/70" : "text-gray-600"}`}
          >
            {isLoadingChats ? t.loadingChats : t.noChats}
          </p>
          <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-400"}`}>
            {t.noMessagesHint}
          </p>
        </div>
      </If>

      {activeContact && (
        <>
          <ChatSubHeader
            activeContact={activeContact}
            isDark={isDark}
            t={t}
            showMsgSearch={showMsgSearch}
            showContactDrawer={showContactDrawer}
            onToggleSearch={() => {
              setShowMsgSearch((v) => !v);
              handleMsgSearchChange("");
            }}
            onToggleDrawer={() => setShowContactDrawer((v) => !v)}
            onStartCall={setCallState}
            onSimulateIncomingCall={() => setIncomingCall({ callType: "audio" })}
          />

          <AnimatePresence>
            {showMsgSearch && (
              <MessageSearchBar
                query={msgSearchQuery}
                onChange={handleMsgSearchChange}
                onClose={() => {
                  setShowMsgSearch(false);
                  handleMsgSearchChange("");
                }}
                matchCount={searchMatches.length}
                currentMatch={searchMatchIndex}
                onPrev={handleSearchPrev}
                onNext={handleSearchNext}
                isDark={isDark}
                placeholder={t.searchMessagesPlaceholder}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pinnedMessage && showPinnedBanner && (
              <PinnedBanner
                message={pinnedMessage}
                onDismiss={() => setShowPinnedBanner(false)}
                onJump={handleJumpToPinned}
                isDark={isDark}
                label={t.pinnedMessage}
              />
            )}
          </AnimatePresence>

          <MessageList
            messages={messages}
            activeContact={activeContact}
            isLoading={isLoadingMessages}
            isError={isMessagesError}
            hasOlder={hasOlder}
            isLoadingOlder={isLoadingOlder}
            onScroll={handleMessagesScroll}
            scrollRef={scrollRef}
            typingNames={typingNames}
            switchDirection={1}
            hoveredMessageId={hoveredMessageId}
            activeActionMsgId={activeActionMsgId}
            isDark={isDark}
            lang={lang}
            t={t}
            isHighlighted={isHighlighted}
            isCurrentMatch={isCurrentMatch}
            setHoveredMessageId={setHoveredMessageId}
            setActiveActionMsgId={setActiveActionMsgId}
            handleReaction={handleReaction}
            handlePinMessage={handlePinMessage}
            setReplyingTo={setReplyingTo}
            setForwardingMsg={setForwardingMsg}
            setDeletingMsgId={setDeletingMsgId}
            setOpenThreadMsgId={setOpenThreadMsgId}
            setShowContactDrawer={setShowContactDrawer}
            formatRepliesCount={formatRepliesCount}
            setMessageRef={setMessageRef}
            targetHighlightedMessageId={targetHighlightedMessageId}
            returnToMessageId={returnToMessageId}
            onJumpToMessage={handleJumpToMessage}
            onReturnToMessage={handleReturnToMessage}
          />

          <AnimatePresence>
            {showAIPanel && lastReceivedMessage && (
              <AIPanel
                lastMessage={lastReceivedMessage.text}
                onSelect={(text) => setInput(text)}
                onClose={() => setShowAIPanel(false)}
                isDark={isDark}
                title={t.aiSuggestions}
                loadingText={t.generatingSuggestions}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {replyingTo && (
              <ReplyBar
                reply={replyingTo}
                onCancel={() => setReplyingTo(null)}
                isDark={isDark}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pendingFiles.length > 0 && (
              <PendingFilesBar
                files={pendingFiles}
                onRemove={removePendingFile}
                onSend={handleSend}
                isDark={isDark}
                countLabel={`${pendingFiles.length} ${t.filesReadyToSend}`}
                sendAllLabel={t.sendAll}
              />
            )}
          </AnimatePresence>

          {/* Без права chat.send поле ввода не работает, но исчезать молча оно
              не должно — иначе экран выглядит сломанным. */}
          <Can
            permission={CHAT_PERMISSIONS.SEND}
            fallback={
              <div
                className={`px-6 py-4 border-t text-center text-xs ${isDark ? "border-white/8 text-white/40" : "border-black/5 text-gray-400"}`}
              >
                {t.noSendPermission}
              </div>
            }
          >
            <MessageComposer
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              canSend={!!activeConversationId}
              isSending={isSending}
              hasPendingFiles={pendingFiles.length > 0}
              isDark={isDark}
              t={t}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              emojiCategories={EMOJI_CATEGORIES_LOCALIZED}
              onEmojiSelect={handleEmojiSelect}
              showSchedulePicker={showSchedulePicker}
              setShowSchedulePicker={setShowSchedulePicker}
              scheduleOptions={SCHEDULE_OPTIONS_LOCALIZED}
              onSchedule={handleSchedule}
              showAIPanel={showAIPanel}
              setShowAIPanel={setShowAIPanel}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              onSendVoice={handleSendVoice}
            />
          </Can>
        </>
      )}
    </main>
  );

  // Рамка и внутренняя светлая подсветка нужны, только когда чат — окно с полями.
  // Край в край они превращаются в светлую полосу по периметру экрана.
  const cardBorder = isDark
    ? "1px solid rgba(167,139,250,0.2)"
    : "1px solid rgba(167,139,250,0.18)";
  const cardShadow = isDark
    ? "0 30px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
    : "0 30px 80px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.9)";

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
        className={`w-full h-full flex flex-col overflow-hidden relative transition-all duration-300 ease-in-out ${
          isFullBleed
            ? "max-w-none max-h-none rounded-none"
            : "max-w-7xl max-h-[900px] rounded-l-2xl shadow-2xl"
        }`}
        style={{
          background: isDark ? "rgba(10,4,30,0.55)" : "rgba(255,255,255,0.72)",
          backdropFilter: "blur(30px)",
          border: isFullBleed ? "none" : cardBorder,
          boxShadow: isFullBleed ? "none" : cardShadow,
        }}
      >
        <ChatHeader
          isDark={isDark}
          lang={lang}
          langLabels={LANG_LABELS}
          onCycleLang={cycleLang}
          layout={layout}
          onLayoutChange={setLayout}
          totalUnread={totalUnread}
          onComposeOpen={() => setShowComposeModal(true)}
          onGroupOpen={() => setShowGroupModal(true)}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
          onRequestClose={onRequestClose}
        />

        {/* Main content area with dynamic layout */}
        <div
          className={`flex flex-1 min-h-0 overflow-hidden ${mainAreaFlexDir}`}
        >
          {chatListFirst && chatListPanel}

          <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
            {chatWindow}

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
                />
              )}
            </AnimatePresence>
          </div>

          {!chatListFirst && chatListPanel}
        </div>
      </div>

      {/* Story Viewer */}
      <AnimatePresence>
        {viewingStory && (
          <StoryViewer
            contact={viewingStory}
            onClose={() => setViewingStory(null)}
            hoursAgo={t.hoursAgo}
          />
        )}
      </AnimatePresence>

      {/* Incoming Call */}
      <AnimatePresence>
        {incomingCall && activeContact && (
          <IncomingCallScreen
            contact={activeContact}
            callType={incomingCall.callType}
            onAccept={handleAcceptCall}
            onDecline={handleDeclineCall}
            declineLabel={t.decline}
            acceptLabel={t.accept}
            incomingVideoLabel={t.incomingVideo}
            incomingVoiceLabel={t.incomingVoice}
          />
        )}
      </AnimatePresence>

      {/* Active Call Modal */}
      <AnimatePresence>
        {callState !== "none" && activeContact && (
          <CallOverlayModal
            callState={callState}
            activeContact={activeContact}
            isVideoOff={isVideoOff}
            isMuted={isMuted}
            callDuration={callDuration}
            t={t}
            onEndCall={handleEndCall}
            onToggleMute={() => setIsMuted((m) => !m)}
            onToggleVideo={() => setIsVideoOff((v) => !v)}
            onClose={() => setCallState("none")}
          />
        )}
      </AnimatePresence>

      {/* Compose Modal */}
      <AnimatePresence>
        {showComposeModal && (
          <ComposeModal
            onClose={() => setShowComposeModal(false)}
            onSelectUser={(userId) =>
              createDirect(
                { user_id: userId },
                {
                  onSuccess: (conversation) => {
                    if (conversation?.id) setActiveConversationId(conversation.id);
                  },
                },
              )
            }
            isCreating={isCreatingDirect}
            isDark={isDark}
            labels={labels}
            title={t.newMessage}
            searchPlaceholder={t.searchContacts}
            noResultsLabel={t.noContactsFound}
          />
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <CreateGroupModal
            onClose={() => setShowGroupModal(false)}
            onCreate={async (payload) => {
              const conversation = await createGroupAsync(payload);
              if (conversation?.id) setActiveConversationId(conversation.id);
              setShowGroupModal(false);
            }}
            isCreating={isCreatingGroup}
            isDark={isDark}
            labels={labels}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Forward Modal */}
      <AnimatePresence>
        {forwardingMsg && (
          <ForwardModal
            message={forwardingMsg}
            contacts={contacts}
            isDark={isDark}
            t={t}
            onForwardSend={handleForwardSend}
            onClose={() => setForwardingMsg(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Message Modal */}
      <AnimatePresence>
        {deletingMsg && (
          <DeleteConfirmModal
            msgText={deletingMsg.text}
            isMe={deletingMsg.senderId === "me"}
            onDeleteForMe={handleDeleteForMe}
            onDeleteForEveryone={handleDeleteForEveryone}
            onCancel={() => setDeletingMsgId(null)}
            isDark={isDark}
            title={t.deleteMessage}
            subtitle={t.cannotBeUndone}
            deleteForMeLabel={t.deleteForMe}
            deleteForMeDesc={t.deleteForMeDesc}
            deleteForEveryoneLabel={t.deleteForEveryone}
            deleteForEveryoneDesc={t.deleteForEveryoneDesc}
            cancelLabel={t.cancel}
            deletingForMeLabel={t.deletingForMe}
            deletingForEveryoneLabel={t.deletingForEveryone}
          />
        )}
      </AnimatePresence>

      {/* Delete Conversation Modal */}
      <AnimatePresence>
        {showDeleteConversation && activeContact && (
          <DeleteConversationModal
            contactName={activeContact.name}
            onConfirm={handleDeleteConversation}
            onCancel={() => setShowDeleteConversation(false)}
            isDark={isDark}
            title={t.deleteConversationTitle}
            descPrefix={t.deleteConversationDesc}
            deleteAllLabel={t.deleteAll}
            cancelLabel={t.cancel}
            shreddingLabel={t.shreddingConversation}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
