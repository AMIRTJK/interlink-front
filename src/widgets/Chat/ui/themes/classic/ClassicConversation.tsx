import { Can, If } from "@shared/ui";
import { CHAT_PERMISSIONS } from "../../../model/constants";
import type { TChatAppState } from "../../../lib/useChatAppState";
import { ChatSubHeader } from "../../components/ChatSubHeader";
import { ConversationFeed } from "../../components/ConversationFeed";
import { MessageComposer } from "../../components/MessageComposer";

// Колонка открытой беседы классического оформления: шапка беседы, лента и поле
// ввода одним полотном. Вынесена из оболочки, чтобы та осталась про раскладку
// панелей.

interface IProps {
  state: TChatAppState;
}

export const ClassicConversation = ({ state }: IProps) => {
  const {
    t,
    isDark,
    activeContact,
    activeConversationId,
    isLoadingChats,
    isSending,
    input,
    setInput,
    setCallState,
    setIncomingCall,
    showEmojiPicker,
    setShowEmojiPicker,
    EMOJI_CATEGORIES_LOCALIZED,
    SCHEDULE_OPTIONS_LOCALIZED,
    showSchedulePicker,
    setShowSchedulePicker,
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
    showAIPanel,
    setShowAIPanel,
    isRecording,
    setIsRecording,
    handleSend,
    handleSchedule,
    handleSendVoice,
  } = state;

  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
      <If is={!activeContact}>
        <div className="flex-1 flex flex-col items-center justify-center gap-1 text-center px-6">
          <p className="text-sm font-medium text-[var(--th-text-muted)]">
            {isLoadingChats ? t.loadingChats : t.noChats}
          </p>
          <p className="text-xs text-[var(--th-text-faint)]">{t.noMessagesHint}</p>
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

          <ConversationFeed state={state} activeContact={activeContact} />

          {/* Без права chat.send поле ввода не работает, но исчезать молча оно
              не должно — иначе экран выглядит сломанным. */}
          <Can
            permission={CHAT_PERMISSIONS.SEND}
            fallback={
              <div className="px-6 py-4 border-t text-center text-xs border-[var(--th-divider)] text-[var(--th-text-faint)]">
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
              onAttachFiles={addFiles}
            />
          </Can>
        </>
      )}
    </main>
  );
};
