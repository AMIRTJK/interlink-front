import { useMemo } from "react";
import { Can, If } from "@shared/ui";
import { CHAT_PERMISSIONS } from "../../../model/constants";
import type { TChatAppState } from "../../../lib/useChatAppState";
import { ConversationFeed } from "../../components/ConversationFeed";
import { ModernTopBar } from "./ModernTopBar";
import { ModernComposer } from "./ModernComposer";

// Колонка беседы современного оформления: шапка, лента и поле ввода — три
// отдельные карточки на общем фоне.

interface IProps {
  state: TChatAppState;
  isExpanded: boolean;
  onToggleExpand?: () => void;
  onRequestClose?: () => void;
}

export const ModernConversation = ({
  state,
  isExpanded,
  onToggleExpand,
  onRequestClose,
}: IProps) => {
  const {
    t,
    isDark,
    activeContact,
    activeConversationId,
    messages,
    isLoadingChats,
    input,
    setInput,
    showEmojiPicker,
    setShowEmojiPicker,
    EMOJI_CATEGORIES_LOCALIZED,
    pendingFiles,
    addFiles,
    handleFileChange,
    handleEmojiSelect,
    fileInputRef,
    showContactDrawer,
    setShowContactDrawer,
    showMsgSearch,
    setShowMsgSearch,
    handleMsgSearchChange,
    pinnedMessage,
    showPinnedBanner,
    setShowPinnedBanner,
    handleJumpToPinned,
    setOpenThreadMsgId,
    setShowComposeModal,
    isRecording,
    setIsRecording,
    handleSend,
    handleSendVoice,
  } = state;

  // «Ветки» в шапке открывают последнее обсуждение беседы: отдельного списка
  // тредов в системе нет, а поднимать нужно то, где разговор ещё идёт.
  const latestThreadMsgId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if ((messages[i].threadCount ?? 0) > 0) return messages[i].id;
    }
    return null;
  }, [messages]);

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
      <ModernTopBar
        activeContact={activeContact}
        t={t}
        showMsgSearch={showMsgSearch}
        showContactDrawer={showContactDrawer}
        hasPinned={!!pinnedMessage}
        isPinnedShown={showPinnedBanner && !!pinnedMessage}
        hasThreads={!!latestThreadMsgId}
        onTogglePinned={() => {
          // Плашка уже на экране — значит от кнопки ждут перехода к самому
          // закреплённому сообщению, а не повторного показа плашки.
          if (showPinnedBanner) {
            handleJumpToPinned();
            return;
          }
          setShowPinnedBanner(true);
        }}
        onOpenThreads={() => {
          if (!latestThreadMsgId) return;
          setOpenThreadMsgId(latestThreadMsgId);
          setShowContactDrawer(false);
        }}
        onComposeOpen={() => setShowComposeModal(true)}
        onToggleSearch={() => {
          setShowMsgSearch((v) => !v);
          handleMsgSearchChange("");
        }}
        onToggleDrawer={() => setShowContactDrawer((v) => !v)}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        onRequestClose={onRequestClose}
      />

      <div className="chat-modern-card flex-1 min-h-0 flex flex-col overflow-hidden">
        <If is={!activeContact}>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center px-6">
            <p className="text-sm font-medium text-[var(--th-text-muted)]">
              {isLoadingChats ? t.loadingChats : t.noChats}
            </p>
            <p className="text-xs text-[var(--th-text-faint)]">
              {t.noMessagesHint}
            </p>
          </div>
        </If>

        {activeContact && (
          <ConversationFeed state={state} activeContact={activeContact} />
        )}
      </div>

      {/* Без права chat.send поле ввода не работает, но исчезать молча оно
          не должно — иначе экран выглядит сломанным. */}
      <Can
        permission={CHAT_PERMISSIONS.SEND}
        fallback={
          <div className="chat-modern-card px-6 py-4 text-center text-xs flex-shrink-0 text-[var(--th-text-faint)]">
            {t.noSendPermission}
          </div>
        }
      >
        <ModernComposer
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          canSend={!!activeConversationId}
          hasPendingFiles={pendingFiles.length > 0}
          isDark={isDark}
          t={t}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          emojiCategories={EMOJI_CATEGORIES_LOCALIZED}
          onEmojiSelect={handleEmojiSelect}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          onSendVoice={handleSendVoice}
          onAttachFiles={addFiles}
        />
      </Can>
    </div>
  );
};
