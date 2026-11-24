import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Tooltip } from "@shared/ui";
import type { TTopicId } from "../../../api/topics";
import type { TConversationTopicsState } from "../../../lib/useConversationTopics";
import { IDLE_MODE, TOPIC_TEXTS, type TTopicEditMode } from "./model";
import { TopicTab } from "./TopicTab";
import { TopicNameForm } from "./TopicNameForm";
import { TopicDeleteConfirm } from "./TopicDeleteConfirm";
import { TopicsLocalBadge } from "./TopicsLocalBadge";

// Полоса топиков личного чата под шапкой беседы: вкладки, создание,
// переименование и удаление. Данные и действия приходят из useConversationTopics.

// Родитель монтирует полосу с key беседы — режим редактирования при переходе
// в другую беседу сбрасывается сам.

interface IProps {
  topicsState: TConversationTopicsState;
}

export const ChatTopicsBar = ({ topicsState }: IProps) => {
  const { topics, activeTopicId, isMutating, selectTopic, createTopic, renameTopic, deleteTopic } =
    topicsState;
  const [mode, setMode] = useState<TTopicEditMode>(IDLE_MODE);

  const closeEditor = useCallback(() => setMode(IDLE_MODE), []);

  const handleSelect = useCallback(
    (topicId: TTopicId) => {
      selectTopic(topicId);
      setMode(IDLE_MODE);
    },
    [selectTopic],
  );

  const handleRename = useCallback((topicId: TTopicId) => setMode({ kind: "rename", topicId }), []);
  const handleRemove = useCallback((topicId: TTopicId) => setMode({ kind: "remove", topicId }), []);

  const editedTopic =
    mode.kind === "rename" || mode.kind === "remove"
      ? topics.find((topic) => topic.id === mode.topicId)
      : undefined;

  return (
    <div className="flex-shrink-0 border-b border-[var(--th-divider)]">
      <div className="flex items-center gap-2 px-4 sm:px-6 py-2">
        <div
          role="tablist"
          aria-label={TOPIC_TEXTS.barLabel}
          className="min-w-0 flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {topics.map((topic) => (
            <TopicTab
              key={topic.id}
              topic={topic}
              isActive={topic.id === activeTopicId}
              onSelect={handleSelect}
              onRename={handleRename}
              onRemove={handleRemove}
            />
          ))}
        </div>
        <div className="flex-shrink-0 mr-auto flex items-center">
          <Tooltip title={TOPIC_TEXTS.create}>
            <button
              type="button"
              aria-label={TOPIC_TEXTS.create}
              onClick={() => setMode({ kind: "create" })}
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center border border-dashed transition-colors duration-200 border-[var(--th-divider)] text-[var(--th-text-muted)] hover:bg-[var(--th-hover-bg)] hover:text-[var(--th-accent-text)]"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>
        <TopicsLocalBadge />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mode.kind === "create" && (
          <TopicNameForm
            key="create"
            isSaving={isMutating}
            onSubmit={(title) => {
              createTopic(title);
              closeEditor();
            }}
            onCancel={closeEditor}
          />
        )}
        {mode.kind === "rename" && editedTopic && (
          <TopicNameForm
            key={`rename-${editedTopic.id}`}
            initialTitle={editedTopic.title}
            isSaving={isMutating}
            onSubmit={(title) => {
              renameTopic(editedTopic.id, title);
              closeEditor();
            }}
            onCancel={closeEditor}
          />
        )}
        {mode.kind === "remove" && editedTopic && (
          <TopicDeleteConfirm
            key={`remove-${editedTopic.id}`}
            title={editedTopic.title}
            isDeleting={isMutating}
            onConfirm={() => {
              deleteTopic(editedTopic.id);
              closeEditor();
            }}
            onCancel={closeEditor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
