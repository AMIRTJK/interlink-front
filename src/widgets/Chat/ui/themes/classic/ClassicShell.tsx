import { AnimatePresence } from "framer-motion";
import {
  CHAT_LIST_PANEL_WIDTH,
  CHAT_LIST_PANEL_WIDTH_OVERLAY,
} from "../../../model/constants";
import type { IChatShellProps } from "../types";
import { ChatHeader } from "../../components/ChatHeader";
import { ChatListPanel } from "../../components/ChatListPanel";
import { ContactInfoDrawer } from "../../components/ContactInfoDrawer";
import { ThreadPanel } from "../../components/ThreadPanel";
import { ClassicConversation } from "./ClassicConversation";

// ─── Классическое оформление чата ─────────────────────────────────────────────
// Единое окно с градиентной шапкой: панель бесед и блок управления переезжают
// вместе по одному из четырёх краёв, беседа занимает остаток площади.

export const ClassicShell = ({
  state,
  variant,
  isExpanded,
  onToggleExpand,
  onRequestClose,
}: IChatShellProps) => {
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

  const isHorizontalLayout = layout === "top" || layout === "bottom";
  const mainAreaFlexDir = isHorizontalLayout ? "flex-col" : "flex-row";
  const chatListFirst = layout === "left" || layout === "top";

  // Во всплывающем окне блок управления шире на две кнопки («развернуть» и
  // «закрыть»), поэтому и панель бесед там шире — иначе ряд не влезает в одну строку.
  const listPanelWidth = isPage
    ? CHAT_LIST_PANEL_WIDTH
    : CHAT_LIST_PANEL_WIDTH_OVERLAY;

  // Панель бесед и градиентный блок управления — один переезжающий узел: при смене
  // макета они меняют место вместе, а блок кнопок всегда прилегает к внешнему краю
  // панели (для макета «снизу» — под ней, поэтому колонка разворачивается).
  const chatListGroup = (
    <div
      className={`flex flex-shrink-0 min-h-0 min-w-0 ${
        layout === "bottom" ? "flex-col-reverse" : "flex-col"
      } ${isHorizontalLayout ? "w-full" : ""}`}
      // Ширину в вертикальных макетах задаёт панель бесед: иначе колонку растянул
      // бы ряд кнопок по max-content и блок разъехался бы с панелью по краю.
      style={isHorizontalLayout ? undefined : { width: listPanelWidth }}
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
        t={t}
      />
      {/* Направление обёртки задаёт, по какой оси панель растягивается: в макетах
          сверху/снизу — на всю ширину, слева/справа — на всю оставшуюся высоту. */}
      <div
        className={`flex min-h-0 ${
          isHorizontalLayout ? "flex-col w-full" : "flex-1"
        }`}
      >
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
          width={listPanelWidth}
        />
      </div>
    </div>
  );

  // Рамка и внутренняя светлая подсветка нужны, только когда чат — окно с полями.
  // Край в край они превращаются в светлую полосу по периметру экрана.
  const cardBorder = "1px solid var(--th-sidebar-border)";
  const cardShadow = "var(--th-shadow-strong), var(--th-inset-highlight)";

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
          background: "var(--th-chat-shell-bg)",
          backdropFilter: "blur(30px)",
          border: isFullBleed ? "none" : cardBorder,
          boxShadow: isFullBleed ? "none" : cardShadow,
        }}
      >
        <div className={`flex flex-1 min-h-0 overflow-hidden ${mainAreaFlexDir}`}>
          {chatListFirst && chatListGroup}

          <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
            <ClassicConversation state={state} />

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

          {!chatListFirst && chatListGroup}
        </div>
      </div>
    </div>
  );
};
