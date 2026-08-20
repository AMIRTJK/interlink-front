import { AnimatePresence } from "framer-motion";
import type { Contact } from "../../model";
import { formatRepliesCount } from "../../lib/chatFormat";
import type { TChatAppState } from "../../lib/useChatAppState";
import { MessageSearchBar } from "./MessageSearchBar";
import { PinnedBanner } from "./PinnedBanner";
import { MessageList } from "./MessageList";
import { AIPanel } from "./AIPanel";
import { ReplyBar } from "./ReplyBar";
import { LinkPreviewBar } from "./LinkPreviewBar";
import { PendingFilesBar } from "./PendingFilesBar";

// Лента беседы со всем, что к ней прилегает: поиск по сообщениям, закреплённое,
// сами сообщения, подсказки ИИ, цитата ответа, превью ссылки и очередь вложений.
// От оформления не зависит — оформления различаются тем, во что её кладут, —
// поэтому обвязка одна на всех и не расходится между темами.

interface IProps {
  state: TChatAppState;
  activeContact: Contact;
}

export const ConversationFeed = ({ state, activeContact }: IProps) => {
  const {
    t,
    isDark,
    lang,
    currentUserId,
    messages,
    isLoadingMessages,
    isMessagesError,
    hasOlder,
    isLoadingOlder,
    loadOlder,
    typingNames,
    input,
    setInput,
    pendingFiles,
    removePendingFile,
    scrollRef,
    setMessageRef,
    hoveredMessageId,
    setHoveredMessageId,
    activeActionMsgId,
    setActiveActionMsgId,
    setShowContactDrawer,
    showMsgSearch,
    setShowMsgSearch,
    msgSearchQuery,
    handleMsgSearchChange,
    searchMatchIndex,
    searchMatches,
    handleSearchPrev,
    handleSearchNext,
    pinnedMessage,
    showPinnedBanner,
    setShowPinnedBanner,
    handleJumpToPinned,
    showAIPanel,
    setShowAIPanel,
    lastReceivedMessage,
    replyingTo,
    setReplyingTo,
    setForwardingMsg,
    setDeletingMsgId,
    setOpenThreadMsgId,
    handleSend,
    handleReaction,
    handlePinMessage,
    handleMessagesScroll,
    handleJumpToMessage,
    handleReturnToMessage,
    targetHighlightedMessageId,
    returnToMessageId,
    showScrollBottom,
    scrollToBottom,
    isHighlighted,
    isCurrentMatch,
    getUnreadThreadCount,
  } = state;

  return (
    <>
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
        onLoadOlder={loadOlder}
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
        getUnreadThreadCount={getUnreadThreadCount}
        setMessageRef={setMessageRef}
        targetHighlightedMessageId={targetHighlightedMessageId}
        returnToMessageId={returnToMessageId}
        onJumpToMessage={handleJumpToMessage}
        onReturnToMessage={handleReturnToMessage}
        showScrollBottom={showScrollBottom}
        onScrollToBottom={scrollToBottom}
        currentUserId={currentUserId}
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

      <LinkPreviewBar text={input} isDark={isDark} t={t} />

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
    </>
  );
};
