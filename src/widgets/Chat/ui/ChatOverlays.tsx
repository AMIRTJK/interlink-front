import { AnimatePresence } from "framer-motion";
import type { TChatAppState } from "../lib/useChatAppState";
import { StoryViewer } from "./components/StoryViewer";
import { IncomingCallScreen } from "./components/IncomingCallScreen";
import { CallOverlayModal } from "./components/CallOverlayModal";
import { ComposeModal } from "./components/ComposeModal";
import { CreateGroupModal } from "./components/CreateGroupModal";
import { ForwardModal } from "./components/ForwardModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { DeleteConversationModal } from "./components/DeleteConversationModal";

// Модальные окна и полноэкранные слои чата. От оформления не зависят: истории,
// звонки, создание беседы и подтверждения удаления выглядят одинаково в любой
// теме, поэтому живут здесь, а не в оболочках, и не дублируются между ними.

interface IProps {
  state: TChatAppState;
}

export const ChatOverlays = ({ state }: IProps) => {
  const {
    isDark,
    t,
    labels,
    activeContact,
    contacts,
    viewingStory,
    setViewingStory,
    incomingCall,
    callState,
    isVideoOff,
    isMuted,
    callDuration,
    handleAcceptCall,
    handleDeclineCall,
    handleEndCall,
    setIsMuted,
    setIsVideoOff,
    setCallState,
    showComposeModal,
    setShowComposeModal,
    createDirect,
    isCreatingDirect,
    setActiveConversationId,
    showGroupModal,
    setShowGroupModal,
    createGroupAsync,
    isCreatingGroup,
    forwardingMsg,
    setForwardingMsg,
    handleForwardSend,
    deletingMsg,
    canDeleteDeletingMsgForEveryone,
    handleDeleteForMe,
    handleDeleteForEveryone,
    setDeletingMsgId,
    showDeleteConversation,
    setShowDeleteConversation,
    handleDeleteConversation,
  } = state;

  return (
    <>
      <AnimatePresence>
        {viewingStory && (
          <StoryViewer
            contact={viewingStory}
            onClose={() => setViewingStory(null)}
            hoursAgo={t.hoursAgo}
          />
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {deletingMsg && (
          <DeleteConfirmModal
            msgText={deletingMsg.text}
            canDeleteForEveryone={canDeleteDeletingMsgForEveryone}
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

      <AnimatePresence>
        {showDeleteConversation && activeContact && (
          <DeleteConversationModal
            contactName={activeContact.name}
            onDeleteForMe={handleDeleteConversation}
            onCancel={() => setShowDeleteConversation(false)}
            isDark={isDark}
            title={t.deleteConversationTitle}
            descPrefix={t.deleteConversationDesc}
            deleteForMeLabel={t.deleteConversationForMe}
            deleteForMeDesc={t.deleteConversationForMeDesc}
            cancelLabel={t.cancel}
            deletingForMeLabel={t.deletingForMe}
          />
        )}
      </AnimatePresence>
    </>
  );
};
