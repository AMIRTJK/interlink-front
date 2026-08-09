import { useQueryClient } from "@tanstack/react-query";
import { buildFormData, useMutationQuery } from "@shared/lib";
import type { IChatConversation, TChatMemberRole } from "../model";
import { chatUrls } from "./chatUrls";

// Создание бесед, настройки и состав участников.

export interface ICreateDirectPayload {
  user_id: number;
}

export interface ICreateGroupPayload {
  title: string;
  memberIds: number[];
  avatar?: File | null;
}

export interface IConversationSettingsPayload {
  conversationId: number;
  is_starred?: boolean;
  is_archived?: boolean;
  /** ISO-время, до которого беседа заглушена; `null` снимает заглушение. */
  muted_until?: string | null;
}

export interface IMembersPayload {
  conversationId: number;
  user_ids: number[];
}

export interface IMemberRolePayload {
  conversationId: number;
  userId: number;
  role: TChatMemberRole;
}

const LIST_KEYS = [chatUrls.conversations, chatUrls.counters];

export const useConversationActions = (activeConversationId: number | null) => {
  const queryClient = useQueryClient();
  const conversationKeys = activeConversationId
    ? [...LIST_KEYS, chatUrls.conversation(activeConversationId)]
    : LIST_KEYS;

  const createDirect = useMutationQuery<ICreateDirectPayload, IChatConversation>({
    url: chatUrls.createDirect,
    method: "POST",
    // Бэкенд возвращает существующий диалог, если он уже был, — для пользователя
    // это просто открытие чата, а не создание, поэтому без тоста об успехе.
    messages: { suppressSuccessToast: true, invalidate: LIST_KEYS },
  });

  const createGroup = useMutationQuery<ICreateGroupPayload, IChatConversation>({
    url: chatUrls.createGroup,
    method: "POST",
    transformBody: (payload) =>
      buildFormData({
        title: payload.title,
        member_ids: payload.memberIds,
        avatar: payload.avatar ?? undefined,
      }),
    messages: { success: "Группа создана", invalidate: LIST_KEYS },
  });

  const updateSettings = useMutationQuery<IConversationSettingsPayload>({
    url: (payload) => chatUrls.settings(payload.conversationId),
    method: "PATCH",
    transformBody: ({ conversationId: _conversationId, ...settings }) => settings,
    messages: { suppressSuccessToast: true, invalidate: conversationKeys },
  });

  const deleteConversation = useMutationQuery<{
    conversationId: number;
    forEveryone?: boolean;
  }>({
    url: (payload) => chatUrls.conversation(payload.conversationId),
    method: "DELETE",
    transformBody: (payload) => ({
      for_everyone: payload.forEveryone ?? false,
    }),
    messages: {
      success: "История переписки очищена",
      invalidate: conversationKeys,
    },
    queryOptions: {
      // Очистка стирает историю, а не беседу, поэтому лента остаётся смонтированной
      // со старым кэшем: без явной инвалидации сообщений экран не перерисуется,
      // пока пользователь не переключит чат. Ключ берём из переменных мутации.
      onSuccess: (_data, variables) => {
        queryClient.resetQueries({
          queryKey: [chatUrls.messages(variables.conversationId)],
        });
        queryClient.invalidateQueries({
          queryKey: [chatUrls.messages(variables.conversationId)],
        });
      },
    },
  });

  const addMembers = useMutationQuery<IMembersPayload>({
    url: (payload) => chatUrls.members(payload.conversationId),
    method: "POST",
    transformBody: (payload) => ({ user_ids: payload.user_ids }),
    messages: { success: "Участники добавлены", invalidate: conversationKeys },
  });

  const removeMember = useMutationQuery<{
    conversationId: number;
    userId: number;
  }>({
    url: (payload) => chatUrls.member(payload.conversationId, payload.userId),
    method: "DELETE",
    messages: { success: "Участник удалён", invalidate: conversationKeys },
  });

  const changeMemberRole = useMutationQuery<IMemberRolePayload>({
    url: (payload) => chatUrls.member(payload.conversationId, payload.userId),
    method: "PATCH",
    transformBody: (payload) => ({ role: payload.role }),
    messages: { success: "Роль изменена", invalidate: conversationKeys },
  });

  return {
    createDirect: createDirect.mutate,
    createDirectAsync: createDirect.mutateAsync,
    isCreatingDirect: createDirect.isLoading,
    createGroupAsync: createGroup.mutateAsync,
    isCreatingGroup: createGroup.isLoading,
    updateSettings: updateSettings.mutate,
    deleteConversation: deleteConversation.mutate,
    addMembers: addMembers.mutate,
    removeMember: removeMember.mutate,
    changeMemberRole: changeMemberRole.mutate,
  };
};
