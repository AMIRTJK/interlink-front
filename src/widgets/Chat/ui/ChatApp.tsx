import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Phone,
  Video,
  UserCog,
  MoreVertical,
  Smile,
  Paperclip,
  Sparkles,
  Clock3,
  Mic,
  Send,
  Languages,
  Edit3,
  Plus,
  UserPlus,
} from "lucide-react";
import { mockContacts as contacts } from "../model";
import { Lang } from "../lib/translations";
import { useChatAppState } from "../lib/useChatAppState";

// Components
import { LayoutSwitcher } from "./components/LayoutSwitcher";
import { ChatListPanel } from "./components/ChatListPanel";
import { StoryViewer } from "./components/StoryViewer";
import { SchedulePicker } from "./components/SchedulePicker";
import { EmojiPicker } from "./components/EmojiPicker";
import { PendingFilesBar } from "./components/PendingFilesBar";
import { VoiceRecorder } from "./components/VoiceRecorder";
import { AIPanel } from "./components/AIPanel";
import { ReplyBar } from "./components/ReplyBar";
import { MessageSearchBar } from "./components/MessageSearchBar";
import { PinnedBanner } from "./components/PinnedBanner";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";
import { DeleteConversationModal } from "./components/DeleteConversationModal";
import { IncomingCallScreen } from "./components/IncomingCallScreen";
import { ContactInfoDrawer } from "./components/ContactInfoDrawer";
import { ComposeModal } from "./components/ComposeModal";
import { ThreadPanel } from "./components/ThreadPanel";
import { ChatMessageItem } from "./components/ChatMessageItem";
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
}

export const ChatApp: React.FC<IProps> = ({
  onComposeStateChange,
  onRequestClose,
}) => {
  const state = useChatAppState(onComposeStateChange);

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
    activeContactId,
    setActiveContactId,
    switchDirection,
    input,
    setInput,
    searchQuery,
    setSearchQuery,
    isTyping,
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
    searchMatchIndex,
    showPinnedBanner,
    setShowPinnedBanner,
    showComposeModal,
    setShowComposeModal,
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
    deletingMsgId,
    setDeletingMsgId,
    showDeleteConversation,
    setShowDeleteConversation,
    contactUnreads,
    fileInputRef,
    scrollRef,
    messageRefs,
    activeContact,
    currentMessages,
    pinnedMessage,
    searchMatches,
    openThreadMsg,
    lastReceivedMessage,
    deletingMsg,
    totalUnread,
    handleContactSwitch,
    handleSearchPrev,
    handleSearchNext,
    handleMsgSearchChange,
    handleSend,
    handleSchedule,
    handleSendVoice,
    handleForwardSend,
    handleDeleteForMe,
    handleDeleteForEveryone,
    handleDeleteConversation,
    handleSendThread,
    handlePinMessage,
    handleReaction,
    handleEmojiSelect,
    handleFileChange,
    removePendingFile,
    handleJumpToPinned,
    handleAcceptCall,
    handleDeclineCall,
    handleEndCall,
    isHighlighted,
    isCurrentMatch,
  } = state;

  const isHorizontalLayout = layout === "top" || layout === "bottom";
  const mainAreaFlexDir = isHorizontalLayout ? "flex-col" : "flex-row";
  const chatListFirst = layout === "left" || layout === "top";

  const chatVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir * 32 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: -dir * 32 }),
  };

  const chatListPanel = (
    <ChatListPanel
      layout={layout}
      contacts={contacts}
      activeContactId={activeContactId}
      contactUnreads={contactUnreads}
      searchQuery={searchQuery}
      onContactSwitch={handleContactSwitch}
      onComposeOpen={() => setShowComposeModal(true)}
      onSearchChange={setSearchQuery}
      isDark={isDark}
    />
  );

  const chatWindow = (
    <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
      {/* Chat sub-header */}
      <div
        className={`flex items-center justify-between px-6 py-3 border-b flex-shrink-0 ${isDark ? "border-white/8" : "border-black/6"}`}
        style={{
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        <motion.div
          key={`header-${activeContactId}`}
          initial={{ opacity: 0, x: switchDirection * 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-violet-300/40"
            />
            {activeContact.online && (
              <span
                className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-transparent rounded-full"
                style={{ boxShadow: "0 0 6px rgba(74,222,128,0.7)" }}
              />
            )}
          </div>
          <div>
            <h2
              className={`font-semibold text-sm ${isDark ? "text-white" : "text-gray-900"}`}
            >
              {activeContact.name}
            </h2>
            <p
              className={`text-xs ${isDark ? "text-white/50" : "text-gray-500"}`}
            >
              {activeContact.online ? t.online : t.lastSeen}
            </p>
          </div>
        </motion.div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setShowMsgSearch((v) => !v);
              handleMsgSearchChange("");
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${showMsgSearch ? "bg-violet-500/30 text-violet-300" : isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setIncomingCall({ callType: "audio" })}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-amber-500 transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-amber-500/15" : "hover:bg-amber-50"}`}
          >
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setCallState("video")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
          >
            <Video className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setCallState("audio")}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
          >
            <Phone className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setShowContactDrawer((v) => !v)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${showContactDrawer ? "bg-violet-500/30 text-violet-500" : isDark ? "text-white/50 hover:bg-white/10" : "text-gray-500 hover:bg-black/6"}`}
          >
            <UserCog className="w-4.5 h-4.5" />
          </button>
          <div
            className={`w-px h-5 mx-1 ${isDark ? "bg-white/15" : "bg-black/10"}`}
          />
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
              boxShadow: isDark
                ? "0 0 16px rgba(124,58,237,0.5)"
                : "0 0 12px rgba(124,58,237,0.35)",
            }}
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

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

      {/* Messages area */}
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: isDark ? "transparent" : "rgba(248,247,255,0.5)",
        }}
      >
        <AnimatePresence mode="wait" custom={switchDirection}>
          <motion.div
            key={activeContactId}
            custom={switchDirection}
            variants={chatVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            ref={scrollRef}
            className="absolute inset-0 overflow-y-auto px-6 pt-14 pb-6 space-y-5"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: isDark
                ? "rgba(167,139,250,0.3) transparent"
                : "rgba(167,139,250,0.25) transparent",
              overflowX: "clip",
            }}
          >
            {currentMessages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                msg={msg}
                isMe={msg.senderId === "me"}
                activeContact={activeContact}
                hoveredMessageId={hoveredMessageId}
                activeActionMsgId={activeActionMsgId}
                isDark={isDark}
                lang={lang}
                t={t}
                highlighted={isHighlighted(msg.id)}
                currentMatchMsg={isCurrentMatch(msg.id)}
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
                setMessageRef={(id, el) => {
                  messageRefs.current[id] = el;
                }}
              />
            ))}

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-end gap-2 justify-start"
                >
                  <img
                    src={activeContact.avatar}
                    alt={activeContact.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-violet-300/40"
                  />
                  <div
                    className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-md"
                    style={{
                      background: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(255,255,255,0.85)",
                    }}
                  >
                    <span className="text-xs text-violet-300 mr-1 font-medium">
                      {activeContact.name} {t.typing}
                    </span>
                    <span className="flex items-center gap-1">
                      <motion.span
                        className="w-1 h-1 rounded-full bg-violet-300"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      />
                      <motion.span
                        className="w-1 h-1 rounded-full bg-violet-300"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                      <motion.span
                        className="w-1 h-1 rounded-full bg-violet-300"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                      />
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

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

      {/* Input Bar */}
      <div
        className={`px-6 py-4 border-t flex-shrink-0 ${isDark ? "border-white/8" : "border-black/5"}`}
        style={{
          background: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.4)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          className="relative flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(255,255,255,0.95)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.15)"
              : "1px solid rgba(167,139,250,0.25)",
          }}
        >
          {isRecording ? (
            <VoiceRecorder
              onSend={handleSendVoice}
              onCancel={() => setIsRecording(false)}
              isDark={isDark}
            />
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"} ${showEmojiPicker ? (isDark ? "text-violet-300 bg-white/10" : "text-violet-650 bg-violet-100") : isDark ? "text-white/40 hover:text-white/70" : "text-gray-400 hover:text-gray-650"}`}
                >
                  <Smile className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {showEmojiPicker && (
                    <EmojiPicker
                      categories={EMOJI_CATEGORIES_LOCALIZED}
                      onSelect={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                      isDark={isDark}
                    />
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8 text-white/40 hover:text-white/70" : "hover:bg-black/5 text-gray-400 hover:text-gray-650"}`}
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
              />
              <button
                onClick={() => setShowAIPanel((v) => !v)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"} ${showAIPanel ? (isDark ? "text-violet-300 bg-white/10" : "text-violet-650 bg-violet-100") : isDark ? "text-white/40 hover:text-violet-300" : "text-gray-400 hover:text-violet-600"}`}
              >
                <Sparkles className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder={t.typeMessage}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className={`flex-1 bg-transparent outline-none text-sm px-2 py-2 ${isDark ? "placeholder-white/25 text-white" : "placeholder-gray-400 text-gray-800"}`}
              />
              <div className="relative flex items-center">
                <button
                  onClick={() => setShowSchedulePicker((v) => !v)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 flex-shrink-0 ${isDark ? "hover:bg-white/8" : "hover:bg-black/5"} ${showSchedulePicker ? (isDark ? "text-violet-300 bg-white/10" : "text-violet-650 bg-violet-100") : isDark ? "text-white/40 hover:text-amber-400" : "text-gray-400 hover:text-amber-600"}`}
                >
                  <Clock3 className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {showSchedulePicker && (
                    <SchedulePicker
                      options={SCHEDULE_OPTIONS_LOCALIZED}
                      title={t.scheduleMessage}
                      onSchedule={handleSchedule}
                      onClose={() => setShowSchedulePicker(false)}
                      isDark={isDark}
                    />
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => setIsRecording(true)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-110 ${isDark ? "hover:bg-white/8 text-white/40 hover:text-red-400" : "hover:bg-black/5 text-gray-400 hover:text-red-550"}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() && pendingFiles.length === 0}
                className="w-9 h-9 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:scale-110 hover:brightness-110 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4)",
                  boxShadow: "0 0 16px rgba(124,58,237,0.5)",
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );

  return (
    <div
      className="w-full h-screen flex items-center justify-end py-4 pl-4 font-sans relative overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onRequestClose?.();
      }}
    >
      <div
        className="w-full max-w-7xl h-full max-h-[900px] flex flex-col rounded-l-2xl overflow-hidden shadow-2xl relative"
        style={{
          background: isDark ? "rgba(10,4,30,0.55)" : "rgba(255,255,255,0.72)",
          backdropFilter: "blur(30px)",
          border: isDark
            ? "1px solid rgba(167,139,250,0.2)"
            : "1px solid rgba(167,139,250,0.18)",
          boxShadow: isDark
            ? "0 30px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
            : "0 30px 80px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Top Header Bar */}
        <header
          className="flex-shrink-0"
          style={{
            background: isDark
              ? "linear-gradient(135deg,rgba(76,29,149,0.6),rgba(124,58,237,0.45),rgba(6,182,212,0.3))"
              : "linear-gradient(135deg,rgba(124,58,237,0.85),rgba(139,92,246,0.8),rgba(6,182,212,0.7))",
            borderBottom: isDark
              ? "1px solid rgba(167,139,250,0.2)"
              : "1px solid rgba(124,58,237,0.25)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-white"
                >
                  <path
                    d="M12 2C7 2 3 5.5 3 10c0 2.5 1.3 4.7 3.3 6.2L5 21l4.5-2.3c.8.2 1.6.3 2.5.3 5 0 9-3.5 9-8s-4-9-9-9z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span
                className="font-bold text-lg tracking-wider text-white"
                style={{
                  textShadow: "0 0 20px rgba(167,139,250,0.5)",
                }}
              >
                TECH
              </span>
              {totalUnread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="min-w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1"
                  style={{
                    background: "linear-gradient(135deg,#ef4444,#f97316)",
                  }}
                >
                  {totalUnread > 99 ? "99+" : totalUnread}
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <LayoutSwitcher
                layout={layout}
                onChange={setLayout}
                isDark={isDark}
              />
              <div className="w-px h-5 bg-white/15" />
              <button
                onClick={cycleLang}
                className="h-8 px-3 rounded-full text-white flex items-center gap-1.5 transition-all duration-200 ease-in-out hover:bg-white/20 hover:scale-105 text-xs font-bold"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <Languages className="w-4.5 h-4.5" />
                <span>{LANG_LABELS[lang]}</span>
              </button>
              <button
                onClick={() => setShowComposeModal(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:bg-white/25 hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Edit3 className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setShowComposeModal(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 ease-in-out hover:bg-white/18 hover:scale-110"
                style={{
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <Plus className="w-4.5 h-4.5" strokeWidth={2.5} />
              </button>
              <button className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-white/15 hover:scale-110 flex items-center justify-center text-white/70">
                <UserPlus className="w-4.5 h-4.5" />
              </button>
              <button className="w-8 h-8 rounded-full transition-all duration-200 ease-in-out hover:bg-white/15 hover:scale-110 flex items-center justify-center text-white/70">
                <MoreVertical className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area with dynamic layout */}
        <div
          className={`flex flex-1 min-h-0 overflow-hidden ${mainAreaFlexDir}`}
        >
          {chatListFirst && chatListPanel}

          <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
            {chatWindow}

            <AnimatePresence>
              {showContactDrawer && !openThreadMsgId && (
                <ContactInfoDrawer
                  contact={activeContact}
                  onClose={() => setShowContactDrawer(false)}
                  onDeleteConversation={() => {
                    setShowDeleteConversation(true);
                    setShowContactDrawer(false);
                  }}
                  isDark={isDark}
                  t={t}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {openThreadMsg && (
                <ThreadPanel
                  parentMsg={openThreadMsg}
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
        {incomingCall && (
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
        {callState !== "none" && (
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
            onSelectContact={(id) => setActiveContactId(id)}
            isDark={isDark}
            title={t.newMessage}
            searchPlaceholder={t.searchContacts}
            noResultsLabel={t.noContactsFound}
            groupBadge={t.groupBadge}
          />
        )}
      </AnimatePresence>

      {/* Forward Modal */}
      <AnimatePresence>
        {forwardingMsg && (
          <ForwardModal
            message={forwardingMsg}
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
        {showDeleteConversation && (
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
